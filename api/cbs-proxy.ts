import type { VercelRequest, VercelResponse } from '@vercel/node'

const CBS_BASE = 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos'
const ALLOWED_ENDPOINTS = ['aliquota-uniao', 'aliquota-uf']

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://agrosak.com.br'
const VALID_UF_CODES = [12,27,16,13,29,23,53,32,52,21,51,50,31,15,25,41,26,22,33,24,43,11,14,42,35,28,17]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const endpoint = String(req.query.endpoint ?? '')
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' })
  }

  const params = new URLSearchParams()
  if (req.query.data) {
    const date = String(req.query.data)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format (expected YYYY-MM-DD)' })
    }
    params.set('data', date)
  }
  if (req.query.codigoUf) {
    const uf = parseInt(String(req.query.codigoUf), 10)
    if (isNaN(uf) || !VALID_UF_CODES.includes(uf)) {
      return res.status(400).json({ error: 'Invalid UF code' })
    }
    params.set('codigoUf', String(uf))
  }

  try {
    const upstream = await fetch(`${CBS_BASE}/${endpoint}?${params}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Upstream error' })
    const data = await upstream.json()
    return res.status(200).json(data)
  } catch {
    return res.status(502).json({ error: 'CBS API unreachable' })
  }
}
