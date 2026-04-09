import { describe, it, expect } from 'vitest'
import { convert, validateConversion, AREA_UNITS, WEIGHT_UNITS, YIELD_UNITS } from './unit-converter'

describe('unit-converter', () => {
    describe('convert', () => {
        it('converts hectares to hectares (identity)', () => {
            expect(convert(10, 1, 1)).toBeCloseTo(10, 4)
        })

        it('converts hectares to alqueire SP', () => {
            // 10 ha * 1 / 2.42 = ~4.132 alqueires
            expect(convert(10, 1, 2.42)).toBeCloseTo(10 / 2.42, 4)
        })

        it('converts alqueire MT to hectares', () => {
            // 1 alqueire MT = 4.84 ha
            expect(convert(1, 4.84, 1)).toBeCloseTo(4.84, 4)
        })

        it('converts kg to toneladas', () => {
            expect(convert(1000, 1, 1000)).toBeCloseTo(1, 4)
        })

        it('converts sacas to kg', () => {
            // 10 sacas * 60 kg/saca / 1 = 600 kg
            expect(convert(10, 60, 1)).toBeCloseTo(600, 4)
        })

        it('converts kg to arrobas', () => {
            // 150 kg * 1 / 15 = 10 arrobas
            expect(convert(150, 1, 15)).toBeCloseTo(10, 4)
        })

        it('converts sc/ha to kg/ha', () => {
            // 55 sc/ha * 60 / 1 = 3300 kg/ha
            expect(convert(55, 60, 1)).toBeCloseTo(3300, 4)
        })

        it('converts m² to hectares', () => {
            // 10000 m² * 0.0001 / 1 = 1 ha
            expect(convert(10000, 0.0001, 1)).toBeCloseTo(1, 4)
        })

        it('handles zero value', () => {
            expect(convert(0, 60, 1)).toBe(0)
        })
    })

    describe('validateConversion', () => {
        it('returns null for valid positive number', () => {
            expect(validateConversion(10)).toBeNull()
        })

        it('returns null for zero', () => {
            expect(validateConversion(0)).toBeNull()
        })

        it('rejects NaN', () => {
            expect(validateConversion(NaN)).toBeTruthy()
        })

        it('rejects negative values', () => {
            expect(validateConversion(-5)).toBeTruthy()
        })
    })

    describe('unit definitions', () => {
        it('AREA_UNITS has hectare as base=1', () => {
            const ha = AREA_UNITS.find((u) => u.value === 'hectare')!
            expect(ha.toBase).toBe(1)
        })

        it('WEIGHT_UNITS has kg as base=1', () => {
            const kg = WEIGHT_UNITS.find((u) => u.value === 'kg')!
            expect(kg.toBase).toBe(1)
        })

        it('YIELD_UNITS has kg_ha as base=1', () => {
            const kgha = YIELD_UNITS.find((u) => u.value === 'kg_ha')!
            expect(kgha.toBase).toBe(1)
        })

        it('bushel soja weight is 27.216 kg', () => {
            const bu = WEIGHT_UNITS.find((u) => u.value === 'bushel_soja')!
            expect(bu.toBase).toBeCloseTo(27.216, 3)
        })
    })

    describe('branch: edge cases', () => {
        it('convert returns Infinity when toToBase is 0', () => {
            expect(convert(10, 1, 0)).toBe(Infinity)
        })
    })
})
