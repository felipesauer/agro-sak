// ── Brazilian States (27 UFs) ──

export interface BrazilianState {
  code: string
  name: string
  region: string
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { code: 'AC', name: 'Acre', region: 'Norte' },
  { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { code: 'AP', name: 'Amapá', region: 'Norte' },
  { code: 'AM', name: 'Amazonas', region: 'Norte' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
  { code: 'CE', name: 'Ceará', region: 'Nordeste' },
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'PA', name: 'Pará', region: 'Norte' },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { code: 'PR', name: 'Paraná', region: 'Sul' },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI', name: 'Piauí', region: 'Nordeste' },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'RO', name: 'Rondônia', region: 'Norte' },
  { code: 'RR', name: 'Roraima', region: 'Norte' },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
  { code: 'TO', name: 'Tocantins', region: 'Norte' },
]

// Helper: state options for SelectField
export const STATE_OPTIONS = BRAZILIAN_STATES.map(s => ({
  value: s.code,
  label: `${s.code} - ${s.name}`,
}))

// ── Crop labels (pt-BR) ──

export const CROP_LABELS: Record<string, string> = {
  soybean: 'Soja',
  corn: 'Milho',
  cotton: 'Algodão',
  cotton_lint: 'Algodão (pluma)',
  sorghum: 'Sorgo',
  bean: 'Feijão',
  wheat: 'Trigo',
  rice: 'Arroz',
  coffee: 'Café',
  sugarcane: 'Cana-de-açúcar',
  sunflower: 'Girassol',
  oat: 'Aveia',
  barley: 'Cevada',
  peanut: 'Amendoim',
  millet: 'Milheto',
  brachiaria: 'Braquiária',
  pasture: 'Pastagem',
}

// Helper: crop options for SelectField
export const CROP_OPTIONS = Object.entries(CROP_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/** Derive crop options from a data object, using CROP_LABELS for display names */
export function cropOptionsFrom(data: Record<string, unknown>): { value: string; label: string }[] {
  return Object.keys(data)
    .filter(key => key in CROP_LABELS)
    .map(key => ({ value: key, label: CROP_LABELS[key] }))
}

// ── Sack weight by crop (kg) ──

export const SACK_WEIGHT: Record<string, number> = {
  soybean: 60,
  corn: 60,
  cotton: 15, // arroba — lint
  coffee: 60,
  wheat: 60,
  rice: 50,
  bean: 60,
  sorghum: 60,
  sunflower: 40,
  peanut: 25,
  oat: 40,
  barley: 60,
}

// ── Seeding rate defaults by crop ──

export interface CropSeedingDefaults {
  populationMin: number
  populationMax: number
  populationDefault: number
  rowSpacingDefault: number
  tswDefault: number // Thousand seed weight (g)
}

export const SEEDING_DEFAULTS: Record<string, CropSeedingDefaults> = {
  soybean: {
    populationMin: 200_000,
    populationMax: 400_000,
    populationDefault: 320_000,
    rowSpacingDefault: 45,
    tswDefault: 145,
  },
  corn: {
    populationMin: 50_000,
    populationMax: 90_000,
    populationDefault: 65_000,
    rowSpacingDefault: 50,
    tswDefault: 290,
  },
  cotton: {
    populationMin: 70_000,
    populationMax: 130_000,
    populationDefault: 90_000,
    rowSpacingDefault: 76,
    tswDefault: 100,
  },
  sorghum: {
    populationMin: 120_000,
    populationMax: 200_000,
    populationDefault: 170_000,
    rowSpacingDefault: 50,
    tswDefault: 30,
  },
  bean: {
    populationMin: 200_000,
    populationMax: 350_000,
    populationDefault: 260_000,
    rowSpacingDefault: 45,
    tswDefault: 250,
  },
  wheat: {
    populationMin: 250_000,
    populationMax: 400_000,
    populationDefault: 330_000,
    rowSpacingDefault: 17,
    tswDefault: 35,
  },
  rice: {
    populationMin: 150_000,
    populationMax: 350_000,
    populationDefault: 250_000,
    rowSpacingDefault: 17,
    tswDefault: 25,
  },
  sunflower: {
    populationMin: 40_000,
    populationMax: 60_000,
    populationDefault: 45_000,
    rowSpacingDefault: 70,
    tswDefault: 55,
  },
  millet: {
    populationMin: 200_000,
    populationMax: 400_000,
    populationDefault: 300_000,
    rowSpacingDefault: 45,
    tswDefault: 10,
  },
  oat: {
    populationMin: 200_000,
    populationMax: 350_000,
    populationDefault: 300_000,
    rowSpacingDefault: 17,
    tswDefault: 30,
  },
}

// ── Base saturation (V%) targets by crop ──

export const BASE_SATURATION_TARGETS: Record<string, { min: number; max: number }> = {
  soybean: { min: 60, max: 70 },
  corn: { min: 60, max: 65 },
  cotton: { min: 65, max: 75 },
  pasture: { min: 50, max: 60 },
  bean: { min: 60, max: 70 },
  wheat: { min: 60, max: 70 },
  rice: { min: 50, max: 60 },
  coffee: { min: 60, max: 70 },
  sugarcane: { min: 60, max: 70 },
  sunflower: { min: 60, max: 70 },
}

// ── Nutrient removal per ton of grain (kg/t) ──

export interface NutrientRemovalPerTon {
  n: number
  p2o5: number
  k2o: number
  s: number
}

export const NUTRIENT_REMOVAL: Record<string, NutrientRemovalPerTon> = {
  soybean: { n: 65, p2o5: 15, k2o: 19, s: 4 },
  corn: { n: 15, p2o5: 8, k2o: 5, s: 2 },
  cotton: { n: 25, p2o5: 8, k2o: 12, s: 4 },
  wheat: { n: 21, p2o5: 10, k2o: 5, s: 3 },
  rice: { n: 12, p2o5: 5, k2o: 3, s: 1 },
  bean: { n: 35, p2o5: 7, k2o: 15, s: 5 },
  sorghum: { n: 15, p2o5: 7, k2o: 4, s: 2 },
  coffee: { n: 35, p2o5: 4, k2o: 40, s: 3 },
  sunflower: { n: 24, p2o5: 12, k2o: 8, s: 2 },
}

// ── Moisture standards by crop ──

export const MOISTURE_STANDARD: Record<string, number> = {
  soybean: 14,
  corn: 14.5,
  cotton_lint: 8,
  coffee: 11,
  wheat: 13,
  rice: 13,
  bean: 14,
  sorghum: 13,
  sunflower: 11,
  oat: 13,
  barley: 13,
}

export const IMPURITY_STANDARD: Record<string, number> = {
  soybean: 1,
  corn: 1,
  wheat: 1,
  rice: 1,
  bean: 1,
  sorghum: 1,
}

// ── Funrural tax rates ──

export const FUNRURAL_RATES = {
  individual: { funrural: 1.2, rat: 0.1, senar: 0.2, total: 1.5 },
  corporate: { funrural: 2.5, rat: 0.1, senar: 0.25, total: 2.85 },
  // Aliases (PF = Pessoa Física, PJ = Pessoa Jurídica)
  get PF() { return this.individual },
  get PJ() { return this.corporate },
} as const

// ── Average crop prices (R$/saca - reference, safra 2024/2025) ──

export const CROP_PRICE_REF: Record<string, { min: number; avg: number; max: number }> = {
  soybean: { min: 100, avg: 130, max: 160 },
  corn: { min: 40, avg: 55, max: 75 },
  cotton: { min: 120, avg: 145, max: 170 }, // por arroba de pluma
  wheat: { min: 55, avg: 70, max: 90 },
  coffee: { min: 800, avg: 1100, max: 1500 },
  rice: { min: 55, avg: 75, max: 100 },
  bean: { min: 180, avg: 250, max: 350 },
  sorghum: { min: 30, avg: 42, max: 55 },
}

// ── Average productivity by state/region (sc/ha) ──

export const PRODUCTIVITY_REF: Record<string, Record<string, number>> = {
  soybean: {
    MT: 58, PR: 60, RS: 50, GO: 55, MS: 55, BA: 52, MG: 52, SP: 54,
    MA: 48, TO: 50, PI: 48, 'default': 53,
  },
  corn: {
    MT: 110, PR: 120, RS: 100, GO: 105, MS: 100, MG: 100, SP: 105,
    BA: 80, MA: 70, TO: 75, 'default': 95,
  },
}

// ── Crop coefficient (Kc) for irrigation ──

export const CROP_KC: Record<string, { initial: number; mid: number; end: number }> = {
  soybean: { initial: 0.4, mid: 1.15, end: 0.5 },
  corn: { initial: 0.3, mid: 1.2, end: 0.6 },
  cotton: { initial: 0.35, mid: 1.15, end: 0.7 },
  wheat: { initial: 0.3, mid: 1.15, end: 0.4 },
  bean: { initial: 0.4, mid: 1.15, end: 0.35 },
  rice: { initial: 1.05, mid: 1.2, end: 0.9 },
  coffee: { initial: 0.9, mid: 0.95, end: 0.9 },
  sugarcane: { initial: 0.5, mid: 1.25, end: 0.75 },
}

// ── Soil types ──

export const SOIL_TYPES = [
  { value: 'clay', label: 'Argiloso (>60% argila)' },
  { value: 'sandy_clay', label: 'Argilo-arenoso (35-60% argila)' },
  { value: 'sandy', label: 'Arenoso (<15% argila)' },
  { value: 'loam', label: 'Franco (equilibrado)' },
  { value: 'sandy_loam', label: 'Franco-arenoso' },
  { value: 'clay_loam', label: 'Franco-argiloso' },
]

// ── IBS/CBS pilot tax rates (Reforma Tributária) ──

export const CBS_IBS_RATES = {
  cbs: 8.8,   // CBS federal (alíquota padrão prevista)
  ibs: 17.7,  // IBS estadual/municipal (alíquota padrão prevista)
  total: 26.5, // Total IVA dual
  ruralReduction: 60, // Redução para insumos agropecuários (%)
  ruralEffective: 10.6, // Alíquota efetiva com redução (26.5 * 0.4)
}

// ── Fuel consumption reference (L/h) by operation ──

export const FUEL_CONSUMPTION_REF: Record<string, { min: number; max: number }> = {
  heavy_disc_harrow: { min: 25, max: 35 },
  soybean_planting_12m: { min: 18, max: 25 },
  self_propelled_sprayer: { min: 20, max: 28 },
  soybean_harvest: { min: 28, max: 45 },
  corn_planting: { min: 15, max: 22 },
  corn_harvest: { min: 30, max: 50 },
  subsoiler: { min: 30, max: 45 },
  leveling_harrow: { min: 12, max: 18 },
  grain_transport: { min: 8, max: 15 },
}

// ── Operational efficiency reference (%) ──

export const OPERATIONAL_EFFICIENCY: Record<string, { min: number; max: number }> = {
  planter: { min: 70, max: 80 },
  sprayer: { min: 75, max: 85 },
  harvester: { min: 65, max: 75 },
  tractor: { min: 70, max: 85 },
}

// ── Machine residual value (%) ──

export const RESIDUAL_VALUE: Record<string, number> = {
  tractor: 30,
  harvester: 20,
  planter: 15,
  sprayer: 15,
  truck: 25,
  grain_cart: 20,
}

// ── ITR (Imposto Territorial Rural) reference values ──

export const ITR_RATES: Record<string, Record<string, number>> = {
  // Grau de Utilização (%) → Alíquota por faixa de área
  // Keys: area range, Values: rate by utilization %
  'ate_50ha': {
    '>80': 0.03, '65-80': 0.07, '50-65': 0.10, '30-50': 0.15, '<30': 0.20,
  },
  '50_200ha': {
    '>80': 0.07, '65-80': 0.10, '50-65': 0.15, '30-50': 0.30, '<30': 0.40,
  },
  '200_500ha': {
    '>80': 0.10, '65-80': 0.15, '50-65': 0.30, '30-50': 0.45, '<30': 0.60,
  },
  '500_1000ha': {
    '>80': 0.15, '65-80': 0.30, '50-65': 0.45, '30-50': 0.70, '<30': 1.0,
  },
  '1000_5000ha': {
    '>80': 0.30, '65-80': 0.45, '50-65': 0.70, '30-50': 1.0, '<30': 2.0,
  },
  'acima_5000ha': {
    '>80': 0.45, '65-80': 0.70, '50-65': 1.0, '30-50': 2.0, '<30': 3.4,
  },
}

// ── Freight reference (R$/t/km) — ANTT table ranges ──

export const FREIGHT_REF = {
  minPerTonKm: 0.12,
  avgPerTonKm: 0.18,
  maxPerTonKm: 0.25,
  tollAvgPerKm: 0.08,
  dieselPriceRef: 6.30, // R$/L reference
}
