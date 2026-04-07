import type { VercelRequest, VercelResponse } from '@vercel/node'

const CBS_BASE = 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos'
const ALLOWED_ENDPOINTS = ['aliquota-uniao', 'aliquota-uf']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const endpoint = String(req.query.endpoint ?? '')
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' })
  }

  const params = new URLSearchParams()
  if (req.query.data) params.set('data', String(req.query.data))
  if (req.query.codigoUf) params.set('codigoUf', String(req.query.codigoUf))

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
