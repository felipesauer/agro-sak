import { describe, it, expect } from 'vitest'
import { calculateMachineryCost, validateMachineryCost, RESIDUAL_VALUE } from './machinery-cost'

describe('machinery-cost', () => {
    const base = {
        machineType: 'harvester',
        purchasePrice: 1_800_000,
        lifeYears: 12,
        hoursPerYear: 600,
        capitalRate: 0.08,
        insuranceRate: 0.015,
        maintenanceRate: 0.03,
        fuelConsumptionLPerH: 35,
        dieselPrice: 6.20,
        operatorSalary: 4500,
        operationalCapacityHaPerH: 12,
        rentalHourly: 850,
        rentalIncludesOperator: true,
        rentalIncludesFuel: true,
        outsourcePerHa: 250,
    }

    describe('RESIDUAL_VALUE', () => {
        it('harvester is 0.2', () => expect(RESIDUAL_VALUE['harvester']).toBe(0.2))
        it('tractor is 0.3', () => expect(RESIDUAL_VALUE['tractor']).toBe(0.3))
        it('planter is 0.15', () => expect(RESIDUAL_VALUE['planter']).toBe(0.15))
    })

    describe('calculateMachineryCost', () => {
        it('calculates own depreciation per hour', () => {
            const r = calculateMachineryCost(base)
            // vr = 0.2, depreciable = 1800000 * 0.8 = 1440000
            // depr/h = 1440000 / (12 × 600) = 1440000/7200 = 200
            expect(r.own.depreciation).toBe(200)
        })

        it('calculates own interest per hour', () => {
            const r = calculateMachineryCost(base)
            // 1800000 × 0.08 / 600 = 240
            expect(r.own.interest).toBe(240)
        })

        it('calculates own fuel per hour', () => {
            const r = calculateMachineryCost(base)
            // 35 × 6.20 = 217
            expect(r.own.fuel).toBe(217)
        })

        it('calculates own operator per hour', () => {
            const r = calculateMachineryCost(base)
            // 4500 × 13.33 / 600 = 99.975
            expect(r.own.operator).toBeCloseTo(99.975, 2)
        })

        it('calculates own cost per ha', () => {
            const r = calculateMachineryCost(base)
            expect(r.own.perHa).toBeCloseTo(r.own.total / 12, 2)
        })

        it('adds operator/fuel to rental when not included', () => {
            const r = calculateMachineryCost({
                ...base,
                rentalIncludesOperator: false,
                rentalIncludesFuel: false,
            })
            expect(r.rental.totalH).toBeCloseTo(850 + r.own.operator + r.own.fuel, 2)
        })

        it('rental h stays as-is when all included', () => {
            const r = calculateMachineryCost(base)
            expect(r.rental.totalH).toBe(850)
        })

        it('identifies cheapest option', () => {
            const r = calculateMachineryCost(base)
            expect(r.cheapest).toBeTruthy()
        })

        it('calculates break-even hours', () => {
            const r = calculateMachineryCost(base)
            expect(r.breakEvenHoursPerYear).toBeGreaterThan(0)
        })
    })

    describe('validateMachineryCost', () => {
        it('passes with valid inputs', () => {
            expect(validateMachineryCost(base)).toBeNull()
        })

        it('rejects zero purchase price', () => {
            expect(validateMachineryCost({ ...base, purchasePrice: 0 })).not.toBeNull()
        })

        it('rejects zero hours per year', () => {
            expect(validateMachineryCost({ ...base, hoursPerYear: 0 })).not.toBeNull()
        })

        it('rejects zero capacity', () => {
            expect(validateMachineryCost({ ...base, operationalCapacityHaPerH: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('uses default residual for unknown machineType', () => {
            const r = calculateMachineryCost({ ...base, machineType: 'unknown' })
            // fallback vr = 0.2, same as harvester
            expect(r.own.depreciation).toBe(200)
        })

        it('breakEvenHoursPerYear is 0 when savingPerH <= 0', () => {
            const r = calculateMachineryCost({ ...base, rentalHourly: 0 })
            expect(r.breakEvenHoursPerYear).toBe(0)
        })
    })
})
