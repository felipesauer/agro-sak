import { describe, it, expect } from 'vitest'
import { calculateCashFlow, validateCashFlow, type MonthData } from './cash-flow'

describe('cash-flow', () => {
    const emptyMonth: MonthData = {
        salesRevenue: 0, financingIncome: 0, otherIncome: 0,
        inputsPurchase: 0, leasePay: 0, financingPay: 0,
        laborPay: 0, fuelMaint: 0, otherExpenses: 0,
    }

    describe('calculateCashFlow', () => {
        it('calculates single month balance', () => {
            const r = calculateCashFlow({
                initialBalance: 0,
                months: [{ ...emptyMonth, salesRevenue: 100000, inputsPurchase: 60000 }],
            })
            expect(r.monthResults[0].balance).toBe(40000)
            expect(r.monthResults[0].accumulated).toBe(40000)
        })

        it('carries initial balance', () => {
            const r = calculateCashFlow({
                initialBalance: 50000,
                months: [{ ...emptyMonth, salesRevenue: 10000, inputsPurchase: 20000 }],
            })
            expect(r.monthResults[0].accumulated).toBe(40000) // 50000 + (-10000)
        })

        it('accumulates across months', () => {
            const m1 = { ...emptyMonth, salesRevenue: 100000, inputsPurchase: 80000 }
            const m2 = { ...emptyMonth, salesRevenue: 50000, inputsPurchase: 60000 }
            const r = calculateCashFlow({ initialBalance: 0, months: [m1, m2] })
            expect(r.monthResults[0].accumulated).toBe(20000)
            expect(r.monthResults[1].accumulated).toBe(10000) // 20000 + (-10000)
        })

        it('detects deficit', () => {
            const m = { ...emptyMonth, inputsPurchase: 100000 }
            const r = calculateCashFlow({ initialBalance: 0, months: [m] })
            expect(r.hasDeficit).toBe(true)
        })

        it('no deficit when always positive', () => {
            const m = { ...emptyMonth, salesRevenue: 100000 }
            const r = calculateCashFlow({ initialBalance: 0, months: [m] })
            expect(r.hasDeficit).toBe(false)
        })

        it('sums all income sources', () => {
            const m = { ...emptyMonth, salesRevenue: 10, financingIncome: 20, otherIncome: 30 }
            const r = calculateCashFlow({ initialBalance: 0, months: [m] })
            expect(r.monthResults[0].totalIncome).toBe(60)
        })

        it('sums all expense sources', () => {
            const m = { ...emptyMonth, inputsPurchase: 1, leasePay: 2, financingPay: 3, laborPay: 4, fuelMaint: 5, otherExpenses: 6 }
            const r = calculateCashFlow({ initialBalance: 0, months: [m] })
            expect(r.monthResults[0].totalExpense).toBe(21)
        })
    })

    describe('validateCashFlow', () => {
        it('passes with data', () => {
            expect(validateCashFlow({ initialBalance: 0, months: [{ ...emptyMonth, salesRevenue: 100 }] })).toBeNull()
        })

        it('rejects empty months', () => {
            expect(validateCashFlow({ initialBalance: 0, months: [emptyMonth] })).not.toBeNull()
        })
    })
})
