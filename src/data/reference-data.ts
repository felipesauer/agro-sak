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

// ── Seed treatment reference data — Source: EMBRAPA / Adapar ──

export interface SeedTreatmentProduct {
  name: string
  type: 'fungicide' | 'insecticide' | 'inoculant' | 'nematicide' | 'biostimulant'
  dosePerKg: number // mL per 100 kg of seeds (label rate)
  pricePerLiter: number // R$/L reference
}

export const SEED_TREATMENT_PRODUCTS: SeedTreatmentProduct[] = [
  // Fungicides
  { name: 'Vitavax-Thiram 200 SC', type: 'fungicide', dosePerKg: 250, pricePerLiter: 85 },
  { name: 'Maxim Advanced', type: 'fungicide', dosePerKg: 100, pricePerLiter: 220 },
  { name: 'Derosal Plus', type: 'fungicide', dosePerKg: 200, pricePerLiter: 95 },
  // Insecticides
  { name: 'Cruiser 350 FS', type: 'insecticide', dosePerKg: 200, pricePerLiter: 350 },
  { name: 'Standak Top', type: 'insecticide', dosePerKg: 200, pricePerLiter: 280 },
  { name: 'Fortenza 600 FS', type: 'insecticide', dosePerKg: 100, pricePerLiter: 450 },
  // Inoculants
  { name: 'Inoculante líquido (Bradyrhizobium)', type: 'inoculant', dosePerKg: 100, pricePerLiter: 15 },
  { name: 'Co-inoculante (Azospirillum)', type: 'inoculant', dosePerKg: 100, pricePerLiter: 20 },
  // Nematicides
  { name: 'Avicta 500 FS', type: 'nematicide', dosePerKg: 100, pricePerLiter: 520 },
  // Biostimulants
  { name: 'Stimulate', type: 'biostimulant', dosePerKg: 500, pricePerLiter: 130 },
]

export const SEED_TREATMENT_TYPE_LABELS: Record<string, string> = {
  fungicide: 'Fungicida',
  insecticide: 'Inseticida',
  inoculant: 'Inoculante',
  nematicide: 'Nematicida',
  biostimulant: 'Bioestimulante',
}

// ── Soil analysis interpretation — Source: EMBRAPA / Raij et al. (IAC Boletim 100) ──

export interface SoilNutrientRange {
  unit: string
  ranges: { label: string; min: number; max: number; color: string }[]
}

