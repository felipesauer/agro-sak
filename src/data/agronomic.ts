// ── Agronomic reference data ──

// ── Seeding rate defaults by crop ──

interface CropSeedingDefaults {
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

interface NutrientRemovalPerTon {
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

// ── Soil analysis interpretation — Source: EMBRAPA / Raij et al. (IAC Boletim 100) ──

interface SoilNutrientRange {
  unit: string
  ranges: { label: string; min: number; max: number; color: string }[]
}

const SOIL_ANALYSIS_RANGES: Record<string, SoilNutrientRange> = {
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

// ── Fertilizer sources for custom blending — Source: EMBRAPA / ANDA ──

interface FertilizerSource {
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

// ── Seed treatment reference data — Source: EMBRAPA / Adapar ──

interface SeedTreatmentProduct {
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
