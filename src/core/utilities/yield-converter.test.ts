import { describe, it, expect } from 'vitest'
import { calculateYieldConverter, validateYieldConverter } from './yield-converter'

describe('calculateYieldConverter', () => {
    it('sc/ha → kg/ha (soja 60kg)', () => {
        const r = calculateYieldConverter({ value: 60, fromUnit: 'sc_ha', bagWeightKg: 60, buAcFactor: 0.8896 })!
        expect(r.kgHa).toBe(3600)
        expect(r.scHa).toBe(60)
        expect(r.tHa).toBe(3.6)
        expect(r.buAc).toBeCloseTo(53.376, 2) // 60 * 0.8896
    })

    it('kg/ha → sc/ha', () => {
        const r = calculateYieldConverter({ value: 3600, fromUnit: 'kg_ha', bagWeightKg: 60, buAcFactor: null })!
        expect(r.scHa).toBe(60)
        expect(r.buAc).toBeNull()
    })

    it('t/ha → kg/ha', () => {
        const r = calculateYieldConverter({ value: 3.6, fromUnit: 't_ha', bagWeightKg: 60, buAcFactor: null })!
        expect(r.kgHa).toBe(3600)
        expect(r.scHa).toBe(60)
    })

    it('bu/ac → kg/ha', () => {
        const r = calculateYieldConverter({ value: 53.376, fromUnit: 'bu_ac', bagWeightKg: 60, buAcFactor: 0.8896 })!
        expect(r.scHa).toBeCloseTo(60, 0)
        expect(r.kgHa).toBeCloseTo(3600, 0)
    })

    it('retorna null sem buAcFactor para bu_ac', () => {
        const r = calculateYieldConverter({ value: 50, fromUnit: 'bu_ac', bagWeightKg: 60, buAcFactor: null })
        expect(r).toBeNull()
    })

    it('arroz — saca de 50kg', () => {
        const r = calculateYieldConverter({ value: 100, fromUnit: 'sc_ha', bagWeightKg: 50, buAcFactor: null })!
        expect(r.kgHa).toBe(5000)
        expect(r.tHa).toBe(5)
    })
})

describe('validateYieldConverter', () => {
    it('rejeita valor zero', () => {
        expect(validateYieldConverter({ value: 0, fromUnit: 'sc_ha', buAcFactor: null })).toBeTruthy()
    })

    it('rejeita negativo', () => {
        expect(validateYieldConverter({ value: -10, fromUnit: 'sc_ha', buAcFactor: null })).toBeTruthy()
    })

    it('rejeita bu_ac sem fator', () => {
        expect(validateYieldConverter({ value: 50, fromUnit: 'bu_ac', buAcFactor: null })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateYieldConverter({ value: 60, fromUnit: 'sc_ha', buAcFactor: 0.89 })).toBeNull()
    })
})
