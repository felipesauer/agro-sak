import { describe, it, expect } from 'vitest'
import { calculateInputInventory, validateInputInventory } from './input-inventory'

describe('input-inventory', () => {
    const base = {
        areaHa: 100,
        items: [
            { name: 'Semente', ratePerHa: 60, pricePerUnit: 4.50, unitLabel: 'kg' },
            { name: 'Adubo', ratePerHa: 300, pricePerUnit: 2800, unitLabel: 'kg', priceIsTon: true },
        ],
        safetyMarginPercent: 10,
    }

    describe('calculateInputInventory', () => {
        it('calculates qty = rate * area', () => {
            const r = calculateInputInventory(base)
            expect(r.items[0].qty).toBe(6000) // 60 * 100
        })

        it('applies priceIsTon division', () => {
            const r = calculateInputInventory(base)
            // Adubo: qty = 300*100 = 30000; unitPrice = 2800/1000 = 2.80; cost = 30000 * 2.80 = 84000
            expect(r.items[1].cost).toBeCloseTo(84_000, 2)
        })

        it('calculates subtotal', () => {
            const r = calculateInputInventory(base)
            // Semente: 6000 * 4.50 = 27000
            expect(r.subtotal).toBeCloseTo(27_000 + 84_000, 2)
        })

        it('applies safety margin', () => {
            const r = calculateInputInventory(base)
            expect(r.marginValue).toBeCloseTo(r.subtotal * 0.10, 2)
        })

        it('grandTotal = subtotal + margin', () => {
            const r = calculateInputInventory(base)
            expect(r.grandTotal).toBeCloseTo(r.subtotal + r.marginValue, 2)
        })

        it('skips items with ratePerHa = 0', () => {
            const r = calculateInputInventory({
                ...base,
                items: [...base.items, { name: 'Vazio', ratePerHa: 0, pricePerUnit: 100, unitLabel: 'L' }],
            })
            expect(r.items).toHaveLength(2)
        })

        it('returns empty with no valid items', () => {
            const r = calculateInputInventory({ areaHa: 50, items: [], safetyMarginPercent: 5 })
            expect(r.items).toHaveLength(0)
            expect(r.grandTotal).toBe(0)
        })
    })

    describe('validateInputInventory', () => {
        it('passes', () => expect(validateInputInventory(base)).toBeNull())
        it('rejects zero area', () => expect(validateInputInventory({ ...base, areaHa: 0 })).not.toBeNull())
        it('rejects no items with rate', () =>
            expect(validateInputInventory({ areaHa: 100, items: [{ name: 'X', ratePerHa: 0, pricePerUnit: 1, unitLabel: 'u' }], safetyMarginPercent: 0 })).not.toBeNull())
    })
})