export const SOIL_ANALYSIS_RANGES: Record<string, SoilNutrientRange> = {
  pH: {
    unit: '',
    ranges: [
      { label: 'Muito baixo', min: 0, max: 4.5, color: 'red' },
      { label: 'Baixo', min: 4.5, max: 5.0, color: 'amber' },
      { label: 'Médio', min: 5.0, max: 5.5, color: 'yellow' },
      { label: 'Adequado', min: 5.5, max: 6.5, color: 'emerald' },
      { label: 'Alto', min: 6.5, max: 14, color: 'blue' },
    ],
  },
  organicMatter: {
    unit: 'g/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 15, color: 'red' },
      { label: 'Médio', min: 15, max: 25, color: 'amber' },
      { label: 'Adequado', min: 25, max: 40, color: 'emerald' },
      { label: 'Alto', min: 40, max: 999, color: 'blue' },
    ],
  },
  P: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Muito baixo', min: 0, max: 6, color: 'red' },
      { label: 'Baixo', min: 6, max: 12, color: 'amber' },
      { label: 'Médio', min: 12, max: 20, color: 'yellow' },
      { label: 'Adequado', min: 20, max: 40, color: 'emerald' },
      { label: 'Alto', min: 40, max: 999, color: 'blue' },
    ],
  },
  K: {
    unit: 'mmolc/dm³',
    ranges: [
      { label: 'Muito baixo', min: 0, max: 0.8, color: 'red' },
      { label: 'Baixo', min: 0.8, max: 1.5, color: 'amber' },
      { label: 'Médio', min: 1.5, max: 3.0, color: 'yellow' },
      { label: 'Adequado', min: 3.0, max: 6.0, color: 'emerald' },
      { label: 'Alto', min: 6.0, max: 999, color: 'blue' },
    ],
  },
  Ca: {
    unit: 'mmolc/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 15, color: 'red' },
      { label: 'Médio', min: 15, max: 30, color: 'amber' },
      { label: 'Adequado', min: 30, max: 70, color: 'emerald' },
      { label: 'Alto', min: 70, max: 999, color: 'blue' },
    ],
  },
  Mg: {
    unit: 'mmolc/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 5, color: 'red' },
      { label: 'Médio', min: 5, max: 8, color: 'amber' },
      { label: 'Adequado', min: 8, max: 20, color: 'emerald' },
      { label: 'Alto', min: 20, max: 999, color: 'blue' },
    ],
  },
  S: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 5, color: 'red' },
      { label: 'Médio', min: 5, max: 10, color: 'amber' },
      { label: 'Adequado', min: 10, max: 20, color: 'emerald' },
      { label: 'Alto', min: 20, max: 999, color: 'blue' },
    ],
  },
  B: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 0.2, color: 'red' },
      { label: 'Médio', min: 0.2, max: 0.6, color: 'amber' },
      { label: 'Adequado', min: 0.6, max: 1.0, color: 'emerald' },
      { label: 'Alto', min: 1.0, max: 999, color: 'blue' },
    ],
  },
  Cu: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 0.3, color: 'red' },
      { label: 'Médio', min: 0.3, max: 0.8, color: 'amber' },
      { label: 'Adequado', min: 0.8, max: 1.5, color: 'emerald' },
      { label: 'Alto', min: 1.5, max: 999, color: 'blue' },
    ],
  },
  Mn: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 1.3, color: 'red' },
      { label: 'Médio', min: 1.3, max: 5.0, color: 'amber' },
      { label: 'Adequado', min: 5.0, max: 15, color: 'emerald' },
      { label: 'Alto', min: 15, max: 999, color: 'blue' },
    ],
  },
  Zn: {
    unit: 'mg/dm³',
    ranges: [
      { label: 'Baixo', min: 0, max: 0.6, color: 'red' },
      { label: 'Médio', min: 0.6, max: 1.2, color: 'amber' },
      { label: 'Adequado', min: 1.2, max: 3.0, color: 'emerald' },
      { label: 'Alto', min: 3.0, max: 999, color: 'blue' },
    ],
  },
}

/** Classify a value within a SoilNutrientRange and return the matching range entry */
export function classifySoilNutrient(nutrient: string, value: number): { label: string; color: string } | null {
  const ranges = SOIL_ANALYSIS_RANGES[nutrient]?.ranges
  if (!ranges) return null
  for (const range of ranges) {
    if (value >= range.min && value < range.max) return { label: range.label, color: range.color }
  }
  return null
}

// ── Drying energy reference — Source: EMBRAPA Instrumentação / CONAB ──

export const DRYING_ENERGY_REF = {
  // kcal needed to evaporate 1 kg of water from grain
  kcalPerKgWater: 700,
  // Energy source efficiency and cost
  sources: {
    firewood: { label: 'Lenha', kcalPerUnit: 3100, unit: 'kg', pricePerUnit: 0.25, efficiency: 0.65 },
    lpg: { label: 'GLP (Gás)', kcalPerUnit: 11000, unit: 'kg', pricePerUnit: 7.50, efficiency: 0.85 },
    electricity: { label: 'Elétrico', kcalPerUnit: 860, unit: 'kWh', pricePerUnit: 0.85, efficiency: 0.95 },
    diesel: { label: 'Diesel', kcalPerUnit: 10200, unit: 'L', pricePerUnit: 6.30, efficiency: 0.80 },
  },
  // Typical dryer throughput (t/h) by capacity
  dryerCapacity: {
    small: { label: 'Pequeno (até 10 t/h)', throughput: 7 },
    medium: { label: 'Médio (10–30 t/h)', throughput: 20 },
    large: { label: 'Grande (30+ t/h)', throughput: 40 },
  },
  // Third-party drying cost reference (R$ per 60kg sack)
  thirdPartyCostPerBag: { min: 2.50, avg: 4.00, max: 6.00 },
} as const

// ── Fertilizer sources for custom blending — Source: EMBRAPA / ANDA ──

export interface FertilizerSource {
  name: string
  n: number   // % N
  p2o5: number // % P₂O₅
  k2o: number  // % K₂O
  s: number    // % S
  pricePerTon: number // R$/t reference
}

