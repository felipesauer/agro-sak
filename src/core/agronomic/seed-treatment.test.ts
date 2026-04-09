import { describe, it, expect } from 'vitest'
import { calculateSeedTreatment, validateSeedTreatment } from './seed-treatment'

describe('seed-treatment', () => {
    const product1 = { name: 'Standak Top', type: 'fungicide', dosePerKg: 200, pricePerLiter: 200 }
    const product2 = { name: 'Cruiser', type: 'insecticide', dosePerKg: 150, pricePerLiter: 350 }

    const base = {
        areaHa: 500,
        seedRateKgHa: 60,
        slots: [
            { product: product1 },
            { product: product2 },
        ],
    }

    describe('calculateSeedTreatment', () => {
        it('calculates total seed kg', () => {
            const r = calculateSeedTreatment(base)
            expect(r.totalSeedKg).toBe(30_000)
        })

        it('calculates product volume', () => {
            const r = calculateSeedTreatment(base)
            // Product 1: (200/100) * 30000 = 60000 mL = 60 L
            expect(r.products[0].totalMl).toBe(60_000)
            expect(r.products[0].totalLiters).toBe(60)
        })

        it('calculates product cost', () => {
            const r = calculateSeedTreatment(base)
            // 60 L * 200 R$/L = 12000
            expect(r.products[0].cost).toBe(12_000)
        })

        it('sums total cost', () => {
            const r = calculateSeedTreatment(base)
            expect(r.totalCostTotal).toBe(r.products.reduce((s, p) => s + p.cost, 0))
        })

        it('custom dose overrides default', () => {
            const r = calculateSeedTreatment({
                ...base,
                slots: [{ product: product1, customDose: 300 }],
            })
            expect(r.products[0].totalMl).toBe((300 / 100) * 30_000)
        })

        it('custom price overrides default', () => {
            const r = calculateSeedTreatment({
                ...base,
                slots: [{ product: product1, customPrice: 250 }],
            })
            expect(r.products[0].cost).toBe(60 * 250)
        })

        it('returns zero per-ha values when areaHa is 0', () => {
            const r = calculateSeedTreatment({ ...base, areaHa: 0 })
            expect(r.totalCostPerHa).toBe(0)
            expect(r.totalVolumePerHa).toBe(0)
        })
    })

    describe('validateSeedTreatment', () => {
        it('passes', () => expect(validateSeedTreatment(base)).toBeNull())
        it('rejects zero area', () => expect(validateSeedTreatment({ ...base, areaHa: 0 })).not.toBeNull())
        it('rejects no slots', () => expect(validateSeedTreatment({ ...base, slots: [] })).not.toBeNull())
        it('rejects zero seedRateKgHa', () => expect(validateSeedTreatment({ ...base, seedRateKgHa: 0 })).not.toBeNull())
    })
})
