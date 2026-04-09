import { describe, it, expect } from 'vitest'
import { calculateMachineDepreciation, validateMachineDepreciation, maintenanceRate } from './machine-depreciation'

describe('machine-depreciation', () => {
    const base = {
        purchasePrice: 600000,
        residualPercent: 20,
        lifeYears: 10,
        totalLifeHours: 10000,
        hoursPerYear: 1000,
        method: 'linear' as const,
    }

    describe('maintenanceRate', () => {
        it('returns 2% for years 1-3', () => {
            expect(maintenanceRate(1)).toBe(0.02)
            expect(maintenanceRate(3)).toBe(0.02)
        })
        it('returns 3.5% for years 4-6', () => {
            expect(maintenanceRate(4)).toBe(0.035)
            expect(maintenanceRate(6)).toBe(0.035)
        })
        it('returns 5% for years 7+', () => {
            expect(maintenanceRate(7)).toBe(0.05)
            expect(maintenanceRate(10)).toBe(0.05)
        })
    })

    describe('calculateMachineDepreciation — linear', () => {
        it('calculates annual depreciation', () => {
            const r = calculateMachineDepreciation(base)
            // depreciable = 600000 * 0.8 = 480000, /10 years = 48000
            expect(r.depreciationYear).toBe(48000)
        })

        it('calculates hourly depreciation from annual', () => {
            const r = calculateMachineDepreciation(base)
            expect(r.depreciationHour).toBe(48) // 48000/1000
        })

        it('generates year table with correct length', () => {
            const r = calculateMachineDepreciation(base)
            expect(r.yearTable).toHaveLength(10)
        })

        it('year table market value never below residual', () => {
            const r = calculateMachineDepreciation(base)
            const residual = 600000 * 0.2
            r.yearTable.forEach((row) => {
                expect(row.marketValue).toBeGreaterThanOrEqual(residual)
            })
        })

        it('calculates TCO as sum of depreciation + maintenance', () => {
            const r = calculateMachineDepreciation(base)
            const expectedTco = r.yearTable.reduce((s, row) => s + row.depreciation + row.maintenance, 0)
            expect(r.totalCostOfOwnership).toBeCloseTo(expectedTco, 2)
        })
    })

    describe('calculateMachineDepreciation — hours', () => {
        it('calculates hourly depreciation from total life hours', () => {
            const r = calculateMachineDepreciation({ ...base, method: 'hours' })
            // depreciable = 480000, /10000 hours = 48
            expect(r.depreciationHour).toBe(48)
        })

        it('derives annual depreciation from hours', () => {
            const r = calculateMachineDepreciation({ ...base, method: 'hours' })
            expect(r.depreciationYear).toBe(48000) // 48 * 1000
        })
    })

    describe('alertLifePercent', () => {
        it('calculates percent of life used', () => {
            const r = calculateMachineDepreciation(base)
            // 1000 * 10 = 10000 hours used / 10000 total = 100%
            expect(r.alertLifePercent).toBe(100)
        })

        it('correctly shows under-utilized', () => {
            const r = calculateMachineDepreciation({ ...base, hoursPerYear: 500 })
            // 500 * 10 / 10000 = 50%
            expect(r.alertLifePercent).toBe(50)
        })
    })

    describe('validateMachineDepreciation', () => {
        it('passes with valid inputs', () => {
            expect(validateMachineDepreciation(base)).toBeNull()
        })
        it('rejects zero purchase price', () => {
            expect(validateMachineDepreciation({ ...base, purchasePrice: 0 })).not.toBeNull()
        })
        it('rejects zero lifeYears', () => {
            expect(validateMachineDepreciation({ ...base, lifeYears: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('alertLifePercent is 0 when totalLifeHours is 0', () => {
            const r = calculateMachineDepreciation({ ...base, totalLifeHours: 0 })
            expect(r.alertLifePercent).toBe(0)
        })
    })
})
