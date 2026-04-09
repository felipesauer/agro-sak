import { describe, it, expect } from 'vitest'
import { calculatePayback, validatePayback } from './payback'

describe('payback', () => {
    const base = {
        investmentValue: 500_000,
        annualNetGain: 80_000,
        usefulLifeYears: 15,
        residualValue: 50_000,
        discountRatePercent: 10,
    }

    describe('calculatePayback', () => {
        it('calculates simple payback', () => {
            const r = calculatePayback(base)
            // 500000 / 80000 = 6.25
            expect(r.simplePayback).toBeCloseTo(6.25, 2)
        })

        it('calculates discounted payback', () => {
            const r = calculatePayback(base)
            expect(r.discountedPayback).toBeGreaterThan(r.simplePayback)
            expect(r.discountedPayback).toBeGreaterThan(0)
        })

        it('calculates total return', () => {
            const r = calculatePayback(base)
            // 80000 * 15 + 50000 = 1250000
            expect(r.totalReturn).toBe(1_250_000)
        })

        it('calculates ROI', () => {
            const r = calculatePayback(base)
            // (1250000 - 500000) / 500000 * 100 = 150%
            expect(r.roi).toBe(150)
        })

        it('generates year rows', () => {
            const r = calculatePayback(base)
            expect(r.yearRows).toHaveLength(15)
        })

        it('last year includes residual value', () => {
            const r = calculatePayback(base)
            const lastRow = r.yearRows[14]
            expect(lastRow.cashFlow).toBe(130_000) // 80000 + 50000
        })

        it('NPV is cumulative discounted at end', () => {
            const r = calculatePayback(base)
            expect(r.npv).toBe(r.yearRows[14].cumulativeDiscounted)
        })

        it('returns -1 for never payback', () => {
            const r = calculatePayback({ ...base, annualNetGain: 1, usefulLifeYears: 3, residualValue: 0 })
            expect(r.discountedPayback).toBe(-1)
        })
    })

    describe('validatePayback', () => {
        it('passes', () => expect(validatePayback(base)).toBeNull())
        it('rejects zero investment', () => expect(validatePayback({ ...base, investmentValue: 0 })).not.toBeNull())
        it('rejects zero gain', () => expect(validatePayback({ ...base, annualNetGain: 0 })).not.toBeNull())
        it('rejects life > 50', () => expect(validatePayback({ ...base, usefulLifeYears: 51 })).not.toBeNull())
        it('rejects discount > 50', () => expect(validatePayback({ ...base, discountRatePercent: 51 })).not.toBeNull())
        it('rejects investment > 100M', () => expect(validatePayback({ ...base, investmentValue: 100_000_001 })).not.toBeNull())
    })

    describe('branch: edge cases', () => {
        it('simplePayback is -1 when annualNetGain is 0', () => {
            const r = calculatePayback({ ...base, annualNetGain: 0 })
            expect(r.simplePayback).toBe(-1)
        })

        it('discountedPayback handles discountedCF <= 0 at crossover', () => {
            const r = calculatePayback({
                investmentValue: 1_000_000,
                annualNetGain: 10,
                usefulLifeYears: 5,
                residualValue: 0,
                discountRatePercent: 50,
            })
            expect(r.discountedPayback).toBe(-1)
        })
    })
})
