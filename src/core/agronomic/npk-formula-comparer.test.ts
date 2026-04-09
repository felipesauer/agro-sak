import { describe, it, expect } from 'vitest'
import { calculateNpkFormulaComparison, validateNpkFormulaEntries } from './npk-formula-comparer'

describe('npk-formula-comparer', () => {
    const entries = [
        { n: 8, p: 28, k: 16, pricePerBag50kg: 145, supplier: 'Coop A' },
        { n: 10, p: 10, k: 10, pricePerBag50kg: 100, supplier: 'Coop B' },
    ]

    describe('calculateNpkFormulaComparison', () => {
        it('returns results for each entry', () => {
            const r = calculateNpkFormulaComparison(entries)!
            expect(r).toHaveLength(2)
        })

        it('formats formula string', () => {
            const r = calculateNpkFormulaComparison(entries)!
            expect(r[0].formula).toBe('08-28-16')
        })

        it('calculates cost per point', () => {
            const r = calculateNpkFormulaComparison(entries)!
            // Entry 1: 145 / (50 * 0.52) = 145 / 26 = 5.577
            expect(r[0].costPerPoint).toBeCloseTo(5.577, 1)
        })

        it('marks best (lowest cost per point)', () => {
            const r = calculateNpkFormulaComparison(entries)!
            const best = r.find(f => f.isBest)!
            const other = r.find(f => !f.isBest)!
            expect(best.costPerPoint).toBeLessThanOrEqual(other.costPerPoint)
        })

        it('returns null for < 2 entries', () => {
            expect(calculateNpkFormulaComparison([entries[0]])).toBeNull()
        })

        it('costPerKgN is null when N = 0', () => {
            const r = calculateNpkFormulaComparison([
                { n: 0, p: 20, k: 20, pricePerBag50kg: 120 },
                { n: 10, p: 10, k: 10, pricePerBag50kg: 100 },
            ])!
            expect(r[0].costPerKgN).toBeNull()
        })
    })

    describe('validateNpkFormulaEntries', () => {
        it('passes', () => expect(validateNpkFormulaEntries(entries)).toBeNull())
        it('rejects < 2 entries', () => expect(validateNpkFormulaEntries([entries[0]])).not.toBeNull())
        it('rejects N+P+K > 100', () =>
            expect(validateNpkFormulaEntries([{ n: 50, p: 30, k: 25, pricePerBag50kg: 100 }, entries[1]])).not.toBeNull())
        it('rejects zero price', () =>
            expect(validateNpkFormulaEntries([{ ...entries[0], pricePerBag50kg: 0 }, entries[1]])).not.toBeNull())
    })

    it('costPerKgP and costPerKgK are null when P=0 and K=0', () => {
        const r = calculateNpkFormulaComparison([
            { n: 45, p: 0, k: 0, pricePerBag50kg: 130 },
            { n: 10, p: 10, k: 10, pricePerBag50kg: 100 },
        ])!
        expect(r[0].costPerKgP).toBeNull()
        expect(r[0].costPerKgK).toBeNull()
    })
})
