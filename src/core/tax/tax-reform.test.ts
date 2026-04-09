import { describe, it, expect } from 'vitest'
import {
    calculateTaxReform,
    validateTaxReform,
    type TaxReformInputs,
    type TaxReformRates,
} from './tax-reform'

const DEFAULT_RATES: TaxReformRates = { cbsRate: 8.8, ibsRate: 17.7 }

function makeInputs(overrides: Partial<TaxReformInputs> = {}): TaxReformInputs {
    return {
        producerType: 'pf',
        annualRevenue: 1_000_000,
        domesticPercent: 100,
        inputCost: 0,
        ...overrides,
    }
}

describe('calculateTaxReform', () => {
    it('PF: uses 1.5% funrural rate', () => {
        const r = calculateTaxReform(makeInputs({ producerType: 'pf' }), DEFAULT_RATES)
        expect(r.currentFunrural).toBeCloseTo(15_000) // 1_000_000 * 0.015
        expect(r.currentTotal).toBeCloseTo(15_000)
    })

    it('PJ: uses 2.85% funrural rate', () => {
        const r = calculateTaxReform(makeInputs({ producerType: 'pj' }), DEFAULT_RATES)
        expect(r.currentFunrural).toBeCloseTo(28_500) // 1_000_000 * 0.0285
        expect(r.currentTotal).toBeCloseTo(28_500)
    })

    it('Cooperative: uses PF rate (1.5%)', () => {
        const r = calculateTaxReform(makeInputs({ producerType: 'coop' }), DEFAULT_RATES)
        expect(r.currentFunrural).toBeCloseTo(15_000)
    })

    it('100% domestic: full revenue is taxed', () => {
        const r = calculateTaxReform(makeInputs({ domesticPercent: 100 }), DEFAULT_RATES)
        // CBS effective = 8.8/100 * 0.4 = 0.0352
        // IBS effective = 17.7/100 * 0.4 = 0.0708
        expect(r.newCBS).toBeCloseTo(1_000_000 * 0.0352)
        expect(r.newIBS).toBeCloseTo(1_000_000 * 0.0708)
        expect(r.newGrossTotal).toBeCloseTo(r.newCBS + r.newIBS)
    })

    it('0% domestic (export-heavy): zero new taxes', () => {
        const r = calculateTaxReform(makeInputs({ domesticPercent: 0 }), DEFAULT_RATES)
        expect(r.currentFunrural).toBe(0)
        expect(r.newCBS).toBe(0)
        expect(r.newIBS).toBe(0)
        expect(r.newGrossTotal).toBe(0)
        expect(r.newNetTotal).toBe(0)
    })

    it('input credits reduce net total', () => {
        const r = calculateTaxReform(makeInputs({ inputCost: 500_000 }), DEFAULT_RATES)
        const totalEffective = (8.8 / 100) * 0.4 + (17.7 / 100) * 0.4
        expect(r.newCredits).toBeCloseTo(500_000 * totalEffective)
        expect(r.newNetTotal).toBe(Math.max(0, r.newGrossTotal - r.newCredits))
    })

    it('input credits > gross → net clamped to 0', () => {
        const r = calculateTaxReform(makeInputs({ inputCost: 5_000_000 }), DEFAULT_RATES)
        expect(r.newNetTotal).toBe(0)
        expect(r.difference).toBeLessThan(0)
    })

    it('partial domestic (70%) scales proportionally', () => {
        const full = calculateTaxReform(makeInputs({ domesticPercent: 100 }), DEFAULT_RATES)
        const partial = calculateTaxReform(makeInputs({ domesticPercent: 70 }), DEFAULT_RATES)
        expect(partial.currentFunrural).toBeCloseTo(full.currentFunrural * 0.7)
        expect(partial.newCBS).toBeCloseTo(full.newCBS * 0.7)
        expect(partial.newIBS).toBeCloseTo(full.newIBS * 0.7)
    })

    it('cbsRate=0: only IBS contributes', () => {
        const r = calculateTaxReform(makeInputs(), { cbsRate: 0, ibsRate: 17.7 })
        expect(r.newCBS).toBe(0)
        expect(r.newIBS).toBeGreaterThan(0)
        expect(r.newGrossTotal).toBeCloseTo(r.newIBS)
    })

    it('ibsRate=0: only CBS contributes', () => {
        const r = calculateTaxReform(makeInputs(), { cbsRate: 8.8, ibsRate: 0 })
        expect(r.newIBS).toBe(0)
        expect(r.newCBS).toBeGreaterThan(0)
        expect(r.newGrossTotal).toBeCloseTo(r.newCBS)
    })

    it('differencePercent is relative to currentTotal', () => {
        const r = calculateTaxReform(makeInputs({ producerType: 'pf', domesticPercent: 100 }), DEFAULT_RATES)
        expect(r.differencePercent).toBeCloseTo((r.difference / r.currentTotal) * 100)
    })

    it('differencePercent is 0 when currentTotal is 0', () => {
        const r = calculateTaxReform(makeInputs({ domesticPercent: 0 }), DEFAULT_RATES)
        expect(r.differencePercent).toBe(0)
    })
})

describe('validateTaxReform', () => {
    it('rejects zero revenue', () => {
        expect(validateTaxReform(makeInputs({ annualRevenue: 0 }), DEFAULT_RATES))
            .toBe('Informe o faturamento anual')
    })

    it('rejects negative revenue', () => {
        expect(validateTaxReform(makeInputs({ annualRevenue: -1 }), DEFAULT_RATES))
            .toBe('Informe o faturamento anual')
    })

    it('rejects null rates', () => {
        expect(validateTaxReform(makeInputs(), null))
            .toBe('Aguardando taxas da API...')
    })

    it('rejects domesticPercent > 100', () => {
        expect(validateTaxReform(makeInputs({ domesticPercent: 110 }), DEFAULT_RATES))
            .toBe('Mercado interno deve estar entre 0% e 100%')
    })

    it('rejects domesticPercent < 0', () => {
        expect(validateTaxReform(makeInputs({ domesticPercent: -5 }), DEFAULT_RATES))
            .toBe('Mercado interno deve estar entre 0% e 100%')
    })

    it('rejects both rates at zero', () => {
        expect(validateTaxReform(makeInputs(), { cbsRate: 0, ibsRate: 0 }))
            .toBe('Taxas CBS/IBS inválidas')
    })

    it('accepts valid inputs with valid rates', () => {
        expect(validateTaxReform(makeInputs(), DEFAULT_RATES)).toBeNull()
    })
})
