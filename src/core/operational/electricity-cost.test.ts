import { describe, it, expect } from 'vitest'
import { calculateElectricityCost, validateElectricityCost } from './electricity-cost'

describe('electricity-cost', () => {
    const base = {
        power: 100,
        powerUnit: 'cv' as const,
        hoursPerDay: 10,
        daysPerMonth: 20,
        months: 12,
        energyRatePerKwh: 0.85,
        demandChargePerKw: 30,
    }

    describe('calculateElectricityCost', () => {
        it('converts cv to kw', () => {
            const r = calculateElectricityCost(base)
            expect(r.powerKW).toBeCloseTo(73.55, 2) // 100 × 0.7355
        })

        it('converts hp to kw', () => {
            const r = calculateElectricityCost({ ...base, powerUnit: 'hp' })
            expect(r.powerKW).toBeCloseTo(74.57, 2) // 100 × 0.7457
        })

        it('passes kw through unchanged', () => {
            const r = calculateElectricityCost({ ...base, powerUnit: 'kw' })
            expect(r.powerKW).toBe(100)
        })

        it('calculates monthly kWh', () => {
            const r = calculateElectricityCost(base)
            // 73.55 × (10 × 20) = 73.55 × 200 = 14710
            expect(r.monthlyKWh).toBeCloseTo(14710, 0)
        })

        it('calculates annual kWh', () => {
            const r = calculateElectricityCost(base)
            expect(r.annualKWh).toBeCloseTo(14710 * 12, 0)
        })

        it('calculates monthly energy cost', () => {
            const r = calculateElectricityCost(base)
            // 14710 × 0.85 = 12503.50
            expect(r.monthlyCostEnergy).toBeCloseTo(12503.5, 0)
        })

        it('calculates monthly demand cost', () => {
            const r = calculateElectricityCost(base)
            // 73.55 × 30 = 2206.50
            expect(r.monthlyCostDemand).toBeCloseTo(2206.5, 0)
        })

        it('sums monthly total', () => {
            const r = calculateElectricityCost(base)
            expect(r.monthlyCostTotal).toBeCloseTo(r.monthlyCostEnergy + r.monthlyCostDemand, 2)
        })

        it('calculates annual cost', () => {
            const r = calculateElectricityCost(base)
            expect(r.annualCost).toBeCloseTo(r.monthlyCostTotal * 12, 2)
        })

        it('returns null costPerHa without area', () => {
            const r = calculateElectricityCost(base)
            expect(r.costPerHa).toBeNull()
        })

        it('calculates costPerHa with area', () => {
            const r = calculateElectricityCost({ ...base, areaHa: 100 })
            expect(r.costPerHa).toBeCloseTo(r.annualCost / 100, 2)
        })

        it('calculates cost per hour', () => {
            const r = calculateElectricityCost(base)
            expect(r.costPerHour).toBeCloseTo(r.monthlyCostTotal / 200, 2)
        })
    })

    describe('validateElectricityCost', () => {
        it('passes with valid inputs', () => {
            expect(validateElectricityCost(base)).toBeNull()
        })

        it('rejects zero power', () => {
            expect(validateElectricityCost({ ...base, power: 0 })).not.toBeNull()
        })

        it('rejects power > 10000', () => {
            expect(validateElectricityCost({ ...base, power: 10001 })).not.toBeNull()
        })

        it('rejects hours > 24', () => {
            expect(validateElectricityCost({ ...base, hoursPerDay: 25 })).not.toBeNull()
        })

        it('rejects zero energy rate', () => {
            expect(validateElectricityCost({ ...base, energyRatePerKwh: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('costPerHour is 0 when monthlyHours is 0', () => {
            const r = calculateElectricityCost({ ...base, hoursPerDay: 0, daysPerMonth: 0 })
            expect(r.costPerHour).toBe(0)
        })
    })
})
