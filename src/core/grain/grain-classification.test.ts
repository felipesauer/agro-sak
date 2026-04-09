import { describe, it, expect } from 'vitest'
import { calculateGrainClassification, validateGrainClassification } from './grain-classification'

describe('calculateGrainClassification', () => {
    it('soja Tipo 1 — todos abaixo dos limites', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 13, impurities: 0.5, broken: 5, greenDamaged: 5, burned: 0.5 })!
        expect(r.type).toBe(1)
        expect(r.typeName).toBe('Tipo 1')
        expect(r.approved).toBe(true)
        expect(r.totalDiscount).toBe(0)
    })

    it('soja Tipo 2 — quebrados entre Tipo 1 e 2', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 10, greenDamaged: 5, burned: 0.5 })!
        expect(r.type).toBe(2)
    })

    it('soja Tipo 3 — quebrados altos', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 20, greenDamaged: 5, burned: 0.5 })!
        expect(r.type).toBe(3)
    })

    it('soja fora de padrão — tudo acima', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 35, greenDamaged: 35, burned: 6 })!
        expect(r.type).toBe(0)
        expect(r.approved).toBe(false)
        expect(r.alerts.some(a => a.includes('fora de padrão'))).toBe(true)
    })

    it('desconto por umidade', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 16, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })!
        expect(r.discountMoisture).toBeCloseTo(3, 1) // (16-14)*1.5
    })

    it('desconto por impureza', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 3, broken: 5, greenDamaged: 5, burned: 0.5 })!
        expect(r.discountImpurities).toBeCloseTo(2, 1) // (3-1)*1.0
    })

    it('milho — limites diferentes', () => {
        const r = calculateGrainClassification({ crop: 'corn', moisture: 14, impurities: 1, broken: 2, greenDamaged: 5, burned: 0.3 })!
        expect(r.type).toBe(1)
    })

    it('milho — ardidos alto impede Tipo 1', () => {
        const r = calculateGrainClassification({ crop: 'corn', moisture: 14, impurities: 1, broken: 2, greenDamaged: 5, burned: 0.8 })!
        expect(r.type).toBe(2) // burned > 0.5 (Type1 limit)
    })

    it('retorna null para cultura desconhecida', () => {
        const r = calculateGrainClassification({ crop: 'unknown', moisture: 14, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })
        expect(r).toBeNull()
    })

    it('alerta umidade > 18%', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 20, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })!
        expect(r.alerts.some(a => a.includes('18%'))).toBe(true)
    })

    it('defects array tem 5 linhas', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })!
        expect(r.defects).toHaveLength(5)
    })

    it('alerta ardidos acima do Tipo 1', () => {
        const r = calculateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 10, greenDamaged: 5, burned: 1.5 })!
        expect(r.alerts.some(a => a.includes('ardidos'))).toBe(true)
    })
})

describe('validateGrainClassification', () => {
    it('rejeita umidade NaN', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: NaN, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })).toBeTruthy()
    })

    it('rejeita umidade fora do range', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 45, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 5, greenDamaged: 5, burned: 0.5 })).toBeNull()
    })

    it('rejeita impureza NaN', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 14, impurities: NaN, broken: 5, greenDamaged: 5, burned: 0.5 })).toBeTruthy()
    })

    it('rejeita quebrados NaN', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: NaN, greenDamaged: 5, burned: 0.5 })).toBeTruthy()
    })

    it('rejeita avariados NaN', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 5, greenDamaged: NaN, burned: 0.5 })).toBeTruthy()
    })

    it('rejeita ardidos NaN', () => {
        expect(validateGrainClassification({ crop: 'soybean', moisture: 14, impurities: 1, broken: 5, greenDamaged: 5, burned: NaN })).toBeTruthy()
    })
})
