import { describe, it, expect } from 'vitest'
import {
    calculateCropProfitability,
    validateCropProfitability,
    type CropProfitabilityEntry,
    type CropProfitabilityInputs,
} from './crop-profitability'

function makeEntry(overrides: Partial<CropProfitabilityEntry> = {}): CropProfitabilityEntry {
    return { name: 'Soja', productivity: 65, price: 115, cost: 3200, ...overrides }
}

function makeInputs(overrides: Partial<CropProfitabilityInputs> = {}): CropProfitabilityInputs {
    return {
        producerType: 'pf',
        crops: [
            makeEntry({ name: 'Soja', productivity: 65, price: 115, cost: 3200 }),
            makeEntry({ name: 'Milho', productivity: 120, price: 55, cost: 2800 }),
        ],
        ...overrides,
    }
}

describe('calculateCropProfitability', () => {
    it('2 crops: calculates revenue, funrural, profit for each', () => {
        const results = calculateCropProfitability(makeInputs())
        expect(results).toHaveLength(2)
        for (const r of results) {
            expect(r.revenue).toBeGreaterThan(0)
            expect(r.funrural).toBeGreaterThan(0)
        }
    })

    it('results sorted by profit descending', () => {
        const results = calculateCropProfitability(makeInputs())
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].profit).toBeGreaterThanOrEqual(results[i].profit)
        }
    })

    it('PF: uses 1.5% funrural rate', () => {
        const results = calculateCropProfitability(makeInputs({ producerType: 'pf' }))
        const soja = results.find((r) => r.name === 'Soja')!
        // revenue = 65 * 115 = 7475
        expect(soja.revenue).toBeCloseTo(7475)
        expect(soja.funrural).toBeCloseTo(7475 * 0.015)
    })

    it('PJ: uses 2.85% funrural rate', () => {
        const results = calculateCropProfitability(makeInputs({ producerType: 'pj' }))
        const soja = results.find((r) => r.name === 'Soja')!
        expect(soja.funrural).toBeCloseTo(7475 * 0.0285)
    })

    it('PJ higher funrural reduces profit vs PF', () => {
        const pf = calculateCropProfitability(makeInputs({ producerType: 'pf' }))
        const pj = calculateCropProfitability(makeInputs({ producerType: 'pj' }))
        const pfSoja = pf.find((r) => r.name === 'Soja')!
        const pjSoja = pj.find((r) => r.name === 'Soja')!
        expect(pjSoja.profit).toBeLessThan(pfSoja.profit)
    })

    it('3+ crops are all sorted by profit', () => {
        const results = calculateCropProfitability({
            producerType: 'pf',
            crops: [
                makeEntry({ name: 'Low', productivity: 10, price: 10, cost: 500 }),
                makeEntry({ name: 'High', productivity: 100, price: 200, cost: 1000 }),
                makeEntry({ name: 'Mid', productivity: 50, price: 100, cost: 2000 }),
            ],
        })
        expect(results).toHaveLength(3)
        expect(results[0].name).toBe('High')
        expect(results[2].name).toBe('Low')
    })

    it('negative profit when cost exceeds revenue', () => {
        const results = calculateCropProfitability({
            producerType: 'pf',
            crops: [
                makeEntry({ name: 'Expensive', productivity: 10, price: 10, cost: 5000 }),
                makeEntry({ name: 'OK', productivity: 65, price: 115, cost: 3200 }),
            ],
        })
        const expensive = results.find((r) => r.name === 'Expensive')!
        expect(expensive.profit).toBeLessThan(0)
        expect(expensive.margin).toBeLessThan(0)
    })

    it('cost = 0: roi = 0, not Infinity', () => {
        const results = calculateCropProfitability({
            producerType: 'pf',
            crops: [
                makeEntry({ name: 'Free', productivity: 50, price: 100, cost: 0.01 }),
                makeEntry({ name: 'Normal', productivity: 65, price: 115, cost: 3200 }),
            ],
        })
        // With cost = 0 exactly it won't pass validation, but core calc handles it
        const free = results.find((r) => r.name === 'Free')!
        expect(Number.isFinite(free.roi)).toBe(true)
    })

    it('roi and margin are calculated correctly', () => {
        const results = calculateCropProfitability(makeInputs({ producerType: 'pf' }))
        const soja = results.find((r) => r.name === 'Soja')!
        const expectedRoi = (soja.profit / soja.cost) * 100
        const expectedMargin = (soja.profit / soja.revenue) * 100
        expect(soja.roi).toBeCloseTo(expectedRoi)
        expect(soja.margin).toBeCloseTo(expectedMargin)
    })

    it('cost = 0 exactly yields roi = 0', () => {
        const results = calculateCropProfitability({
            producerType: 'pf',
            crops: [
                { name: 'Zero', productivity: 50, price: 100, cost: 0 },
                { name: 'Normal', productivity: 65, price: 115, cost: 3200 },
            ],
        })
        const zero = results.find((r) => r.name === 'Zero')!
        expect(zero.roi).toBe(0)
    })
})

describe('validateCropProfitability', () => {
    it('rejects single crop', () => {
        expect(validateCropProfitability({ producerType: 'pf', crops: [makeEntry()] }))
            .toBe('Preencha pelo menos 2 culturas para comparar')
    })

    it('rejects empty crops array', () => {
        expect(validateCropProfitability({ producerType: 'pf', crops: [] }))
            .toBe('Preencha pelo menos 2 culturas para comparar')
    })

    it('rejects zero productivity', () => {
        const result = validateCropProfitability({
            producerType: 'pf',
            crops: [makeEntry({ productivity: 0 }), makeEntry({ name: 'Milho' })],
        })
        expect(result).toContain('Produtividade')
    })

    it('rejects zero price', () => {
        const result = validateCropProfitability({
            producerType: 'pf',
            crops: [makeEntry({ price: 0 }), makeEntry({ name: 'Milho' })],
        })
        expect(result).toContain('Preço')
    })

    it('rejects zero cost', () => {
        const result = validateCropProfitability({
            producerType: 'pf',
            crops: [makeEntry({ cost: 0 }), makeEntry({ name: 'Milho' })],
        })
        expect(result).toContain('Custo')
    })

    it('accepts 2 valid crops', () => {
        expect(validateCropProfitability(makeInputs())).toBeNull()
    })
})
