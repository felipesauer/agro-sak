import { describe, it, expect } from 'vitest'
import { calculateWaterConsumption, validateWaterConsumption, CV_TO_KW } from './water-consumption'

describe('water-consumption', () => {
    const base = {
        areaHa: 100,
        et0MmDay: 5.0,
        kc: 1.1,
        efficiencyPercent: 85,
        pumpPowerCv: 75,
        electricityCostPerKwh: 0.85,
        hoursPerDay: 18,
    }

    describe('CV_TO_KW', () => {
        it('is 0.7355', () => expect(CV_TO_KW).toBe(0.7355))
    })

    describe('calculateWaterConsumption', () => {
        it('calculates daily lamina', () => {
            const r = calculateWaterConsumption(base)
            // ETc = 5.0 × 1.1 = 5.5 mm/day, lamina = 5.5 / 0.85 ≈ 6.47
            expect(r.dailyLaminaMm).toBeCloseTo(6.47, 1)
        })

        it('calculates daily water volume', () => {
            const r = calculateWaterConsumption(base)
            // 6.47 × 100 × 10 = 6470 m³/day
            expect(r.dailyWaterM3).toBeCloseTo(6470.6, 0)
        })

        it('calculates monthly water volume', () => {
            const r = calculateWaterConsumption(base)
            expect(r.monthlyWaterM3).toBeCloseTo(r.dailyWaterM3 * 30, 0)
        })

        it('calculates daily energy cost', () => {
            const r = calculateWaterConsumption(base)
            // pumpKw = 75 × 0.7355 = 55.1625
            // dailyKwh = 55.1625 × 18 = 992.925
            // dailyCost = 992.925 × 0.85 ≈ 843.99
            expect(r.dailyEnergyCost).toBeCloseTo(843.99, 0)
        })

        it('calculates monthly energy cost', () => {
            const r = calculateWaterConsumption(base)
            expect(r.monthlyEnergyCost).toBeCloseTo(r.dailyEnergyCost * 30, 1)
        })

        it('calculates cost per mm', () => {
            const r = calculateWaterConsumption(base)
            expect(r.costPerMm).toBeCloseTo(r.dailyEnergyCost / r.dailyLaminaMm, 1)
        })

        it('calculates cost per ha per month', () => {
            const r = calculateWaterConsumption(base)
            expect(r.costPerHaMonth).toBeCloseTo(r.monthlyEnergyCost / 100, 1)
        })

        it('handles low efficiency', () => {
            const r = calculateWaterConsumption({ ...base, efficiencyPercent: 50 })
            // lamina = 5.5 / 0.5 = 11 mm/day
            expect(r.dailyLaminaMm).toBe(11)
        })
    })

    describe('validateWaterConsumption', () => {
        it('passes with valid inputs', () => {
            expect(validateWaterConsumption(base)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateWaterConsumption({ ...base, areaHa: 0 })).not.toBeNull()
        })

        it('rejects zero ET0', () => {
            expect(validateWaterConsumption({ ...base, et0MmDay: 0 })).not.toBeNull()
        })

        it('rejects zero Kc', () => {
            expect(validateWaterConsumption({ ...base, kc: 0 })).not.toBeNull()
        })

        it('rejects efficiency > 100', () => {
            expect(validateWaterConsumption({ ...base, efficiencyPercent: 101 })).not.toBeNull()
        })

        it('rejects zero pump power', () => {
            expect(validateWaterConsumption({ ...base, pumpPowerCv: 0 })).not.toBeNull()
        })

        it('rejects zero electricity cost', () => {
            expect(validateWaterConsumption({ ...base, electricityCostPerKwh: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('costPerHaMonth is 0 when areaHa is 0', () => {
            const r = calculateWaterConsumption({ ...base, areaHa: 0 })
            expect(r.costPerHaMonth).toBe(0)
        })

        it('costPerMm is 0 when dailyLaminaMm is 0', () => {
            const r = calculateWaterConsumption({ ...base, et0MmDay: 0, kc: 0 })
            expect(r.costPerMm).toBe(0)
        })

        it('dailyLaminaMm falls back to etc when efficiency is 0', () => {
            const r = calculateWaterConsumption({ ...base, efficiencyPercent: 0 })
            // etc = 5.0 * 1.1 = 5.5, with efficiency=0 it should be etc itself
            expect(r.dailyLaminaMm).toBeCloseTo(5.5, 1)
        })
    })
})
