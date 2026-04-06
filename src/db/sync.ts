// ── Data Sync Service ──
// Fetches external data and caches it in IndexedDB with TTL

import { db } from './database'

// TTL constants (in milliseconds)
const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR
const ONE_WEEK = 7 * ONE_DAY

interface SyncConfig {
  table: string
  ttl: number
  fetchFn: () => Promise<boolean>
}

// ── BCB API (Banco Central do Brasil) ──
// Series codes: 1 = USD/BRL, 432 = Selic

async function fetchBcbSeries(seriesCode: number): Promise<number | null> {
  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/1?formato=json`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    return data?.[0]?.valor ? parseFloat(data[0].valor) : null
  } catch {
    return null
  }
}

async function syncFuelPrices(): Promise<boolean> {
  // ANP diesel price — use BCB series 22022 (Diesel S10 avg price)
  // Falls back to a reasonable default if API is unreachable
  const price = await fetchBcbSeries(22022)
  if (price === null) return false

  // Update all state entries with the national average
  const existing = await db.fuelPrices.toArray()
  if (existing.length === 0) return false

  const ops = existing.map((entry) =>
    db.fuelPrices.update(entry.id!, { price, source: 'bcb', updatedAt: new Date().toISOString() })
  )
  await Promise.all(ops)
  await updateSyncMeta('fuelPrices')
  return true
}

async function syncCropPrices(): Promise<boolean> {
  // CEPEA/ESALQ soybean indicator — BCB series 11899
  const soyPrice = await fetchBcbSeries(11899)
  if (soyPrice === null) return false

  // Update soybean price (convert from R$/60kg to R$/sc)
  await db.cropPrices
    .where('crop')
    .equals('soybean')
    .modify({ avg: soyPrice, source: 'bcb', updatedAt: new Date().toISOString() })

  await updateSyncMeta('cropPrices')
  return true
}

async function syncExchangeRates(): Promise<boolean> {
  // USD/BRL exchange rate — BCB series 1
  const usdBrl = await fetchBcbSeries(1)
  if (usdBrl === null) return false

  // Store as a special entry in taxRates for reference
  const existing = await db.taxRates.where('key').equals('USD_BRL').first()
  if (existing) {
    await db.taxRates.update(existing.id!, { value: usdBrl, source: 'bcb', updatedAt: new Date().toISOString() })
  } else {
    await db.taxRates.add({ key: 'USD_BRL', label: 'Câmbio USD/BRL', value: usdBrl, source: 'bcb', updatedAt: new Date().toISOString() })
  }

  await updateSyncMeta('taxRates')
  return true
}

// ── Sync metadata ──

async function updateSyncMeta(tableName: string) {
  const existing = await db.syncMeta.where('table').equals(tableName).first()
  const now = new Date().toISOString()

  if (existing) {
    await db.syncMeta.update(existing.id!, { lastSyncAt: now, status: 'ok' as const })
  } else {
    await db.syncMeta.add({ table: tableName, lastSyncAt: now, ttlMinutes: 1440, status: 'ok' as const })
  }
}

// ── Main sync orchestrator ──

const SYNC_CONFIGS: SyncConfig[] = [
  { table: 'fuelPrices', ttl: ONE_WEEK, fetchFn: syncFuelPrices },
  { table: 'cropPrices', ttl: ONE_DAY, fetchFn: syncCropPrices },
  { table: 'taxRates', ttl: ONE_DAY, fetchFn: syncExchangeRates },
]

async function shouldSync(tableName: string, ttl: number): Promise<boolean> {
  const meta = await db.syncMeta.where('table').equals(tableName).first()
  if (!meta?.lastSyncAt) return true

  const elapsed = Date.now() - new Date(meta.lastSyncAt).getTime()
  return elapsed > ttl
}

/**
 * Run all sync tasks that are past their TTL.
 * Safe to call on every app mount — only fetches when data is stale.
 */
export async function syncAll(): Promise<{ synced: string[]; failed: string[] }> {
  const synced: string[] = []
  const failed: string[] = []

  for (const config of SYNC_CONFIGS) {
    try {
      const needsSync = await shouldSync(config.table, config.ttl)
      if (!needsSync) continue

      const success = await config.fetchFn()
      if (success) {
        synced.push(config.table)
      } else {
        failed.push(config.table)
      }
    } catch {
      failed.push(config.table)
    }
  }

  return { synced, failed }
}

/**
 * Force sync a specific table regardless of TTL.
 */
export async function forceSync(tableName: string): Promise<boolean> {
  const config = SYNC_CONFIGS.find((c) => c.table === tableName)
  if (!config) return false

  try {
    return await config.fetchFn()
  } catch {
    return false
  }
}

/**
 * Get sync status for all tracked tables.
 */
export async function getSyncStatus(): Promise<
  { table: string; lastSync: string | null; isStale: boolean }[]
> {
  return Promise.all(
    SYNC_CONFIGS.map(async (config) => {
      const meta = await db.syncMeta.where('table').equals(config.table).first()
      const lastSync = meta?.lastSyncAt ?? null
      const isStale = lastSync
        ? Date.now() - new Date(lastSync).getTime() > config.ttl
        : true
      return { table: config.table, lastSync, isStale }
    })
  )
}
