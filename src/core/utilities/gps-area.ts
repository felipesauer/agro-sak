// ── GPS Area ──

export interface GpsPoint {
    lat: number
    lng: number
}

export interface GpsAreaResult {
    areaM2: number
    areaHa: number
    perimeterM: number
    selfIntersecting: boolean
}

export const ALQ_HA: Record<string, number> = {
    mt: 4.84,
    sp: 2.42,
    mg: 4.84,
    pr: 2.42,
}

function toRad(deg: number): number {
    return (deg * Math.PI) / 180
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
}

function sphericalArea(coords: Array<[number, number]>): number {
    const n = coords.length
    if (n < 3) return 0

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

function segmentsIntersect(
    p1: [number, number], p2: [number, number],
    p3: [number, number], p4: [number, number],
): boolean {
    const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
        (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    const d1 = cross(p3, p4, p1)
    const d2 = cross(p3, p4, p2)
    const d3 = cross(p1, p2, p3)
    const d4 = cross(p1, p2, p4)
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true
    return false
}

function isSelfIntersecting(coords: Array<[number, number]>): boolean {
    const n = coords.length
    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
            if (i === 0 && j === n - 1) continue
            if (segmentsIntersect(coords[i], coords[(i + 1) % n], coords[j], coords[(j + 1) % n])) {
                return true
            }
        }
    }
    return false
}

export function calculateGpsArea(points: GpsPoint[]): GpsAreaResult | null {
    const coords: Array<[number, number]> = points
        .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
        .map((p) => [p.lat, p.lng])

    if (coords.length < 3) return null

    const areaM2 = sphericalArea(coords)
    const areaHa = areaM2 / 10000
    const perimeterM = perimeterFromCoords(coords)
    const selfIntersecting = isSelfIntersecting(coords)

    return { areaM2, areaHa, perimeterM, selfIntersecting }
}

export function validateGpsArea(points: GpsPoint[]): string | null {
    const valid = points.filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
    if (valid.length < 3) return 'São necessários ao menos 3 pontos válidos'
    for (const p of valid) {
        if (p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180)
            return 'Coordenadas inválidas. Latitude: -90 a 90, Longitude: -180 a 180'
    }
    return null
}
