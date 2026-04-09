import { describe, it, expect } from 'vitest'
import { calculateMoistureDiscount, validateMoistureDiscount } from './moisture-discount'

describe('calculateMoistureDiscount', () => {
    const base = {
        grossWeightKg: 27000,
        moistureMeasured: 16,
        impurityMeasured: 2,
        damagedPercent: 0,
        pricePerBag: 120,
        moistureStandard: 14,
        impurityStandard: 1,
    }

    it('calcula desconto por umidade corretamente', () => {
        const r = calculateMoistureDiscount(base)
        // moisture factor = (16-14)/(100-14) = 2/86 ≈ 0.02326
        expect(r.moistureDiscountKg).toBeCloseTo(27000 * 2 / 86, 1)
    })

    it('calcula desconto por impureza', () => {
        const r = calculateMoistureDiscount(base)
        // impurity factor = (2-1)/100 = 0.01
        expect(r.impurityDiscountKg).toBeCloseTo(270, 1)
    })

    it('sem desconto quando abaixo do padrão', () => {
        const r = calculateMoistureDiscount({ ...base, moistureMeasured: 13, impurityMeasured: 0.5 })
        expect(r.moistureDiscountKg).toBe(0)
        expect(r.impurityDiscountKg).toBe(0)
    })

    it('aplica desconto de ardidos', () => {
        const r = calculateMoistureDiscount({ ...base, damagedPercent: 5, moistureMeasured: 14, impurityMeasured: 1 })
        expect(r.damagedDiscountKg).toBeCloseTo(1350, 1) // 27000 * 5%
        expect(r.netWeightKg).toBeCloseTo(25650, 1)
    })

    it('calcula valor e perda com preço', () => {
        const r = calculateMoistureDiscount({ ...base, moistureMeasured: 14, impurityMeasured: 1 })
        expect(r.netBags).toBeCloseTo(450, 1) // 27000/60
        expect(r.totalValue).toBeCloseTo(450 * 120, 0)
        expect(r.lossValue).toBeCloseTo(0, 0)
    })

    it('usa peso de saca customizado', () => {
        const r = calculateMoistureDiscount({ ...base, moistureMeasured: 14, impurityMeasured: 1, bagWeightKg: 50 })
        expect(r.netBags).toBeCloseTo(540, 1) // 27000/50
    })
})

describe('validateMoistureDiscount', () => {
    it('rejeita peso zero', () => {
        expect(validateMoistureDiscount({ grossWeightKg: 0, moistureMeasured: 14, impurityMeasured: 1 })).toBeTruthy()
    })

    it('aceita inputs válidos', () => {
        expect(validateMoistureDiscount({ grossWeightKg: 27000, moistureMeasured: 16, impurityMeasured: 2 })).toBeNull()
    })

    it('rejeita umidade NaN', () => {
        expect(validateMoistureDiscount({ grossWeightKg: 27000, moistureMeasured: NaN, impurityMeasured: 2 })).toBeTruthy()
    })

    it('rejeita impureza NaN', () => {
        expect(validateMoistureDiscount({ grossWeightKg: 27000, moistureMeasured: 16, impurityMeasured: NaN })).toBeTruthy()
    })
})
