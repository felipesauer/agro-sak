import { describe, it, expect } from 'vitest'
import {
    calculateFunrural,
    validateFunrural,
    funruralTotalRate,
    FUNRURAL_RATE_TABLE,
} from './funrural'

describe('calculateFunrural', () => {
    it('PF mensal: 1.5% total', () => {
        const r = calculateFunrural({ producerType: 'pf', grossRevenue: 100_000, period: 'monthly' })
        expect(r.funrural).toBeCloseTo(1200)   // 1.2%
        expect(r.rat).toBeCloseTo(100)          // 0.1%
        expect(r.senar).toBeCloseTo(200)        // 0.2%
        expect(r.total).toBeCloseTo(1500)       // 1.5%
        expect(r.annualProjection).toBeCloseTo(18_000)
    })

    it('PJ anual: 2.85% total, sem projeção', () => {
        const r = calculateFunrural({ producerType: 'pj', grossRevenue: 200_000, period: 'annual' })
        expect(r.total).toBeCloseTo(5700)       // 2.85%
        expect(r.annualProjection).toBeNull()
    })

    it('receita zero retorna zeros', () => {
        const r = calculateFunrural({ producerType: 'pf', grossRevenue: 0, period: 'monthly' })
        expect(r.total).toBe(0)
        expect(r.annualProjection).toBe(0)
    })

    it('projeção anual = mensal × 12', () => {
        const r = calculateFunrural({ producerType: 'pj', grossRevenue: 50_000, period: 'monthly' })
        expect(r.annualProjection).toBeCloseTo(r.total * 12)
    })
})

describe('validateFunrural', () => {
    it('rejeita receita zero', () => {
        expect(validateFunrural({ producerType: 'pf', grossRevenue: 0, period: 'monthly' }))
            .toBe('Informe a receita bruta')
    })

    it('rejeita receita negativa', () => {
        expect(validateFunrural({ producerType: 'pf', grossRevenue: -100, period: 'monthly' }))
            .toBe('Informe a receita bruta')
    })

    it('aceita receita positiva', () => {
        expect(validateFunrural({ producerType: 'pf', grossRevenue: 1, period: 'monthly' }))
            .toBeNull()
    })
})

describe('funruralTotalRate', () => {
    it('PF = 1.5%', () => {
        expect(funruralTotalRate('pf')).toBeCloseTo(1.5)
    })

    it('PJ = 2.85%', () => {
        expect(funruralTotalRate('pj')).toBeCloseTo(2.85)
    })
})

describe('FUNRURAL_RATE_TABLE', () => {
    it('has both producer types', () => {
        expect(FUNRURAL_RATE_TABLE.pf).toBeDefined()
        expect(FUNRURAL_RATE_TABLE.pj).toBeDefined()
    })
})
