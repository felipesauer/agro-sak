// Cloudflare Worker — API proxy for BCB and CBS/IBS
// Bypasses CORS restrictions for browser clients on GitHub Pages

interface Env {
  ALLOWED_ORIGIN: string
}

const BCB_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const CBS_BASE = 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos'

const ALLOWED_BCB_SERIES = [1, 432]
const ALLOWED_CBS_ENDPOINTS = ['aliquota-uniao', 'aliquota-uf']

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

async function handleBcb(url: URL, env: Env): Promise<Response> {
  const series = parseInt(url.searchParams.get('series') ?? '', 10)
  if (isNaN(series) || !ALLOWED_BCB_SERIES.includes(series)) {
    return Response.json({ error: 'Invalid series code' }, { status: 400, headers: corsHeaders(env.ALLOWED_ORIGIN) })
  }

  try {
    const upstream = await fetch(`${BCB_BASE}.${series}/dados/ultimos/1?formato=json`)

    if (!upstream.ok) {
      return Response.json(
        { error: 'Upstream error', status: upstream.status },
        { status: upstream.status, headers: corsHeaders(env.ALLOWED_ORIGIN) },
      )
    }

    const data = await upstream.text()
    return new Response(data, {
      headers: {
        ...corsHeaders(env.ALLOWED_ORIGIN),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    return Response.json(
      { error: 'BCB API unreachable', detail: String(err) },
      { status: 502, headers: corsHeaders(env.ALLOWED_ORIGIN) },
    )
  }
}

async function handleCbs(url: URL, env: Env): Promise<Response> {
  const endpoint = url.searchParams.get('endpoint') ?? ''
  if (!ALLOWED_CBS_ENDPOINTS.includes(endpoint)) {
    return Response.json({ error: 'Invalid endpoint' }, { status: 400, headers: corsHeaders(env.ALLOWED_ORIGIN) })
  }

  const params = new URLSearchParams()
  for (const [key, value] of url.searchParams) {
    if (key !== 'endpoint') params.set(key, value)
  }

  try {
    const upstream = await fetch(`${CBS_BASE}/${endpoint}?${params}`)

    if (!upstream.ok) {
      return Response.json(
        { error: 'Upstream error', status: upstream.status },
        { status: upstream.status, headers: corsHeaders(env.ALLOWED_ORIGIN) },
      )
    }

    const data = await upstream.text()
    return new Response(data, {
      headers: {
        ...corsHeaders(env.ALLOWED_ORIGIN),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    return Response.json(
      { error: 'CBS API unreachable', detail: String(err) },
      { status: 502, headers: corsHeaders(env.ALLOWED_ORIGIN) },
    )
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env.ALLOWED_ORIGIN) })
    }

    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders(env.ALLOWED_ORIGIN) })
    }

    const url = new URL(request.url)

    if (url.pathname === '/bcb') return handleBcb(url, env)
    if (url.pathname === '/cbs') return handleCbs(url, env)

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders(env.ALLOWED_ORIGIN) })
  },
}
