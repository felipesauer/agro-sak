import { describe, it, expect } from 'vitest'
import { calculateRuralFinancing, validateRuralFinancing } from './rural-financing'

describe('rural-financing', () => {
    const baseSac = {
        amount: 500_000,
        totalMonths: 60,
        graceMonths: 12,
        annualRatePercent: 7.5,
        system: 'sac' as const,
    }

    describe('calculateRuralFinancing — SAC', () => {
        it('generates correct number of installments', () => {
            const r = calculateRuralFinancing(baseSac)
            expect(r.installments).toHaveLength(60)
        })

        it('grace period has zero principal', () => {
            const r = calculateRuralFinancing(baseSac)
            for (let i = 0; i < 12; i++) {
                expect(r.installments[i].principal).toBe(0)
            }
        })

        it('amortization period has constant principal', () => {
            const r = calculateRuralFinancing(baseSac)
            // 48 amort months, amortization = 500000/48 ≈ 10416.67
            const expected = 500_000 / 48
            expect(r.installments[12].principal).toBeCloseTo(expected, 0)
            expect(r.installments[59].principal).toBeCloseTo(expected, 0)
        })

        it('first payment > last payment (SAC declining)', () => {
            const r = calculateRuralFinancing(baseSac)
            // First amortization payment (month 13) should be larger than last
            expect(r.installments[12].payment).toBeGreaterThan(r.installments[59].payment)
        })

        it('balance reaches ~0 at end', () => {
            const r = calculateRuralFinancing(baseSac)
            expect(r.installments[59].balance).toBeCloseTo(0, 0)
        })

        it('totalPaid > amount (due to interest)', () => {
            const r = calculateRuralFinancing(baseSac)
            expect(r.totalPaid).toBeGreaterThan(500_000)
        })

        it('totalInterest > 0', () => {
            const r = calculateRuralFinancing(baseSac)
            expect(r.totalInterest).toBeGreaterThan(0)
        })
    })

    describe('calculateRuralFinancing — PRICE', () => {
        it('generates correct number of installments', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price' })
            expect(r.installments).toHaveLength(60)
        })

        it('amort period payments are constant', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price' })
            const pmt13 = r.installments[12].payment
            const pmt59 = r.installments[59].payment
            expect(pmt13).toBeCloseTo(pmt59, 2)
        })

        it('grace period has interest-only payments', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price' })
            for (let i = 0; i < 12; i++) {
                expect(r.installments[i].principal).toBe(0)
                expect(r.installments[i].interest).toBeGreaterThan(0)
            }
        })
    })

    describe('validateRuralFinancing', () => {
        it('passes', () => expect(validateRuralFinancing(baseSac)).toBeNull())
        it('rejects zero amount', () => expect(validateRuralFinancing({ ...baseSac, amount: 0 })).not.toBeNull())
        it('rejects grace >= total', () => expect(validateRuralFinancing({ ...baseSac, graceMonths: 60 })).not.toBeNull())
        it('rejects zero totalMonths', () => expect(validateRuralFinancing({ ...baseSac, totalMonths: 0 })).not.toBeNull())
        it('rejects null annualRatePercent', () => expect(validateRuralFinancing({ ...baseSac, annualRatePercent: undefined as never })).not.toBeNull())
    })

    describe('branch: edge cases in calc', () => {
        it('SAC with graceMonths equal to totalMonths yields zero amortization', () => {
            const r = calculateRuralFinancing({ ...baseSac, totalMonths: 12, graceMonths: 12 })
            expect(r.installments).toHaveLength(12)
            r.installments.forEach(inst => expect(inst.principal).toBe(0))
        })

        it('PRICE with zero interest rate skips PMT block', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price', annualRatePercent: 0 })
            expect(r.installments).toHaveLength(12) // only grace period installments
            expect(r.totalInterest).toBe(0)
        })

        it('PRICE with zero grace months skips grace loop', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price', graceMonths: 0 })
            expect(r.installments).toHaveLength(60)
            // All payments should be equal (PRICE)
            const pmt0 = r.installments[0].payment
            expect(r.installments[59].payment).toBeCloseTo(pmt0, 2)
        })

        it('SAC with zero grace has amortization from month 1', () => {
            const r = calculateRuralFinancing({ ...baseSac, graceMonths: 0 })
            expect(r.installments[0].principal).toBeGreaterThan(0)
        })

        it('PRICE with graceMonths equal to totalMonths yields only grace installments', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price', totalMonths: 12, graceMonths: 12 })
            expect(r.installments).toHaveLength(12)
            r.installments.forEach(inst => expect(inst.principal).toBe(0))
        })

        it('PRICE with totalMonths=0 yields empty installments and default payments=0', () => {
            const r = calculateRuralFinancing({ ...baseSac, system: 'price', totalMonths: 0, graceMonths: 0 })
            expect(r.installments).toHaveLength(0)
            expect(r.firstPayment).toBe(0)
            expect(r.lastPayment).toBe(0)
        })
    })
})
