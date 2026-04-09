import { describe, it, expect } from 'vitest'
import { calculateSoftwareRoi, validateSoftwareRoi } from './software-roi'

describe('software-roi', () => {
    const base = {
        areaHa: 1000,
        crop: 'soybean',
        management: 'spreadsheet',
        softwareCostMonth: 290,
    }

    describe('calculateSoftwareRoi', () => {
        it('returns 5 savings categories', () => {
            const r = calculateSoftwareRoi(base)!
            expect(r.savings).toHaveLength(5)
        })

        it('calculates software annual cost', () => {
            const r = calculateSoftwareRoi(base)!
            expect(r.softwareAnnual).toBe(290 * 12)
        })

        it('totalAnnual = sum of all savings', () => {
            const r = calculateSoftwareRoi(base)!
            const sum = r.savings.reduce((s, row) => s + row.annual, 0)
            expect(r.totalAnnual).toBeCloseTo(sum, 0)
        })

        it('calculates ROI = (total-cost)/cost*100', () => {
            const r = calculateSoftwareRoi(base)!
            const expected = ((r.totalAnnual - r.softwareAnnual) / r.softwareAnnual) * 100
            expect(r.roi).toBeCloseTo(expected, 1)
        })

        it('calculates payback months', () => {
            const r = calculateSoftwareRoi(base)!
            const expected = r.softwareAnnual / (r.totalAnnual / 12)
            expect(r.paybackMonths).toBeCloseTo(expected, 2)
        })

        it('applies mgmtFactor=1.0 for memory', () => {
            const r = calculateSoftwareRoi({ ...base, management: 'memory' })!
            const rSpread = calculateSoftwareRoi(base)!
            expect(r.totalAnnual).toBeGreaterThan(rSpread.totalAnnual)
        })

        it('applies mgmtFactor=0.4 for basic_software', () => {
            const r = calculateSoftwareRoi({ ...base, management: 'basic_software' })!
            const rSpread = calculateSoftwareRoi(base)!
            expect(r.totalAnnual).toBeLessThan(rSpread.totalAnnual)
        })

        it('input saving = inputCost*area*0.015*mgmtFactor', () => {
            const r = calculateSoftwareRoi({ ...base, management: 'memory' })!
            const expected = 2800 * 1000 * 0.015 * 1.0
            expect(r.savings[0].annual).toBeCloseTo(expected, 0)
        })

        it('uses custom crop values', () => {
            const r = calculateSoftwareRoi({
                ...base,
                crop: 'custom',
                customInputCost: 5000,
                customProd: 80,
                customPrice: 130,
            })!
            // inputSaving = 5000*1000*0.015*0.7
            expect(r.savings[0].annual).toBeCloseTo(5000 * 1000 * 0.015 * 0.7, 0)
        })

        it('returns null for zero area', () => {
            expect(calculateSoftwareRoi({ ...base, areaHa: 0 })).toBeNull()
        })
    })

    describe('validateSoftwareRoi', () => {
        it('returns null for valid input', () => {
            expect(validateSoftwareRoi(base)).toBeNull()
        })

        it('rejects zero area', () => {
            expect(validateSoftwareRoi({ ...base, areaHa: 0 })).toBeTruthy()
        })

        it('rejects zero software cost', () => {
            expect(validateSoftwareRoi({ ...base, softwareCostMonth: 0 })).toBeTruthy()
        })
    })

    describe('branch: unknown crop and custom defaults', () => {
        it('falls back to defaults for unknown crop', () => {
            const r = calculateSoftwareRoi({ ...base, crop: 'oats' })!
            // Should use fallback: inputCost=2800, prod=55, price=110
            expect(r.savings[0].annual).toBeCloseTo(2800 * 1000 * 0.015 * 0.7, 0)
        })

        it('custom crop without custom values uses defaults', () => {
            const r = calculateSoftwareRoi({ ...base, crop: 'custom' })!
            // Falls back to customInputCost=2800, customProd=55, customPrice=110
            expect(r.savings[0].annual).toBeCloseTo(2800 * 1000 * 0.015 * 0.7, 0)
        })

        it('roi is 0 when softwareAnnual is 0', () => {
            const r = calculateSoftwareRoi({ ...base, softwareCostMonth: 0 })!
            expect(r.roi).toBe(0)
        })
    })
})