export const FERTILIZER_SOURCES: FertilizerSource[] = [
  { name: 'Ureia', n: 45, p2o5: 0, k2o: 0, s: 0, pricePerTon: 2800 },
  { name: 'MAP (11-52-00)', n: 11, p2o5: 52, k2o: 0, s: 0, pricePerTon: 3800 },
  { name: 'DAP (18-46-00)', n: 18, p2o5: 46, k2o: 0, s: 0, pricePerTon: 3600 },
  { name: 'KCl (Cloreto de Potássio)', n: 0, p2o5: 0, k2o: 60, s: 0, pricePerTon: 2600 },
  { name: 'SSP (Superfosfato Simples)', n: 0, p2o5: 18, k2o: 0, s: 12, pricePerTon: 1200 },
  { name: 'SFS (Superfosfato Triplo)', n: 0, p2o5: 46, k2o: 0, s: 0, pricePerTon: 3200 },
  { name: 'Sulfato de Amônio', n: 21, p2o5: 0, k2o: 0, s: 24, pricePerTon: 1800 },
  { name: 'Nitrato de Amônio', n: 34, p2o5: 0, k2o: 0, s: 0, pricePerTon: 2400 },
  { name: 'Sulfato de Potássio', n: 0, p2o5: 0, k2o: 50, s: 18, pricePerTon: 3800 },
]

// ── Crop insurance (Proagro / PSR) reference — Source: MAPA / BACEN Res. 4.939 ──

export const CROP_INSURANCE_REF = {
  // PSR subsidy ranges by crop category (% of premium subsidized by government)
  subsidyRates: {
    grains: { label: 'Grãos (soja, milho, trigo)', rate: 40 },
    secondCrop: { label: 'Safrinha', rate: 40 },
    fruits: { label: 'Fruticultura', rate: 40 },
    horticulture: { label: 'Olericultura', rate: 40 },
    coffee: { label: 'Café', rate: 40 },
    forestry: { label: 'Florestal', rate: 40 },
    livestock: { label: 'Pecuária', rate: 30 },
    aquaculture: { label: 'Aquicultura', rate: 30 },
  },
  // Typical premium rates (% of insured value) by risk level
  premiumRates: {
    low: { label: 'Baixo risco', rate: 3.5 },
    medium: { label: 'Risco médio', rate: 6.0 },
    high: { label: 'Alto risco', rate: 9.0 },
  },
  // Coverage levels
  coverageLevels: [
    { value: '60', label: '60%' },
    { value: '65', label: '65%' },
    { value: '70', label: '70%' },
    { value: '75', label: '75%' },
    { value: '80', label: '80%' },
  ],
  // Proagro rates (% of financed value) — BACEN
  proagroRate: 2.0, // % do valor financiado
  proagroMaisRate: 4.0, // Proagro Mais — para mini/pequeno produtor
} as const

// ── Carbon Sequestration Rates (tCO₂eq/ha/year by crop system) ──
// Source: EMBRAPA Solos / Plano ABC+ (Agricultura de Baixa Emissão de Carbono)

export const CARBON_SEQUESTRATION: Record<string, number> = {
  soybean_corn: 0.4,    // Soja/Milho safrinha — sistema mais comum no Cerrado
  soybean_wheat: 0.45,  // Soja/Trigo — Sul do Brasil
  soybean_cotton: 0.35, // Soja/Algodão — Cerrado
  corn_mono: 0.25,      // Milho safra única
  sugarcane: 0.6,       // Cana-de-açúcar — alto aporte de biomassa
  pasture: 0.8,         // Pastagem bem manejada — alto potencial de sequestro
  coffee: 0.5,          // Café — sistema perene
}

// ── Carbon Credit Price Reference (R$/tCO₂eq — voluntary market Brazil 2023-2024) ──
// Source: Ecosystem Marketplace, CEBDS

export const CARBON_PRICE_REF = {
  min: 25,   // R$/tCO₂eq — projetos de menor qualidade/volume
  avg: 50,   // R$/tCO₂eq — média mercado voluntário BR
  max: 120,  // R$/tCO₂eq — projetos premium com co-benefícios
} as const
