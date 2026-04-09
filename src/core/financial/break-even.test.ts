import { describe, it, expect } from 'vitest'
import { calculateBreakEven, validateBreakEven } from './break-even'

describe('calculateBreakEven', () => {
    it('yield mode: break-even = cost / price', () => {
        const r = calculateBreakEven({
            mode: 'yield',
            costPerHa: 4200,
            sacPrice: 120,
            expectedYield: 65,
        })
        expect(r.breakEvenYield).toBeCloseTo(35) // 4200 / 120
        expect(r.breakEvenPrice).toBeNull()
        expect(r.safetyMargin).toBeCloseTo(((65 - 35) / 65) * 100, 1)
    })

    it('price mode: break-even = cost / yield', () => {
        const r = calculateBreakEven({
            mode: 'price',
            costPerHa: 4200,
            sacPrice: 120,
            expectedYield: 60,
        })
        expect(r.breakEvenPrice).toBeCloseTo(70) // 4200 / 60
        expect(r.breakEvenYield).toBeNull()
        expect(r.safetyMargin).toBeCloseTo(((120 - 70) / 120) * 100, 1)
    })

    it('margem negativa quando no prejuízo (yield mode)', () => {
        const r = calculateBreakEven({
            mode: 'yield',
            costPerHa: 10000,
            sacPrice: 120,
            expectedYield: 50, // break-even = 83.3 > 50
        })
        expect(r.safetyMargin!).toBeLessThan(0)
    })

    it('margem negativa quando no prejuízo (price mode)', () => {
        const r = calculateBreakEven({
            mode: 'price',
            costPerHa: 10000,
            sacPrice: 80,
            expectedYield: 60, // break-even price = 166.7 > 80
        })
        expect(r.safetyMargin!).toBeLessThan(0)
    })

    it('sem yield esperada → sem margem (yield mode)', () => {
        const r = calculateBreakEven({
            mode: 'yield',
            costPerHa: 4200,
            sacPrice: 120,
            expectedYield: 0,
        })
        expect(r.breakEvenYield).toBeCloseTo(35)
        expect(r.safetyMargin).toBeNull()
    })

    it('sem preço esperado → sem margem (price mode)', () => {
        const r = calculateBreakEven({
            mode: 'price',
            costPerHa: 4200,
            sacPrice: 0,
            expectedYield: 60,
        })
        expect(r.breakEvenPrice).toBeCloseTo(70)
        expect(r.safetyMargin).toBeNull()
    })
})

describe('validateBreakEven', () => {
    it('rejeita custo zero', () => {
        expect(validateBreakEven({ mode: 'yield', costPerHa: 0, sacPrice: 120, expectedYield: 60 }))
            .toBe('Informe o custo total por hectare')
    })

    it('yield mode requer preço', () => {
        expect(validateBreakEven({ mode: 'yield', costPerHa: 4200, sacPrice: 0, expectedYield: 60 }))
            .toBe('Informe o preço de venda da saca')
    })

    it('price mode requer produtividade', () => {
        expect(validateBreakEven({ mode: 'price', costPerHa: 4200, sacPrice: 120, expectedYield: 0 }))
            .toBe('Informe a produtividade esperada')
    })

    it('aceita input válido', () => {
        expect(validateBreakEven({ mode: 'yield', costPerHa: 4200, sacPrice: 120, expectedYield: 60 }))
            .toBeNull()
    })
})
