import { describe, it, expect } from 'vitest'
import { calculatePlantSpacing, validatePlantSpacing } from './plant-spacing'

describe('plant-spacing', () => {
    describe('fromSpacing mode', () => {
        it('calculates plants per hectare', () => {
            const r = calculatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 45, plantSpacingCm: 20 })
            // 10000 / (0.45 * 0.20) = 111111
            expect(r.plantsPerHa).toBeCloseTo(111_111, 0)
        })

        it('calculates plants per meter', () => {
            const r = calculatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 45, plantSpacingCm: 20 })
            expect(r.plantsPerMeter).toBe(5)
        })

        it('calculates area per plant', () => {
            const r = calculatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 45, plantSpacingCm: 20 })
            expect(r.areaPerPlantM2).toBeCloseTo(0.09, 4)
        })
    })

    describe('fromPopulation mode', () => {
        it('calculates plant spacing from population', () => {
            const r = calculatePlantSpacing({ mode: 'fromPopulation', rowSpacingCm: 45, population: 320_000 })
            // plantsPerMeter = 320000 * 0.45 / 10000 = 14.4
            expect(r.plantsPerMeter).toBeCloseTo(14.4, 1)
            expect(r.plantSpacingCm).toBeCloseTo(100 / 14.4, 1)
        })

        it('preserves population in output', () => {
            const r = calculatePlantSpacing({ mode: 'fromPopulation', rowSpacingCm: 45, population: 320_000 })
            expect(r.plantsPerHa).toBe(320_000)
        })
    })

    describe('validatePlantSpacing', () => {
        it('passes', () =>
            expect(validatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 45, plantSpacingCm: 20 })).toBeNull())
        it('rejects zero row spacing', () =>
            expect(validatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 0, plantSpacingCm: 20 })).not.toBeNull())
        it('rejects zero population', () =>
            expect(validatePlantSpacing({ mode: 'fromPopulation', rowSpacingCm: 45, population: 0 })).not.toBeNull())
        it('rejects zero plantSpacingCm in fromSpacing mode', () =>
            expect(validatePlantSpacing({ mode: 'fromSpacing', rowSpacingCm: 45, plantSpacingCm: 0 })).not.toBeNull())
        it('passes validation for fromPopulation mode', () =>
            expect(validatePlantSpacing({ mode: 'fromPopulation', rowSpacingCm: 45, population: 320_000 })).toBeNull())
    })
})
