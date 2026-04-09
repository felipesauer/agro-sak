import { describe, it, expect } from 'vitest'
import { calculateFieldCostRanking, validateFieldCostRanking } from './field-cost-ranking'

describe('field-cost-ranking', () => {
    const fields = [
        { name: 'T1', areaHa: 100, productivityScHa: 65, inputCostPerHa: 2000, operationCostPerHa: 500, leaseCostPerHa: 400, otherCostPerHa: 100 },
        { name: 'T2', areaHa: 80, productivityScHa: 55, inputCostPerHa: 2200, operationCostPerHa: 600, leaseCostPerHa: 450, otherCostPerHa: 150 },
    ]

    describe('calculateFieldCostRanking', () => {
        it('calculates cost per ha', () => {
            const r = calculateFieldCostRanking(fields, 115)
            const t1 = r.find(f => f.name === 'T1')!
            expect(t1.costPerHa).toBe(3000)
        })

        it('calculates profit per ha', () => {
            const r = calculateFieldCostRanking(fields, 115)
            const t1 = r.find(f => f.name === 'T1')!
            // revenue = 65 * 115 = 7475, profit = 7475 - 3000 = 4475
            expect(t1.profitPerHa).toBe(4475)
        })

        it('sorts by profit per ha descending', () => {
            const r = calculateFieldCostRanking(fields, 115)
            expect(r[0].profitPerHa).toBeGreaterThanOrEqual(r[1].profitPerHa)
        })

        it('filters out fields with zero area', () => {
            const fieldsWithEmpty = [...fields, { name: 'Empty', areaHa: 0, productivityScHa: 0, inputCostPerHa: 0, operationCostPerHa: 0, leaseCostPerHa: 0, otherCostPerHa: 0 }]
            const r = calculateFieldCostRanking(fieldsWithEmpty, 115)
            expect(r).toHaveLength(2)
        })

        it('calculates cost per sac', () => {
            const r = calculateFieldCostRanking(fields, 115)
            const t1 = r.find(f => f.name === 'T1')!
            expect(t1.costPerSc).toBeCloseTo(3000 / 65, 2)
        })
    })

    describe('validateFieldCostRanking', () => {
        it('passes with valid fields', () => {
            expect(validateFieldCostRanking(fields)).toBeNull()
        })

        it('rejects all-empty fields', () => {
            expect(validateFieldCostRanking([{ name: 'E', areaHa: 0, productivityScHa: 0, inputCostPerHa: 0, operationCostPerHa: 0, leaseCostPerHa: 0, otherCostPerHa: 0 }])).not.toBeNull()
        })
    })

    describe('branch: filter edge cases', () => {
        it('filters out field with area>0 but productivity=0', () => {
            const r = calculateFieldCostRanking(
                [{ name: 'NoProd', areaHa: 50, productivityScHa: 0, inputCostPerHa: 100, operationCostPerHa: 0, leaseCostPerHa: 0, otherCostPerHa: 0 }],
                115
            )
            expect(r).toHaveLength(0)
        })
    })
})
