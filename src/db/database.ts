import Dexie, { type EntityTable } from 'dexie'

// ── Entity types ──

export interface CropPrice {
  id?: number
  crop: string
  min: number
  avg: number
  max: number
  unit: string          // 'R$/sc' | 'R$/@'
  source: string        // 'manual' | 'cepea' | 'seed'
  updatedAt: string     // ISO date
}

export interface FuelPrice {
  id?: number
  type: string          // 'diesel_s10' | 'diesel_s500' | 'gasoline'
  price: number         // R$/L
  state: string         // UF code or 'BR' for national avg
  source: string
  updatedAt: string
}

export interface FreightRate {
  id?: number
  key: string           // 'minPerTonKm' | 'avgPerTonKm' | etc.
  value: number
  source: string
  updatedAt: string
}

export interface TaxRate {
  id?: number
  key: string           // 'funrural_pf' | 'funrural_pj' | 'cbs' | 'ibs' | etc.
  label: string
  value: number         // percentage
  source: string
  updatedAt: string
}

export interface ProductivityRef {
  id?: number
  crop: string
  state: string         // UF code
  value: number         // sc/ha
  season: string        // '2024/2025'
  source: string
  updatedAt: string
}

export interface SeedingDefault {
  id?: number
  crop: string
  populationMin: number
  populationMax: number
  populationDefault: number
  rowSpacingDefault: number
  tswDefault: number
  updatedAt: string
}

export interface MoistureStandard {
  id?: number
  crop: string
  moisture: number      // %
  impurity: number      // %
  source: string
  updatedAt: string
}

export interface NutrientRemoval {
  id?: number
  crop: string
  n: number
  p2o5: number
  k2o: number
  s: number
  source: string
  updatedAt: string
}

export interface SyncMeta {
  id?: number
  table: string
  lastSyncAt: string
  ttlMinutes: number
  status: 'ok' | 'error' | 'pending'
}

// ── Database ──

export class AgroDatabase extends Dexie {
  cropPrices!: EntityTable<CropPrice, 'id'>
  fuelPrices!: EntityTable<FuelPrice, 'id'>
  freightRates!: EntityTable<FreightRate, 'id'>
  taxRates!: EntityTable<TaxRate, 'id'>
  productivityRefs!: EntityTable<ProductivityRef, 'id'>
  seedingDefaults!: EntityTable<SeedingDefault, 'id'>
  moistureStandards!: EntityTable<MoistureStandard, 'id'>
  nutrientRemoval!: EntityTable<NutrientRemoval, 'id'>
  syncMeta!: EntityTable<SyncMeta, 'id'>

  constructor() {
    super('agro-sak')

    this.version(1).stores({
      cropPrices: '++id, crop',
      fuelPrices: '++id, type, state',
      freightRates: '++id, &key',
      taxRates: '++id, &key',
      productivityRefs: '++id, [crop+state]',
      seedingDefaults: '++id, &crop',
      moistureStandards: '++id, &crop',
      nutrientRemoval: '++id, &crop',
      syncMeta: '++id, &table',
    })
  }
}

export const db = new AgroDatabase()
