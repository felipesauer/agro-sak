import { describe, it, expect } from 'vitest'
import { calculateStorageCost, validateStorageCost } from './storage-cost'

describe('calculateStorageCost', () => {
    const base = {
        thirdPartyFeePerScMonth: 0.45,
        volumeAnnualSc: 15000,
        avgMonths: 4,
        constructionCost: 1_500_000,
        siloLifeYears: 25,
        annualOpCost: 80_000,
    }

    it('calcula custo por saca terceiro', () => {
        const r = calculateStorageCost(base)
        expect(r.thirdPartyCostSc).toBeCloseTo(1.80, 2) // 0.45 * 4
        expect(r.thirdPartyTotal).toBeCloseTo(27000, 0) // 1.80 * 15000
    })

    it('calcula custo silo próprio', () => {
        const r = calculateStorageCost(base)
        const depr = 1_500_000 / 25 // 60000
        expect(r.ownTotal).toBeCloseTo(depr + 80_000, 0) // 140000
        expect(r.ownCostSc).toBeCloseTo(140_000 / 15_000, 2)
    })

    it('calcula break-even em anos', () => {
        const r = calculateStorageCost(base)
        // savings = 27000 - 140000 = -113000 → negative
        expect(r.annualSavings).toBeLessThan(0)
        expect(r.breakEvenYears).toBe(0) // not viable
    })

    it('break-even positivo com volumes altos', () => {
        const r = calculateStorageCost({ ...base, volumeAnnualSc: 200_000 })
        // third = 0.45*4*200000 = 360000 vs own = 140000
        expect(r.annualSavings).toBeCloseTo(220_000, 0)
        expect(r.breakEvenYears).toBe(Math.ceil(1_500_000 / 220_000))
    })
})

describe('validateStorageCost', () => {
    it('rejeita taxa zero', () => {
        expect(validateStorageCost({ thirdPartyFeePerScMonth: 0, volumeAnnualSc: 15000, constructionCost: 1000000 })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateStorageCost({ thirdPartyFeePerScMonth: 0.45, volumeAnnualSc: 15000, constructionCost: 1000000 })).toBeNull()
    })

    it('rejeita volume zero', () => {
        expect(validateStorageCost({ thirdPartyFeePerScMonth: 0.45, volumeAnnualSc: 0, constructionCost: 1000000 })).toBeTruthy()
    })

    it('rejeita custo construção zero', () => {
        expect(validateStorageCost({ thirdPartyFeePerScMonth: 0.45, volumeAnnualSc: 15000, constructionCost: 0 })).toBeTruthy()
    })
})

describe('branch: ownCostSc zero when volume is 0', () => {
    it('ownCostSc is 0 when volumeAnnualSc is 0', () => {
        const r = calculateStorageCost({
            thirdPartyFeePerScMonth: 0.45, volumeAnnualSc: 0, avgMonths: 4,
            constructionCost: 1_500_000, siloLifeYears: 25, annualOpCost: 80_000,
        })
        expect(r.ownCostSc).toBe(0)
    })
})
