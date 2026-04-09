import { describe, it, expect } from 'vitest'
import { calculateFuelConsumption, validateFuelConsumption } from './fuel-consumption'

describe('fuel-consumption', () => {
    const base = {
        consumptionLPerHour: 20,
        operationalCapacityHaPerHour: 4,
        dieselPricePerLiter: 6.0,
    }

    describe('calculateFuelConsumption', () => {
        it('calculates liters per hectare', () => {
            const r = calculateFuelConsumption(base)
            expect(r.litersPerHa).toBe(5) // 20/4
        })

        it('calculates cost per hectare', () => {
            const r = calculateFuelConsumption(base)
            expect(r.costPerHa).toBe(30) // 5 * 6
        })

        it('returns null totals when areaHa not specified', () => {
            const r = calculateFuelConsumption(base)
            expect(r.totalCost).toBeNull()
            expect(r.totalLiters).toBeNull()
        })

        it('calculates totals when areaHa provided', () => {
            const r = calculateFuelConsumption({ ...base, areaHa: 100 })
            expect(r.totalLiters).toBe(500)
            expect(r.totalCost).toBe(3000)
        })

        it('handles high consumption rate', () => {
            const r = calculateFuelConsumption({ ...base, consumptionLPerHour: 50, operationalCapacityHaPerHour: 2 })
            expect(r.litersPerHa).toBe(25)
            expect(r.costPerHa).toBe(150)
        })
    })

    describe('validateFuelConsumption', () => {
        it('passes with valid inputs', () => {
            expect(validateFuelConsumption(base)).toBeNull()
        })

        it('rejects zero consumption', () => {
            expect(validateFuelConsumption({ ...base, consumptionLPerHour: 0 })).not.toBeNull()
        })

        it('rejects zero capacity', () => {
            expect(validateFuelConsumption({ ...base, operationalCapacityHaPerHour: 0 })).not.toBeNull()
        })

        it('rejects zero diesel price', () => {
            expect(validateFuelConsumption({ ...base, dieselPricePerLiter: 0 })).not.toBeNull()
        })
    })
})
