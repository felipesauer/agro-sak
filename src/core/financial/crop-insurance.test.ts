import { describe, it, expect } from 'vitest'
import { calculateCropInsurance, validateCropInsurance } from './crop-insurance'

describe('crop-insurance', () => {
    const basePsr = {
        insuranceType: 'psr' as const,
        areaHa: 500,
        yieldScHa: 60,
        pricePerBag: 130,
        coverageLevelPercent: 70,
        premiumRatePercent: 6,
        subsidyRatePercent: 40,
    }

    describe('calculateCropInsurance — PSR', () => {
        it('calculates insured value', () => {
            const r = calculateCropInsurance(basePsr)!
            expect(r.insuredValuePerHa).toBe(7800) // 60 * 130
            expect(r.insuredValueTotal).toBe(3_900_000)
        })

        it('calculates gross premium', () => {
            const r = calculateCropInsurance(basePsr)!
            // 3900000 * 0.06 = 234000
            expect(r.grossPremium).toBe(234_000)
        })

        it('calculates subsidy and farmer premium', () => {
            const r = calculateCropInsurance(basePsr)!
            expect(r.subsidyAmount).toBe(93_600) // 234000 * 0.4
            expect(r.farmerPremium).toBe(140_400)
        })

        it('calculates coverage value', () => {
            const r = calculateCropInsurance(basePsr)!
            expect(r.coverageValuePerHa).toBe(5460) // 7800 * 0.7
            expect(r.coverageValueTotal).toBe(2_730_000)
        })

        it('generates 5 scenarios', () => {
            const r = calculateCropInsurance(basePsr)!
            expect(r.scenarios).toHaveLength(5)
            expect(r.scenarios[0].lossPct).toBe(20)
            expect(r.scenarios[4].lossPct).toBe(100)
        })

        it('calculates break-even loss pct', () => {
            const r = calculateCropInsurance(basePsr)!
            expect(r.breakEvenLossPct).toBeGreaterThan(0)
        })
    })

    describe('calculateCropInsurance — Proagro', () => {
        it('uses financed value for coverage', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: 500_000,
                proagroRatePercent: 4,
            })!
            expect(r.coverageValueTotal).toBe(500_000)
            expect(r.grossPremium).toBe(20_000) // 500000 * 0.04
            expect(r.subsidyAmount).toBe(0)
        })

        it('returns null when no financed value', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: 0,
            })
            expect(r).toBeNull()
        })
    })

    describe('validateCropInsurance', () => {
        it('passes with valid PSR inputs', () => {
            expect(validateCropInsurance(basePsr)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateCropInsurance({ ...basePsr, areaHa: 0 })).not.toBeNull()
        })

        it('rejects area > 100k', () => {
            expect(validateCropInsurance({ ...basePsr, areaHa: 100_001 })).not.toBeNull()
        })

        it('rejects out-of-range price', () => {
            expect(validateCropInsurance({ ...basePsr, pricePerBag: 30 })).not.toBeNull()
        })

        it('rejects proagro without financed value', () => {
            expect(validateCropInsurance({ ...basePsr, insuranceType: 'proagro' })).not.toBeNull()
        })

        it('rejects proagro_mais without financed value', () => {
            expect(validateCropInsurance({ ...basePsr, insuranceType: 'proagro_mais' })).not.toBeNull()
        })

        it('rejects zero yieldScHa', () => {
            expect(validateCropInsurance({ ...basePsr, yieldScHa: 0 })).not.toBeNull()
        })

        it('rejects zero pricePerBag', () => {
            expect(validateCropInsurance({ ...basePsr, pricePerBag: 0 })).not.toBeNull()
        })

        it('rejects pricePerBag > 2000', () => {
            expect(validateCropInsurance({ ...basePsr, pricePerBag: 2500 })).not.toBeNull()
        })
    })

    describe('branch: proagro_mais calc', () => {
        it('calculates proagro_mais same as proagro', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro_mais',
                financedValue: 300_000,
                proagroRatePercent: 3,
            })!
            expect(r.coverageValueTotal).toBe(300_000)
            expect(r.grossPremium).toBe(9000)
            expect(r.subsidyAmount).toBe(0)
        })

        it('proagro uses default rate when proagroRatePercent not provided', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: 200_000,
            })!
            expect(r.grossPremium).toBe(200_000 * 0.04)
        })

        it('proagro returns null for negative financedValue', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: -100,
            })
            expect(r).toBeNull()
        })

        it('PSR breakEvenLossPct is 0 when farmerPremium is 0', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                premiumRatePercent: 0,
            })!
            expect(r.farmerPremium).toBe(0)
            expect(r.breakEvenLossPct).toBe(0)
        })

        it('proagro breakEvenLossPct is 0 when grossPremium is 0', () => {
            const r = calculateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: 200_000,
                proagroRatePercent: 0,
            })!
            expect(r.grossPremium).toBe(0)
            expect(r.breakEvenLossPct).toBe(0)
        })

        it('validate rejects proagro with negative financedValue', () => {
            expect(validateCropInsurance({
                ...basePsr,
                insuranceType: 'proagro',
                financedValue: -5,
            })).not.toBeNull()
        })
    })
})
