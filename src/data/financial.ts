// ── Financial reference data ──

// ── Average crop prices (R$/saca - reference, safra 2025/2026) ──
// Source: CEPEA/ESALQ, CONAB, IMEA, DERAL

export const CROP_PRICE_REF: Record<string, { min: number; avg: number; max: number }> = {
  soybean: { min: 110, avg: 135, max: 165 },
  corn: { min: 45, avg: 60, max: 80 },
  cotton: { min: 130, avg: 155, max: 180 }, // por arroba de pluma
  wheat: { min: 60, avg: 78, max: 100 },
  coffee: { min: 1200, avg: 1600, max: 2200 },
  rice: { min: 60, avg: 85, max: 115 },
  bean: { min: 200, avg: 280, max: 400 },
  sorghum: { min: 32, avg: 45, max: 60 },
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
