import { describe, it, expect } from 'vitest'
import { calculateSeedingRate, validateSeedingRate } from './seeding-rate'

describe('seeding-rate', () => {
    const base = {
        population: 320_000,
        rowSpacingCm: 45,
        germinationPercent: 85,
        vigorPercent: 90,
        tswGrams: 145,
        bagWeightKg: 40,
    }

    describe('calculateSeedingRate', () => {
        it('calculates seeds per meter', () => {
            const r = calculateSeedingRate(base)
            // 320000 * 0.45 / 10000 = 14.4
            expect(r.seedsPerMeter).toBeCloseTo(14.4, 1)
        })

        it('adjusts for germination and vigor', () => {
            const r = calculateSeedingRate(base)
            // 320000 / (0.85 * 0.90) = 418300.6
            expect(r.adjustedSeedsPerHa).toBeCloseTo(418_300.6, 0)
        })

        it('calculates kg per ha', () => {
            const r = calculateSeedingRate(base)
            // 418300.6 * 145 / 1000000 = 60.65
            expect(r.kgPerHa).toBeCloseTo(60.65, 0)
        })

        it('calculates bags per ha', () => {
            const r = calculateSeedingRate(base)
            expect(r.bagsPerHa).toBeCloseTo(r.kgPerHa / 40, 2)
        })

        it('cost is null without price', () => {
            const r = calculateSeedingRate(base)
            expect(r.costPerHa).toBeNull()
        })

        it('cost calculated with price', () => {
            const r = calculateSeedingRate({ ...base, seedPricePerBag: 350 })
            expect(r.costPerHa).toBeCloseTo(r.bagsPerHa * 350, 0)
        })
    })

    describe('validateSeedingRate', () => {
        it('passes', () => expect(validateSeedingRate(base)).toBeNull())
        it('rejects germ < 50', () => expect(validateSeedingRate({ ...base, germinationPercent: 40 })).not.toBeNull())
        it('rejects missing population', () => expect(validateSeedingRate({ ...base, population: 0 })).not.toBeNull())
        it('rejects zero rowSpacingCm', () => expect(validateSeedingRate({ ...base, rowSpacingCm: 0 })).not.toBeNull())
        it('rejects zero germinationPercent', () => expect(validateSeedingRate({ ...base, germinationPercent: 0 })).not.toBeNull())
        it('rejects zero vigorPercent', () => expect(validateSeedingRate({ ...base, vigorPercent: 0 })).not.toBeNull())
        it('rejects zero tswGrams', () => expect(validateSeedingRate({ ...base, tswGrams: 0 })).not.toBeNull())
        it('rejects vigor > 100', () => expect(validateSeedingRate({ ...base, vigorPercent: 101 })).not.toBeNull())
    })
})
