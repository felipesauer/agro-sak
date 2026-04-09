import { describe, it, expect } from 'vitest'
import { calculateCropComparer, validateCropComparer, CropEntry } from './crop-comparer'

describe('crop-comparer', () => {
    const soy: CropEntry = { name: 'Soja', productivity: 55, price: 115, productionCost: 3200 }
    const corn: CropEntry = { name: 'Milho', productivity: 100, price: 50, productionCost: 2800 }
    const cotton: CropEntry = { name: 'Algodão', productivity: 280, price: 120, productionCost: 8500 }

    describe('calculateCropComparer', () => {
        it('returns null with fewer than 2 crops', () => {
            expect(calculateCropComparer([soy])).toBeNull()
        })

        it('calculates revenue correctly', () => {
            const r = calculateCropComparer([soy, corn])!
            const soyResult = r.find((c) => c.name === 'Soja')!
            expect(soyResult.revenuePerHa).toBeCloseTo(55 * 115, 0)
        })

        it('calculates profit = revenue - cost', () => {
            const r = calculateCropComparer([soy, corn])!
            const soyResult = r.find((c) => c.name === 'Soja')!
            expect(soyResult.profitPerHa).toBeCloseTo(55 * 115 - 3200, 0)
        })

        it('calculates ROI = (profit/cost)*100', () => {
            const r = calculateCropComparer([soy, corn])!
            const soyResult = r.find((c) => c.name === 'Soja')!
            const expected = ((55 * 115 - 3200) / 3200) * 100
            expect(soyResult.roi).toBeCloseTo(expected, 1)
        })

        it('calculates margin = (profit/revenue)*100', () => {
            const r = calculateCropComparer([soy, corn])!
            const soyResult = r.find((c) => c.name === 'Soja')!
            const rev = 55 * 115
            const expected = ((rev - 3200) / rev) * 100
            expect(soyResult.margin).toBeCloseTo(expected, 1)
        })

        it('sorts by profitPerHa descending and marks best', () => {
            const r = calculateCropComparer([soy, corn])!
            expect(r[0].profitPerHa).toBeGreaterThanOrEqual(r[1].profitPerHa)
            expect(r[0].isBest).toBe(true)
            expect(r[1].isBest).toBe(false)
        })

        it('handles 3 crops correctly', () => {
            const r = calculateCropComparer([soy, corn, cotton])!
            expect(r).toHaveLength(3)
            expect(r[0].isBest).toBe(true)
        })

        it('marks cotton as best (highest profit)', () => {
            const r = calculateCropComparer([soy, corn, cotton])!
            // cotton: 280*120-8500 = 25100
            // soy:    55*115-3200 = 3125
            // corn:   100*50-2800 = 2200
            expect(r[0].name).toBe('Algodão')
        })

        it('handles negative profit', () => {
            const losing: CropEntry = { name: 'Losing', productivity: 10, price: 5, productionCost: 1000 }
            const r = calculateCropComparer([soy, losing])!
            const losingResult = r.find((c) => c.name === 'Losing')!
            expect(losingResult.profitPerHa).toBeLessThan(0)
        })

        it('returns roi=0 when productionCost is 0', () => {
            const free: CropEntry = { name: 'Free', productivity: 10, price: 10, productionCost: 0 }
            const r = calculateCropComparer([soy, free])!
            const freeResult = r.find((c) => c.name === 'Free')!
            expect(freeResult.roi).toBe(0)
        })

        it('returns margin=0 when revenue is 0', () => {
            const zero: CropEntry = { name: 'Zero', productivity: 0, price: 0, productionCost: 100 }
            const r = calculateCropComparer([soy, zero])!
            const zeroResult = r.find((c) => c.name === 'Zero')!
            expect(zeroResult.margin).toBe(0)
        })
    })

    describe('validateCropComparer', () => {
        it('returns null for valid input', () => {
            expect(validateCropComparer([soy, corn])).toBeNull()
        })

        it('rejects fewer than 2 crops', () => {
            expect(validateCropComparer([soy])).toBeTruthy()
        })

        it('rejects missing name', () => {
            expect(validateCropComparer([{ ...soy, name: '' }, corn])).toBeTruthy()
        })

        it('rejects zero productivity', () => {
            expect(validateCropComparer([{ ...soy, productivity: 0 }, corn])).toBeTruthy()
        })

        it('rejects zero price', () => {
            expect(validateCropComparer([soy, { ...corn, price: 0 }])).toBeTruthy()
        })

        it('rejects zero cost', () => {
            expect(validateCropComparer([soy, { ...corn, productionCost: 0 }])).toBeTruthy()
        })
    })
})
