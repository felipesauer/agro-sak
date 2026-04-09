// ── Tax reference data ──

import { FUNRURAL_RATE_TABLE } from '../core/tax/funrural'

// ── Funrural tax rates (derived from core — single source of truth) ──

const pf = FUNRURAL_RATE_TABLE.pf
const pj = FUNRURAL_RATE_TABLE.pj

export const FUNRURAL_RATES = {
  individual: { funrural: pf.funrural, rat: pf.rat, senar: pf.senar, total: pf.funrural + pf.rat + pf.senar },
  corporate: { funrural: pj.funrural, rat: pj.rat, senar: pj.senar, total: pj.funrural + pj.rat + pj.senar },
  get PF() { return this.individual },
  get PJ() { return this.corporate },
} as const

// ── IBS/CBS pilot tax rates (Reforma Tributária) ──

export const CBS_IBS_RATES = {
  cbs: 8.8,   // CBS federal (alíquota padrão prevista)
  ibs: 17.7,  // IBS estadual/municipal (alíquota padrão prevista)
  total: 26.5, // Total IVA dual
  ruralReduction: 60, // Redução para insumos agropecuários (%)
  ruralEffective: 10.6, // Alíquota efetiva com redução (26.5 * 0.4)
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
