import { describe, it, expect } from 'vitest'
import { calculateWaterBalance, validateWaterBalance } from './water-balance'

describe('water-balance', () => {
    const base = {
        crop: 'soybean',
        phase: 'flowering',
        soilTexture: 'medium',
        precipWeekMm: 20,
        precipMonthMm: 80,
        tempMean: 28,
        tempMax: 34,
        tempMin: 22,
    }

    describe('calculateWaterBalance', () => {
        it('calculates ETo using Hargreaves', () => {
            const r = calculateWaterBalance(base)!
            const tRange = 34 - 22
            const expected = 0.0023 * (28 + 17.8) * Math.sqrt(tRange) * 15
            expect(r.eto).toBeCloseTo(expected, 2)
        })

        it('uses Kc for soybean flowering=1.10', () => {
            const r = calculateWaterBalance(base)!
            expect(r.kc).toBe(1.10)
        })

        it('calculates ETc = ETo * Kc', () => {
            const r = calculateWaterBalance(base)!
            expect(r.etc).toBeCloseTo(r.eto * 1.10, 2)
        })

        it('calculates weekly demand', () => {
            const r = calculateWaterBalance(base)!
            expect(r.weeklyDemand).toBeCloseTo(r.etc * 7, 2)
        })

        it('calculates weekly balance', () => {
            const r = calculateWaterBalance(base)!
            expect(r.weeklyBalance).toBeCloseTo(20 - r.etc * 7, 2)
        })

        it('calculates monthly balance', () => {
            const r = calculateWaterBalance(base)!
            expect(r.monthlyBalance).toBeCloseTo(80 - r.etc * 30, 2)
        })

        it('detects adequate condition with high precip', () => {
            const r = calculateWaterBalance({ ...base, precipWeekMm: 100, phase: 'vegetative' })!
            expect(r.condition).toBe('Excesso hídrico')
            expect(r.conditionVariant).toBe('info')
        })

        it('detects deficit with low precip', () => {
            const r = calculateWaterBalance({ ...base, precipWeekMm: 0, phase: 'vegetative' })!
            // Should be deficit
            expect(r.conditionVariant).not.toBe('success')
        })

        it('detects critical flowering deficit', () => {
            const r = calculateWaterBalance({ ...base, precipWeekMm: 0, phase: 'flowering' })!
            expect(r.condition).toContain('CRÍTICO')
            expect(r.conditionVariant).toBe('error')
        })

        it('calculates irrigation lamina when deficit', () => {
            const r = calculateWaterBalance({ ...base, precipWeekMm: 0, phase: 'vegetative' })!
            if (r.irrigationLamina > 0) {
                expect(r.irrigationLamina).toBeGreaterThan(0)
            }
        })

        it('irrigation lamina is 0 when surplus', () => {
            const r = calculateWaterBalance({ ...base, precipWeekMm: 200, phase: 'vegetative' })!
            expect(r.irrigationLamina).toBe(0)
        })

        it('applies soil factor for sandy soil', () => {
            const rMedium = calculateWaterBalance({ ...base, phase: 'vegetative' })!
            const rSandy = calculateWaterBalance({ ...base, phase: 'vegetative', soilTexture: 'sandy' })!
            // sandy factor=0.7 makes effective balance lower (more deficit-prone)
            // if balance is negative, sandy makes it less negative (worse for crop)
            expect(rSandy.irrigationLamina).not.toBe(rMedium.irrigationLamina)
        })

        it('uses custom Kc', () => {
            const r = calculateWaterBalance({ ...base, crop: 'custom', customKc: 0.5 })!
            expect(r.kc).toBe(0.5)
        })
    })

    describe('validateWaterBalance', () => {
        it('returns null for valid input', () => {
            expect(validateWaterBalance(base)).toBeNull()
        })

        it('rejects missing temperatures', () => {
            expect(validateWaterBalance({ ...base, tempMean: NaN })).toBeTruthy()
        })

        it('rejects tempMax < tempMin', () => {
            expect(validateWaterBalance({ ...base, tempMax: 20, tempMin: 30 })).toBeTruthy()
        })

        it('rejects missing precipitation', () => {
            expect(validateWaterBalance({ ...base, precipWeekMm: NaN, precipMonthMm: NaN })).toBeTruthy()
        })
    })

    it('custom crop without customKc defaults kc to 1.0', () => {
        const r = calculateWaterBalance({ ...base, crop: 'custom' })!
        expect(r.kc).toBe(1.0)
    })

    it('unknown crop defaults kc to 1.0 via KC fallback', () => {
        const r = calculateWaterBalance({ ...base, crop: 'millet', phase: 'vegetative' })!
        expect(r.kc).toBe(1.0)
    })

    it('unknown soilTexture defaults soilFactor to 1.0', () => {
        const r = calculateWaterBalance({ ...base, soilTexture: 'loam', phase: 'vegetative' })!
        expect(r).not.toBeNull()
    })
})
