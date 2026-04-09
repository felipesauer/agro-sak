import { describe, it, expect } from 'vitest'
import { calculateProductionCost, validateProductionCost } from './production-cost'

describe('production-cost', () => {
    const groups = [
        { label: 'Insumos', keys: ['seeds', 'fert'] },
        { label: 'Operações', keys: ['planting', 'harvest'] },
    ]

    const base = {
        expectedYieldScHa: 65,
        sacPrice: 115,
        costItems: { seeds: 320, fert: 680, planting: 85, harvest: 145 },
        costGroups: groups,
    }

    describe('calculateProductionCost', () => {
        it('sums total cost per ha', () => {
            const r = calculateProductionCost(base)
            expect(r.totalCostHa).toBe(1230) // 320+680+85+145
        })

        it('calculates group totals', () => {
            const r = calculateProductionCost(base)
            expect(r.groupTotals[0].total).toBe(1000) // seeds+fert
            expect(r.groupTotals[1].total).toBe(230)  // planting+harvest
        })

        it('calculates group percentages', () => {
            const r = calculateProductionCost(base)
            expect(r.groupTotals[0].percent).toBeCloseTo((1000 / 1230) * 100, 1)
        })

        it('calculates cost per sac', () => {
            const r = calculateProductionCost(base)
            expect(r.costPerSc).toBeCloseTo(1230 / 65, 2)
        })

        it('calculates break-even sc', () => {
            const r = calculateProductionCost(base)
            expect(r.breakEvenSc).toBeCloseTo(1230 / 115, 2)
        })

        it('calculates break-even price', () => {
            const r = calculateProductionCost(base)
            expect(r.breakEvenPrice).toBeCloseTo(1230 / 65, 2)
        })
    })

    describe('validateProductionCost', () => {
        it('passes with valid inputs', () => {
            expect(validateProductionCost(base)).toBeNull()
        })

        it('rejects zero yield', () => {
            expect(validateProductionCost({ ...base, expectedYieldScHa: 0 })).not.toBeNull()
        })

        it('rejects negative yield', () => {
            expect(validateProductionCost({ ...base, expectedYieldScHa: -1 })).not.toBeNull()
        })
    })

    describe('branch: missing cost keys and zero denominators', () => {
        it('treats missing costItem keys as 0', () => {
            const r = calculateProductionCost({
                ...base,
                costItems: { seeds: 100 },
                costGroups: [{ label: 'G', keys: ['seeds', 'nonexistent'] }],
            })
            expect(r.groupTotals[0].total).toBe(100)
        })

        it('percent is 0 when totalCostHa is 0', () => {
            const r = calculateProductionCost({
                ...base,
                costItems: {},
                costGroups: [{ label: 'G', keys: ['x'] }],
            })
            expect(r.totalCostHa).toBe(0)
            expect(r.groupTotals[0].percent).toBe(0)
        })

        it('costPerSc is 0 when expectedYieldScHa is 0', () => {
            const r = calculateProductionCost({ ...base, expectedYieldScHa: 0 })
            expect(r.costPerSc).toBe(0)
        })

        it('breakEvenSc is null when sacPrice is 0', () => {
            const r = calculateProductionCost({ ...base, sacPrice: 0 })
            expect(r.breakEvenSc).toBeNull()
        })

        it('breakEvenPrice is null when expectedYieldScHa is 0', () => {
            const r = calculateProductionCost({ ...base, expectedYieldScHa: 0 })
            expect(r.breakEvenPrice).toBeNull()
        })
    })
})
