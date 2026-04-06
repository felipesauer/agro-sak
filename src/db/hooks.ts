import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CropPrice } from './database'

/**
 * Get crop price reference data. Returns live-updating data from IndexedDB.
 */
export function useCropPrices() {
  return useLiveQuery(() => db.cropPrices.toArray(), [])
}

/**
 * Get a specific crop's price data.
 */
export function useCropPrice(crop: string) {
  return useLiveQuery(() => db.cropPrices.where('crop').equals(crop).first(), [crop])
}

/**
 * Get all tax rates.
 */
export function useTaxRates() {
  return useLiveQuery(() => db.taxRates.toArray(), [])
}

/**
 * Get a specific tax rate by key.
 */
export function useTaxRate(key: string) {
  return useLiveQuery(() => db.taxRates.where('key').equals(key).first(), [key])
}

/**
 * Get fuel prices (national average).
 */
export function useFuelPrices() {
  return useLiveQuery(() => db.fuelPrices.toArray(), [])
}

/**
 * Get diesel price (national avg or specific state).
 */
export function useDieselPrice(state: string = 'BR') {
  return useLiveQuery(
    () => db.fuelPrices.where({ type: 'diesel_s10', state }).first(),
    [state],
  )
}

/**
 * Get freight reference rates.
 */
export function useFreightRates() {
  return useLiveQuery(() => db.freightRates.toArray(), [])
}

/**
 * Get productivity references for a crop.
 */
export function useProductivityRefs(crop: string) {
  return useLiveQuery(
    () => db.productivityRefs.where('crop').equals(crop).toArray(),
    [crop],
  )
}

/**
 * Get seeding defaults for a crop.
 */
export function useSeedingDefaults(crop: string) {
  return useLiveQuery(
    () => db.seedingDefaults.where('crop').equals(crop).first(),
    [crop],
  )
}

export function useAllSeedingDefaults() {
  return useLiveQuery(() => db.seedingDefaults.toArray(), [])
}

/**
 * Get moisture/impurity standards.
 */
export function useMoistureStandards() {
  return useLiveQuery(() => db.moistureStandards.toArray(), [])
}

/**
 * Get moisture standard for a specific crop.
 */
export function useMoistureStandard(crop: string) {
  return useLiveQuery(
    () => db.moistureStandards.where('crop').equals(crop).first(),
    [crop],
  )
}

/**
 * Get nutrient removal data.
 */
export function useNutrientRemovalData(crop: string) {
  return useLiveQuery(
    () => db.nutrientRemoval.where('crop').equals(crop).first(),
    [crop],
  )
}

export function useAllNutrientRemoval() {
  return useLiveQuery(() => db.nutrientRemoval.toArray(), [])
}

/**
 * Get sync status for all tables.
 */
export function useSyncMeta() {
  return useLiveQuery(() => db.syncMeta.toArray(), [])
}

/**
 * Update a crop price in the database.
 */
export async function updateCropPrice(crop: string, data: Partial<CropPrice>) {
  const existing = await db.cropPrices.where('crop').equals(crop).first()
  if (existing?.id) {
    await db.cropPrices.update(existing.id, { ...data, updatedAt: new Date().toISOString() })
  }
}

/**
 * Update a tax rate in the database.
 */
export async function updateTaxRate(key: string, value: number, source: string = 'manual') {
  const existing = await db.taxRates.where('key').equals(key).first()
  if (existing?.id) {
    await db.taxRates.update(existing.id, {
      value,
      source,
      updatedAt: new Date().toISOString(),
    })
  }
}

/**
 * Update productivity reference.
 */
export async function updateProductivityRef(
  crop: string,
  state: string,
  value: number,
  season: string,
) {
  const existing = await db.productivityRefs
    .where({ crop, state })
    .first()

  if (existing?.id) {
    await db.productivityRefs.update(existing.id, {
      value,
      season,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    })
  } else {
    await db.productivityRefs.add({
      crop,
      state,
      value,
      season,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    })
  }
}

/**
 * Reset a table to seed data (re-seed).
 */
export async function resetTable(tableName: string) {
  const table = (db as unknown as Record<string, unknown>)[tableName]
  if (table && typeof (table as { clear: () => Promise<void> }).clear === 'function') {
    await (table as { clear: () => Promise<void> }).clear()
    // Re-import and seed would go here — for now we mark for re-seed
    const meta = await db.syncMeta.where('table').equals(tableName).first()
    if (meta?.id) {
      await db.syncMeta.update(meta.id, { status: 'pending', lastSyncAt: '' })
    }
  }
}

/**
 * Get data freshness info for a table.
 */
export function useDataFreshness(tableName: string) {
  return useLiveQuery(async () => {
    const meta = await db.syncMeta.where('table').equals(tableName).first()
    if (!meta) return null

    const lastSync = new Date(meta.lastSyncAt)
    const now = new Date()
    const minutesAgo = (now.getTime() - lastSync.getTime()) / 60_000
    const isStale = minutesAgo > meta.ttlMinutes

    return {
      lastSync,
      minutesAgo: Math.round(minutesAgo),
      ttlMinutes: meta.ttlMinutes,
      isStale,
      status: meta.status,
    }
  }, [tableName])
}
