// ── Area conversions (to hectares) ──

export const AREA_TO_HECTARES: Record<string, number> = {
  hectare: 1,
  alqueire_mt: 4.84,
  alqueire_sp: 2.42,
  alqueire_mg: 4.84,
  alqueire_ba: 9.68,
  alqueire_go: 4.84,
  tarefa_ne: 0.4356,
  acre: 0.4047,
  m2: 0.0001,
}

// ── Weight conversions ──

/** Bag weight in kg per crop */
export const BAG_WEIGHT_KG: Record<string, number> = {
  soybean: 60,
  corn: 60,
  wheat: 60,
  coffee: 60,
  rice: 50,
  cotton_lint: 15,
  bean: 60,
  sorghum: 60,
  oat: 40,
  barley: 60,
  sunflower: 40,
  peanut: 25,
}

/** Bushel weight in kg per crop */
export const BUSHEL_KG: Record<string, number> = {
  soybean: 27.216,
  corn: 25.401,
}

// ── Yield conversions ──

/** sc/ha → bu/ac conversion factor per crop */
export const SC_HA_TO_BU_AC: Record<string, number> = {
  soybean: 0.6726,
  corn: 0.6274,
}

// ── Arroba ──
export const ARROBA_KG = 15
