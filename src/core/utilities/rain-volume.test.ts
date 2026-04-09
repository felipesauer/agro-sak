import { describe, it, expect } from 'vitest'
import { calculateRainVolume, validateRainVolume } from './rain-volume'

describe('calculateRainVolume', () => {
    it('1mm em 1ha = 10000 litros', () => {
        const r = calculateRainVolume({ rainMm: 1, areaHa: 1 })
        expect(r.litersPerHa).toBe(10_000)
        expect(r.totalLiters).toBe(10_000)
        expect(r.totalCubicMeters).toBe(10)
    })

    it('30mm em 100ha', () => {
        const r = calculateRainVolume({ rainMm: 30, areaHa: 100 })
        expect(r.litersPerHa).toBe(300_000)
        expect(r.totalLiters).toBe(30_000_000)
        expect(r.totalCubicMeters).toBe(30_000)
    })

    it('calcula custo equivalente', () => {
        const r = calculateRainVolume({ rainMm: 10, areaHa: 50, pricePerCubicMeter: 0.12 })
        expect(r.equivalentCost).toBeCloseTo(50 * 100 * 0.12, 1) // 10mm*50ha*10m³/mm/ha * 0.12
    })

    it('sem preço, custo é zero', () => {
        const r = calculateRainVolume({ rainMm: 10, areaHa: 50 })
        expect(r.equivalentCost).toBe(0)
    })

    it('alerta chuva < 5mm', () => {
        const r = calculateRainVolume({ rainMm: 3, areaHa: 10 })
        expect(r.alerts.some(a => a.includes('evaporar'))).toBe(true)
    })

    it('alerta chuva >= 50mm', () => {
        const r = calculateRainVolume({ rainMm: 60, areaHa: 10 })
        expect(r.alerts.some(a => a.includes('erosão'))).toBe(true)
    })

    it('sem alerta para chuva moderada (20-49mm)', () => {
        const r = calculateRainVolume({ rainMm: 30, areaHa: 10 })
        expect(r.alerts).toHaveLength(0)
    })
})

describe('validateRainVolume', () => {
    it('rejeita chuva zero', () => {
        expect(validateRainVolume({ rainMm: 0, areaHa: 10 })).toBeTruthy()
    })

    it('rejeita chuva > 500mm', () => {
        expect(validateRainVolume({ rainMm: 501, areaHa: 10 })).toBeTruthy()
    })

    it('rejeita área zero', () => {
        expect(validateRainVolume({ rainMm: 10, areaHa: 0 })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateRainVolume({ rainMm: 30, areaHa: 100 })).toBeNull()
    })
})
