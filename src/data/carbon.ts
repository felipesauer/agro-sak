// ── Carbon reference data ──

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

// ── Carbon Credit Price Reference (R$/tCO₂eq — voluntary market Brazil 2025) ──
// Source: Ecosystem Marketplace, CEBDS, Moss Earth

export const CARBON_PRICE_REF = {
  min: 30,   // R$/tCO₂eq — projetos de menor qualidade/volume
  avg: 60,   // R$/tCO₂eq — média mercado voluntário BR
  max: 150,  // R$/tCO₂eq — projetos premium com co-benefícios
} as const
