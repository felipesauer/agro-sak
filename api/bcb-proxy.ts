import type { VercelRequest, VercelResponse } from '@vercel/node'

const BCB_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const ALLOWED_SERIES = [1, 432] // 1=USD/BRL, 432=Selic

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://agrosak.com.br'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const series = parseInt(String(req.query.series ?? ''), 10)
  if (isNaN(series) || !ALLOWED_SERIES.includes(series)) {
    return res.status(400).json({ error: 'Invalid series code' })
  }

  try {
    const upstream = await fetch(
      `${BCB_BASE}.${series}/dados/ultimos/1?formato=json`,
      { signal: AbortSignal.timeout(10_000) },
    )
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Upstream error' })
    const data = await upstream.json()
    return res.status(200).json(data)
  } catch {
    return res.status(502).json({ error: 'BCB API unreachable' })
  }
}
