import { describe, it, expect } from 'vitest'
import {
    calculateItr,
    validateItr,
    getAreaBracket,
    getGUBracket,
} from './itr'

describe('getAreaBracket', () => {
    it.each([
        [30, 0], [50, 0],
        [51, 1], [200, 1],
        [201, 2], [500, 2],
        [501, 3], [1000, 3],
        [1001, 4], [5000, 4],
    ])('area %d → bracket %d', (area, expected) => {
        expect(getAreaBracket(area)).toBe(expected)
    })
})

describe('getGUBracket', () => {
    it.each([
        [80, 0], [100, 0],
        [65, 1], [79.9, 1],
        [50, 2], [64.9, 2],
        [0, 3], [49.9, 3],
    ])('GU %d%% → bracket %d', (gu, expected) => {
        expect(getGUBracket(gu)).toBe(expected)
    })
})

describe('calculateItr', () => {
    it('pequena propriedade com alta utilização → baixa alíquota', () => {
        const r = calculateItr({ totalArea: 30, usedArea: 28, vtnPerHa: 10000 })
        expect(r.gu).toBeCloseTo(93.33, 1)
        expect(r.rate).toBe(0.03)
        expect(r.itrAnnual).toBeCloseTo(90) // 300000 * 0.03%
    })

    it('grande propriedade com baixa utilização → alta alíquota', () => {
        const r = calculateItr({ totalArea: 1500, usedArea: 300, vtnPerHa: 25000 })
        expect(r.gu).toBeCloseTo(20, 0)
        expect(r.rate).toBe(8.60)
        expect(r.guLabel).toBe('< 50% (Baixo)')
    })

    it('ITR por hectare é proporcional', () => {
        const r = calculateItr({ totalArea: 100, usedArea: 90, vtnPerHa: 20000 })
        expect(r.itrPerHa).toBeCloseTo(r.itrAnnual / 100)
    })

    it('500ha com GU 70% → bracket (200-500, 65-80%)', () => {
        const r = calculateItr({ totalArea: 500, usedArea: 350, vtnPerHa: 15000 })
        expect(r.gu).toBe(70)
        expect(r.rate).toBe(0.60) // 200-500 ha, 65-80%
    })
})

describe('validateItr', () => {
    it('rejeita área zero', () => {
        expect(validateItr({ totalArea: 0, usedArea: 100, vtnPerHa: 10000 }))
            .toBe('Informe a área total')
    })

    it('rejeita usedArea > totalArea', () => {
        expect(validateItr({ totalArea: 100, usedArea: 150, vtnPerHa: 10000 }))
            .toBe('Área utilizada não pode ser maior que a área total')
    })

    it('aceita input válido', () => {
        expect(validateItr({ totalArea: 100, usedArea: 80, vtnPerHa: 20000 }))
            .toBeNull()
    })

    it('rejeita usedArea zero', () => {
        expect(validateItr({ totalArea: 100, usedArea: 0, vtnPerHa: 10000 }))
            .toBe('Informe a área utilizada')
    })

    it('rejeita vtnPerHa zero', () => {
        expect(validateItr({ totalArea: 100, usedArea: 80, vtnPerHa: 0 }))
            .toBe('Informe o VTN por hectare')
    })
})
