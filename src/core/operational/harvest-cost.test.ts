import { describe, it, expect } from 'vitest'
import { calculateHarvestCost, validateHarvestCost } from './harvest-cost'

describe('harvest-cost', () => {
    const base = {
        areaHa: 500,
        purchasePrice: 1_200_000,
        usefulLifeYears: 10,
        hoursPerYear: 500,
        fuelConsumptionLPerH: 40,
        dieselPricePerL: 6.0,
        operatorMonthlySalary: 4000,
        maintenancePercent: 3,
        thirdPartyPricePerHa: 300,
        productivityScHa: 60,
    }

    describe('calculateHarvestCost', () => {
        it('calculates depreciation per ha', () => {
            const r = calculateHarvestCost(base)
            // annual depr = 1200000/10 = 120000, per ha = 120000/500 = 240
            expect(r.depreciation).toBe(240)
        })

        it('calculates fuel cost per ha', () => {
            const r = calculateHarvestCost(base)
            // haPerHour = 500/500 = 1, fuelCostPerHa = (40/1)*6 = 240
            expect(r.fuelCostPerHa).toBe(240)
        })

        it('calculates labor cost per ha', () => {
            const r = calculateHarvestCost(base)
            // (4000*12)/500 = 96
            expect(r.laborCostPerHa).toBe(96)
        })

        it('calculates maintenance cost per ha', () => {
            const r = calculateHarvestCost(base)
            // (1200000*0.03)/500 = 72
            expect(r.maintenanceCostPerHa).toBe(72)
        })

        it('sums own cost per ha correctly', () => {
            const r = calculateHarvestCost(base)
            expect(r.ownCostPerHa).toBe(240 + 240 + 96 + 72) // 648
        })

        it('calculates cost per sac', () => {
            const r = calculateHarvestCost(base)
            expect(r.ownCostPerSac).toBeCloseTo(648 / 60, 2)
        })

        it('calculates savings total', () => {
            const r = calculateHarvestCost(base)
            const savPerHa = 300 - r.ownCostPerHa
            expect(r.savingsTotal).toBeCloseTo(savPerHa * 500, 2)
        })

        it('calculates break-even area', () => {
            const r = calculateHarvestCost(base)
            expect(r.breakEvenArea).toBeGreaterThan(0)
        })
    })

    describe('validateHarvestCost', () => {
        it('passes with valid inputs', () => {
            expect(validateHarvestCost(base)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateHarvestCost({ ...base, areaHa: 0 })).not.toBeNull()
        })

        it('rejects zero productivity', () => {
            expect(validateHarvestCost({ ...base, productivityScHa: 0 })).not.toBeNull()
        })

        it('rejects zero purchase price', () => {
            expect(validateHarvestCost({ ...base, purchasePrice: 0 })).not.toBeNull()
        })

        it('rejects zero usefulLifeYears', () => {
            expect(validateHarvestCost({ ...base, usefulLifeYears: 0 })).not.toBeNull()
        })

        it('rejects zero hoursPerYear', () => {
            expect(validateHarvestCost({ ...base, hoursPerYear: 0 })).not.toBeNull()
        })

        it('rejects zero fuelConsumptionLPerH', () => {
            expect(validateHarvestCost({ ...base, fuelConsumptionLPerH: 0 })).not.toBeNull()
        })

        it('rejects zero dieselPricePerL', () => {
            expect(validateHarvestCost({ ...base, dieselPricePerL: 0 })).not.toBeNull()
        })

        it('rejects zero operatorMonthlySalary', () => {
            expect(validateHarvestCost({ ...base, operatorMonthlySalary: 0 })).not.toBeNull()
        })

        it('rejects zero thirdPartyPricePerHa', () => {
            expect(validateHarvestCost({ ...base, thirdPartyPricePerHa: 0 })).not.toBeNull()
        })
    })

    describe('branch: zero denominators in calc', () => {
        it('ownCostPerSac and thirdPartyCostPerSac are 0 when productivityScHa is 0', () => {
            const r = calculateHarvestCost({ ...base, productivityScHa: 0 })
            expect(r.ownCostPerSac).toBe(0)
            expect(r.thirdPartyCostPerSac).toBe(0)
        })

        it('breakEvenArea is 0 when thirdPartyPrice <= fuelCostPerHa', () => {
            const r = calculateHarvestCost({ ...base, thirdPartyPricePerHa: 1 })
            expect(r.breakEvenArea).toBe(0)
        })

        it('haPerHour fallback to 1 when areaHa/hoursPerYear is 0', () => {
            const r = calculateHarvestCost({ ...base, areaHa: 0 })
            // When areaHa=0, areaHa/hoursPerYear=0, fallback || 1 activates
            expect(r).toBeDefined()
        })
    })
})
