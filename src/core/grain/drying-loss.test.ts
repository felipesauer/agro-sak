import { describe, it, expect } from 'vitest'
import { calculateDryingLoss, validateDryingLoss } from './drying-loss'

describe('calculateDryingLoss', () => {
    it('fórmula de conservação de matéria seca', () => {
        // 50000 kg at 17% → target 14%
        // Final = 50000 × (100-17)/(100-14) = 50000 × 83/86 = 48255.81
        const r = calculateDryingLoss({
            initialWeight: 50000,
            initialMoisture: 17,
            targetMoisture: 14,
        })
        expect(r.finalWeightKg).toBeCloseTo(48255.81, 0)
        expect(r.lossKg).toBeCloseTo(1744.19, 0)
        expect(r.lossPercent).toBeCloseTo(3.488, 1)
        expect(r.lossBags).toBeCloseTo(29.07, 1) // 1744.19 / 60
        expect(r.dryingCost).toBe(0) // not provided
        expect(r.financialLoss).toBe(0)
    })

    it('calcula custo de secagem quando informado', () => {
        const r = calculateDryingLoss({
            initialWeight: 60000,
            initialMoisture: 18,
            targetMoisture: 14,
            dryingCostPerBag: 5,
        })
        const initialBags = 60000 / 60
        expect(r.dryingCost).toBeCloseTo(initialBags * 5) // 1000 × 5 = 5000
    })

    it('calcula perda financeira quando preço informado', () => {
        const r = calculateDryingLoss({
            initialWeight: 60000,
            initialMoisture: 18,
            targetMoisture: 14,
            pricePerBag: 120,
        })
        expect(r.financialLoss).toBeCloseTo(r.lossBags * 120)
    })

    it('sem perda quando umidades iguais (caso limite)', () => {
        const r = calculateDryingLoss({
            initialWeight: 50000,
            initialMoisture: 14,
            targetMoisture: 14,
        })
        expect(r.lossKg).toBeCloseTo(0)
        expect(r.lossPercent).toBeCloseTo(0)
    })

    it('respeita bagWeight customizado', () => {
        const r = calculateDryingLoss({
            initialWeight: 10000,
            initialMoisture: 17,
            targetMoisture: 14,
            bagWeight: 50, // rice bag
        })
        expect(r.lossBags).toBeCloseTo(r.lossKg / 50)
    })
})

describe('validateDryingLoss', () => {
    it('rejeita peso zero', () => {
        expect(validateDryingLoss({ initialWeight: 0, initialMoisture: 17, targetMoisture: 14 }))
            .toBe('Informe o peso inicial')
    })

    it('rejeita umidade inicial menor que final', () => {
        expect(validateDryingLoss({ initialWeight: 50000, initialMoisture: 12, targetMoisture: 14 }))
            .toBe('Umidade inicial deve ser maior que a final')
    })

    it('rejeita umidades iguais', () => {
        expect(validateDryingLoss({ initialWeight: 50000, initialMoisture: 14, targetMoisture: 14 }))
            .toBe('Umidade inicial deve ser maior que a final')
    })

    it('aceita input válido', () => {
        expect(validateDryingLoss({ initialWeight: 50000, initialMoisture: 17, targetMoisture: 14 }))
            .toBeNull()
    })

    it('rejeita umidade inicial zero', () => {
        expect(validateDryingLoss({ initialWeight: 50000, initialMoisture: 0, targetMoisture: 14 }))
            .toBe('Informe a umidade inicial')
    })

    it('rejeita umidade final zero', () => {
        expect(validateDryingLoss({ initialWeight: 50000, initialMoisture: 17, targetMoisture: 0 }))
            .toBe('Informe a umidade final desejada')
    })
})

describe('branch: lossPercent when initialWeight is 0', () => {
    it('lossPercent is 0 when initialWeight is 0', () => {
        const r = calculateDryingLoss({ initialWeight: 0, initialMoisture: 17, targetMoisture: 14 })
        expect(r.lossPercent).toBe(0)
    })
})
