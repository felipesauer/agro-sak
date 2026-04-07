// ── CBS/IBS API client (Reforma Tributária piloto) ──
// Uses Vercel proxy in production to bypass CORS restrictions.
// Direct API: https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api

const DIRECT_URL = 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos'

export interface CbsRates {
  cbsRate: number  // Federal (CBS)
  ibsRate: number  // State/Municipal (IBS)
  totalRate: number
  date: string
  source: 'api' | 'fallback'
}

// UF code mapping (IBGE codes)
const UF_CODES: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53, ES: 32,
  GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15, PB: 25, PR: 41,
  PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43, RO: 11, RR: 14, SC: 42,
  SP: 35, SE: 28, TO: 17,
}

// Fallback rates if API is unreachable
const FALLBACK_RATES: CbsRates = {
  cbsRate: 8.8,
  ibsRate: 17.7,
  totalRate: 26.5,
  date: '2026-01-01',
  source: 'fallback',
}

function buildCbsUrl(endpoint: string, params: Record<string, string>): string {
  if (import.meta.env.PROD) {
    const qs = new URLSearchParams({ endpoint, ...params })
    return `/api/cbs-proxy?${qs}`
  }
  const qs = new URLSearchParams(params)
  return `${DIRECT_URL}/${endpoint}?${qs}`
}

/**
 * Fetch CBS (federal) and IBS (state) reference rates from the pilot API.
 * Falls back to hardcoded rates if the API is unreachable.
 */
export async function fetchCbsRates(uf: string, date?: string): Promise<CbsRates> {
  const effectiveDate = date ?? new Date().toISOString().slice(0, 10)
  const ufCode = UF_CODES[uf]
  if (!ufCode) return FALLBACK_RATES

  try {
    const [cbsRes, ibsRes] = await Promise.all([
      fetch(buildCbsUrl('aliquota-uniao', { data: effectiveDate }), { signal: AbortSignal.timeout(8000) }),
      fetch(buildCbsUrl('aliquota-uf', { data: effectiveDate, codigoUf: String(ufCode) }), { signal: AbortSignal.timeout(8000) }),
    ])

    if (!cbsRes.ok || !ibsRes.ok) return FALLBACK_RATES

    const cbsData = await cbsRes.json()
    const ibsData = await ibsRes.json()

    const cbsRate = cbsData?.aliquotaReferencia ?? FALLBACK_RATES.cbsRate
    const ibsRate = ibsData?.aliquotaReferencia ?? FALLBACK_RATES.ibsRate

    return {
      cbsRate,
      ibsRate,
      totalRate: cbsRate + ibsRate,
      date: effectiveDate,
      source: 'api',
    }
  } catch {
    return FALLBACK_RATES
  }
}
