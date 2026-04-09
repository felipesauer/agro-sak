import { describe, it, expect } from 'vitest'
import { calculateSiloDimensioning, validateSiloDimensioning, FILL_FACTOR, BAG_CROSS_SECTION_M2 } from './silo-dimensioning'

describe('calculateSiloDimensioning', () => {
    it('silo cilíndrico — volume correto', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 15, grainType: 'soybean' })
        const grossVol = Math.PI * 6 ** 2 * 15
        expect(r.volumeM3).toBeCloseTo(grossVol * FILL_FACTOR, 1)
    })

    it('silo cilíndrico — capacidade em toneladas', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 15, grainType: 'soybean' })
        expect(r.capacityTonnes).toBeCloseTo(r.volumeM3 * 0.72, 1)
    })

    it('graneleiro retangular', () => {
        const r = calculateSiloDimensioning({ type: 'rectangular', lengthM: 60, widthM: 30, heightM: 8, grainType: 'corn' })
        const grossVol = 60 * 30 * 8
        expect(r.volumeM3).toBeCloseTo(grossVol * FILL_FACTOR, 1)
        expect(r.capacityTonnes).toBeCloseTo(r.volumeM3 * 0.73, 1)
    })

    it('silo bolsa', () => {
        const r = calculateSiloDimensioning({ type: 'bag', lengthM: 60, grainType: 'soybean' })
        const grossVol = BAG_CROSS_SECTION_M2 * 60
        expect(r.volumeM3).toBeCloseTo(grossVol * FILL_FACTOR, 1)
        expect(r.alerts.length).toBeGreaterThan(0) // should have bag alert
    })

    it('capacidade em sacas', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 15, grainType: 'rice' })
        // rice bag = 50 kg
        expect(r.capacityBags).toBeCloseTo((r.capacityTonnes * 1000) / 50, 0)
    })

    it('alerta para capacidade > 5000 t', () => {
        const r = calculateSiloDimensioning({ type: 'rectangular', lengthM: 200, widthM: 100, heightM: 10, grainType: 'soybean' })
        expect(r.alerts.some(a => a.includes('5.000 t'))).toBe(true)
    })

    it('fillPercent é 90%', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 10, heightM: 10, grainType: 'soybean' })
        expect(r.fillPercent).toBe(90)
    })
})

describe('validateSiloDimensioning', () => {
    it('cilíndrico sem diâmetro', () => {
        expect(validateSiloDimensioning({ type: 'cylindrical', diameterM: 0, heightM: 10, grainType: 'soybean' })).toBeTruthy()
    })

    it('retangular sem largura', () => {
        expect(validateSiloDimensioning({ type: 'rectangular', lengthM: 60, widthM: 0, heightM: 8, grainType: 'corn' })).toBeTruthy()
    })

    it('bolsa sem comprimento', () => {
        expect(validateSiloDimensioning({ type: 'bag', lengthM: 0, grainType: 'soybean' })).toBeTruthy()
    })

    it('diâmetro > 50m', () => {
        expect(validateSiloDimensioning({ type: 'cylindrical', diameterM: 55, heightM: 10, grainType: 'soybean' })).toBeTruthy()
    })

    it('válido cilíndrico', () => {
        expect(validateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 15, grainType: 'soybean' })).toBeNull()
    })

    it('cilíndrico sem altura', () => {
        expect(validateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 0, grainType: 'soybean' })).toBeTruthy()
    })

    it('altura > 40m', () => {
        expect(validateSiloDimensioning({ type: 'cylindrical', diameterM: 12, heightM: 45, grainType: 'soybean' })).toBeTruthy()
    })

    it('retangular sem comprimento', () => {
        expect(validateSiloDimensioning({ type: 'rectangular', lengthM: 0, widthM: 30, heightM: 8, grainType: 'corn' })).toBeTruthy()
    })

    it('retangular sem altura', () => {
        expect(validateSiloDimensioning({ type: 'rectangular', lengthM: 60, widthM: 30, heightM: 0, grainType: 'corn' })).toBeTruthy()
    })

    it('válido retangular', () => {
        expect(validateSiloDimensioning({ type: 'rectangular', lengthM: 60, widthM: 30, heightM: 8, grainType: 'corn' })).toBeNull()
    })

    it('válido bolsa', () => {
        expect(validateSiloDimensioning({ type: 'bag', lengthM: 60, grainType: 'soybean' })).toBeNull()
    })
})

describe('branch: unknown grain type fallback', () => {
    it('uses soybean defaults for unknown grainType', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 10, heightM: 10, grainType: 'unknown_grain' })
        const soybean = calculateSiloDimensioning({ type: 'cylindrical', diameterM: 10, heightM: 10, grainType: 'soybean' })
        expect(r.capacityTonnes).toBe(soybean.capacityTonnes)
    })
})

describe('branch: undefined optional params (?? 0 fallbacks)', () => {
    it('cylindrical without diameterM or heightM defaults to 0 volume', () => {
        const r = calculateSiloDimensioning({ type: 'cylindrical', grainType: 'soybean' })
        expect(r.volumeM3).toBe(0)
    })

    it('rectangular without dimensions defaults to 0 volume', () => {
        const r = calculateSiloDimensioning({ type: 'rectangular', grainType: 'corn' })
        expect(r.volumeM3).toBe(0)
    })

    it('bag without lengthM defaults to 0 volume', () => {
        const r = calculateSiloDimensioning({ type: 'bag', grainType: 'soybean' })
        expect(r.volumeM3).toBe(0)
    })
})
