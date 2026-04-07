import { db } from './database'
import {
  CROP_PRICE_REF,
  FUNRURAL_RATES,
  FREIGHT_REF,
  CBS_IBS_RATES,
  PRODUCTIVITY_REF,
  SEEDING_DEFAULTS,
  MOISTURE_STANDARD,
  IMPURITY_STANDARD,
  NUTRIENT_REMOVAL,
  ITR_RATES,
} from '../data/reference-data'

const NOW = new Date().toISOString()

/**
 * Seed the database with bundled reference data.
 * Only seeds if tables are empty (first run or after clearing).
 */
export async function seedDatabase(): Promise<void> {
  await seedCropPrices()
  await seedFuelPrices()
  await seedFreightRates()
  await seedTaxRates()
  await seedProductivityRefs()
  await seedSeedingDefaults()
  await seedMoistureStandards()
  await seedNutrientRemoval()
  await seedSyncMeta()
}

async function seedCropPrices() {
  const count = await db.cropPrices.count()
  const expected = Object.keys(CROP_PRICE_REF).length
  if (count >= expected) return

  // Clear partial seed and re-insert
  if (count > 0) await db.cropPrices.clear()

  const rows = Object.entries(CROP_PRICE_REF).map(([crop, { min, avg, max }]) => ({
    crop,
    min,
    avg,
    max,
    unit: crop === 'cotton' ? 'R$/@' : 'R$/sc',
    source: 'seed',
    updatedAt: NOW,
  }))
  await db.cropPrices.bulkAdd(rows)
}

async function seedFuelPrices() {
  const count = await db.fuelPrices.count()
  if (count > 0) return

  await db.fuelPrices.add({
    type: 'diesel_s10',
    price: 6.30,
    state: 'BR',
    source: 'seed',
    updatedAt: NOW,
  })
}

async function seedFreightRates() {
  const count = await db.freightRates.count()
  if (count > 0) return

  const entries = Object.entries(FREIGHT_REF).map(([key, value]) => ({
    key,
    value: value as number,
    source: 'seed',
    updatedAt: NOW,
  }))
  await db.freightRates.bulkAdd(entries)
}

async function seedTaxRates() {
  const count = await db.taxRates.count()
  if (count > 0) return

  const rows = [
    { key: 'funrural_pf', label: 'Funrural PF', value: FUNRURAL_RATES.individual.funrural, source: 'seed', updatedAt: NOW },
    { key: 'rat_pf', label: 'RAT PF', value: FUNRURAL_RATES.individual.rat, source: 'seed', updatedAt: NOW },
    { key: 'senar_pf', label: 'SENAR PF', value: FUNRURAL_RATES.individual.senar, source: 'seed', updatedAt: NOW },
    { key: 'funrural_pj', label: 'Funrural PJ', value: FUNRURAL_RATES.corporate.funrural, source: 'seed', updatedAt: NOW },
    { key: 'rat_pj', label: 'RAT PJ', value: FUNRURAL_RATES.corporate.rat, source: 'seed', updatedAt: NOW },
    { key: 'senar_pj', label: 'SENAR PJ', value: FUNRURAL_RATES.corporate.senar, source: 'seed', updatedAt: NOW },
    { key: 'cbs', label: 'CBS (Federal)', value: CBS_IBS_RATES.cbs, source: 'seed', updatedAt: NOW },
    { key: 'ibs', label: 'IBS (Estadual)', value: CBS_IBS_RATES.ibs, source: 'seed', updatedAt: NOW },
  ]

  // ITR rates
  for (const [areaRange, utilRates] of Object.entries(ITR_RATES)) {
    for (const [util, rate] of Object.entries(utilRates)) {
      rows.push({
        key: `itr_${areaRange}_${util}`,
        label: `ITR ${areaRange} ${util}`,
        value: rate,
        source: 'seed',
        updatedAt: NOW,
      })
    }
  }

  await db.taxRates.bulkAdd(rows)
}

async function seedProductivityRefs() {
  const count = await db.productivityRefs.count()
  if (count > 0) return

  const rows: Array<{
    crop: string
    state: string
    value: number
    season: string
    source: string
    updatedAt: string
  }> = []

  for (const [crop, stateMap] of Object.entries(PRODUCTIVITY_REF)) {
    for (const [state, value] of Object.entries(stateMap)) {
      rows.push({
        crop,
        state,
        value,
        season: '2024/2025',
        source: 'seed',
        updatedAt: NOW,
      })
    }
  }

  await db.productivityRefs.bulkAdd(rows)
}

async function seedSeedingDefaults() {
  const count = await db.seedingDefaults.count()
  if (count > 0) return

  const rows = Object.entries(SEEDING_DEFAULTS).map(([crop, d]) => ({
    crop,
    ...d,
    updatedAt: NOW,
  }))
  await db.seedingDefaults.bulkAdd(rows)
}

async function seedMoistureStandards() {
  const count = await db.moistureStandards.count()
  if (count > 0) return

  const allCrops = new Set([
    ...Object.keys(MOISTURE_STANDARD),
    ...Object.keys(IMPURITY_STANDARD),
  ])

  const rows = Array.from(allCrops).map((crop) => ({
    crop,
    moisture: MOISTURE_STANDARD[crop] ?? 14,
    impurity: IMPURITY_STANDARD[crop] ?? 1,
    source: 'seed',
    updatedAt: NOW,
  }))
  await db.moistureStandards.bulkAdd(rows)
}

async function seedNutrientRemoval() {
  const count = await db.nutrientRemoval.count()
  if (count > 0) return

  const rows = Object.entries(NUTRIENT_REMOVAL).map(([crop, data]) => ({
    crop,
    ...data,
    source: 'seed',
    updatedAt: NOW,
  }))
  await db.nutrientRemoval.bulkAdd(rows)
}

async function seedSyncMeta() {
  const count = await db.syncMeta.count()
  if (count > 0) return

  const tables = [
    { table: 'cropPrices', ttlMinutes: 1440 },       // 24h
    { table: 'fuelPrices', ttlMinutes: 10080 },      // 7 days
    { table: 'freightRates', ttlMinutes: 10080 },    // 7 days
    { table: 'taxRates', ttlMinutes: 43200 },        // 30 days
    { table: 'productivityRefs', ttlMinutes: 43200 }, // 30 days
    { table: 'seedingDefaults', ttlMinutes: 525600 }, // 1 year
    { table: 'moistureStandards', ttlMinutes: 525600 },
    { table: 'nutrientRemoval', ttlMinutes: 525600 },
  ]

  await db.syncMeta.bulkAdd(
    tables.map((t) => ({ ...t, lastSyncAt: NOW, status: 'ok' as const })),
  )
}
