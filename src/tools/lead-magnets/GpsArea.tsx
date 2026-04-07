import { useState, useCallback } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Point {
  id: string
  lat: string
  lng: string
}

interface Result {
  areaM2: number
  areaHa: number
  areaAlq: number
  perimeter: number
}

const ALQ_OPTIONS = [
  { value: 'mt', label: 'Alqueire MT/GO (4,84 ha)' },
  { value: 'sp', label: 'Alqueire SP (2,42 ha)' },
  { value: 'mg', label: 'Alqueire MG/RJ (4,84 ha)' },
  { value: 'pr', label: 'Alqueire PR (2,42 ha)' },
]

const ALQ_HA: Record<string, number> = {
  mt: 4.84,
  sp: 2.42,
  mg: 4.84,
  pr: 2.42,
}

// ── Geodesic calculations ──

function toRad(deg: number) { return (deg * Math.PI) / 180 }

// Haversine distance (meters)
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Spherical polygon area using Shoelace on spherical coordinates (m²)
function sphericalArea(coords: Array<[number, number]>): number {
  const n = coords.length
  if (n < 3) return 0

  // Simple Shoelace using projected (flat) approximation
  // For small areas this is accurate enough
  const refLat = coords[0][0]
  const mPerDegLat = 111320
  const mPerDegLng = 111320 * Math.cos(toRad(refLat))

  const projected = coords.map(([lat, lng]) => [
    (lat - refLat) * mPerDegLat,
    (lng - coords[0][1]) * mPerDegLng,
  ])

  let area = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += projected[i][0] * projected[j][1]
    area -= projected[j][0] * projected[i][1]
  }
  return Math.abs(area) / 2
}

function perimeterFromCoords(coords: Array<[number, number]>): number {
  let total = 0
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length
    total += haversine(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
  }
  return total
}

let _pointId = 0

// ── Component ──

export default function GpsArea() {
  const [points, setPoints] = useState<Point[]>([
    { id: `pt-${++_pointId}`, lat: '', lng: '' },
    { id: `pt-${++_pointId}`, lat: '', lng: '' },
    { id: `pt-${++_pointId}`, lat: '', lng: '' },
  ])
  const [alqType, setAlqType] = useState('mt')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  function updatePoint(idx: number, key: 'lat' | 'lng', val: string) {
    setPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: val } : p)))
  }

  function addPoint() {
    setPoints((prev) => [...prev, { id: `pt-${++_pointId}`, lat: '', lng: '' }])
  }

  function removePoint(idx: number) {
    if (points.length <= 3) return
    setPoints((prev) => prev.filter((_, i) => i !== idx))
  }

  const captureGps = useCallback((idx: number) => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste navegador')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoints((prev) =>
          prev.map((p, i) =>
            i === idx
              ? { ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }
              : p
          )
        )
        setGpsLoading(false)
      },
      () => {
        setError('Não foi possível obter a localização GPS')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  function run() {
    const coords: Array<[number, number]> = []
    for (const p of points) {
      const lat = parseFloat(p.lat)
      const lng = parseFloat(p.lng)
      if (isNaN(lat) || isNaN(lng)) continue
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Coordenadas inválidas. Latitude: -90 a 90, Longitude: -180 a 180')
        return
      }
      coords.push([lat, lng])
    }

    if (coords.length < 3) {
      setError('São necessários ao menos 3 pontos válidos')
      return
    }

    const areaM2 = sphericalArea(coords)
    const areaHa = areaM2 / 10000
    const alqHa = ALQ_HA[alqType] ?? 4.84
    const areaAlq = areaHa / alqHa
    const perimeter = perimeterFromCoords(coords)

    setError(null)
    setResult({ areaM2, areaHa, areaAlq, perimeter })
  }

  function clear() {
    setPoints([{ id: crypto.randomUUID(), lat: '', lng: '' }, { id: crypto.randomUUID(), lat: '', lng: '' }, { id: crypto.randomUUID(), lat: '', lng: '' }])
    setResult(null)
    setError(null)
  }

  return (
    <CalculatorLayout
      title="Calculadora de Área por GPS"
      description="Insira as coordenadas dos vértices do talhão ou use o GPS do celular para capturar os pontos. Área calculada pelo algoritmo de Shoelace."
      about="Calcule a área de um polígono definido por coordenadas GPS (latitude/longitude). Obtenha a área em hectares, alqueires e metros quadrados, além do perímetro."
      methodology="Algoritmo do Shoelace (Gauss) adaptado para coordenadas esféricas. Perímetro calculado pela fórmula de Haversine. Precisão adequada para áreas rurais."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="Área" value={formatNumber(result.areaM2, 0)} unit="m²" variant="default" />
              <ResultCard label="Área" value={formatNumber(result.areaHa, 2)} unit="ha" highlight variant="default" />
              <ResultCard label="Área" value={formatNumber(result.areaAlq, 2)} unit="alqueires" variant="default" />
              <ResultCard label="Perímetro" value={formatNumber(result.perimeter, 0)} unit="m" variant="default" />
            </div>
            <AlertBanner
              variant="info"
              message="Precisão estimada: ±2-5% dependendo da qualidade do GPS. Para medições oficiais, utilize topografia profissional."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Tipo de alqueire"
        options={ALQ_OPTIONS}
        value={alqType}
        onChange={setAlqType}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Vértices do polígono</h3>
        {points.map((p, i) => (
          <div key={p.id} className="flex items-end gap-2">
            <span className="text-xs text-gray-500 w-6 text-center mb-2">{i + 1}</span>
            <div className="flex-1">
              <InputField
                label={i === 0 ? 'Latitude' : ''}
                value={p.lat}
                onChange={(v) => updatePoint(i, 'lat', v as string)}
                placeholder="ex: -15.789456"
              />
            </div>
            <div className="flex-1">
              <InputField
                label={i === 0 ? 'Longitude' : ''}
                value={p.lng}
                onChange={(v) => updatePoint(i, 'lng', v as string)}
                placeholder="ex: -47.891234"
              />
            </div>
            <button
              type="button"
              onClick={() => captureGps(i)}
              disabled={gpsLoading}
              className="text-xs text-agro-600 hover:text-agro-800 mb-2 whitespace-nowrap"
              title="Capturar posição GPS atual"
            >
              GPS
            </button>
            {points.length > 3 && (
              <button
                type="button"
                onClick={() => removePoint(i)}
                className="text-red-500 text-xs hover:underline mb-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addPoint}
        className="text-sm text-agro-600 hover:text-agro-800 font-medium"
      >
        + Adicionar ponto
      </button>

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
