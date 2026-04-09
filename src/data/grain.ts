// ── Grain reference data ──

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
