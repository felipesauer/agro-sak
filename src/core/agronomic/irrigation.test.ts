import { describe, it, expect } from 'vitest'
import { calculateIrrigation, validateIrrigation } from './irrigation'

describe('irrigation', () => {
    const base = {
        crop: 'soybean',
        phase: 'flowering',
        fieldCapacity: 100,
        wiltingPoint: 40,
        rootDepth: 0.6,
        precipitationMm: 0,
        tempMax: 34,
        tempMin: 22,
        tempMean: 28,
        irrigationSystem: 'pivot',
    }

    describe('calculateIrrigation', () => {
        it('calculates ETo using Hargreaves', () => {
            const r = calculateIrrigation(base)!
            const tRange = 34 - 22
            const expected = 0.0023 * (28 + 17.8) * Math.sqrt(tRange) * 15
            expect(r.eto).toBeCloseTo(expected, 2)
        })

        it('uses correct Kc for soybean flowering', () => {
            const r = calculateIrrigation(base)!
            expect(r.kc).toBe(1.10)
        })

        it('calculates ETc = ETo * Kc', () => {
            const r = calculateIrrigation(base)!
            expect(r.etc).toBeCloseTo(r.eto * 1.10, 2)
        })

        it('calculates net lamina', () => {
            const r = calculateIrrigation(base)!
            // (100-40)*0.6*0.50 = 18
            expect(r.netLamina).toBeCloseTo(18, 2)
        })

        it('calculates gross lamina with pivot efficiency', () => {
            const r = calculateIrrigation(base)!
            expect(r.grossLamina).toBeCloseTo(18 / 0.85, 2)
        })

        it('calculates irrigation interval', () => {
            const r = calculateIrrigation(base)!
            const effectiveEtc = Math.max(r.etc - 0 / 7, 0.1)
            expect(r.irrigationInterval).toBeCloseTo(18 / effectiveEtc, 2)
        })

        it('calculates application hours', () => {
            const r = calculateIrrigation(base)!
            expect(r.applicationHours).toBeCloseTo(r.grossLamina / 6, 2)
        })

        it('generates alert for flowering with deficit', () => {
            const r = calculateIrrigation(base)!
            expect(r.alert).toContain('floração')
        })

        it('no alert when precipitation is sufficient', () => {
            const r = calculateIrrigation({ ...base, precipitationMm: 200 })!
            expect(r.alert).toBeNull()
        })

        it('uses custom Kc', () => {
            const r = calculateIrrigation({ ...base, crop: 'custom', customKc: 0.75 })!
            expect(r.kc).toBe(0.75)
        })

        it('uses drip efficiency=0.92', () => {
            const r = calculateIrrigation({ ...base, irrigationSystem: 'drip' })!
            expect(r.grossLamina).toBeCloseTo(18 / 0.92, 2)
        })

        it('drip application rate is 3 mm/hr', () => {
            const r = calculateIrrigation({ ...base, irrigationSystem: 'drip' })!
            expect(r.applicationHours).toBeCloseTo(r.grossLamina / 3, 2)
        })

        it('falls back to kc=1.0 for unknown crop', () => {
            const r = calculateIrrigation({ ...base, crop: 'mango', phase: 'flowering' })!
            expect(r.kc).toBe(1.0)
        })

        it('falls back to default efficiency for unknown system', () => {
            const r = calculateIrrigation({ ...base, irrigationSystem: 'flood' })!
            expect(r.grossLamina).toBeCloseTo(18 / 0.85, 2)
        })

        it('falls back to customKc=1.0 when custom crop has no customKc', () => {
            const r = calculateIrrigation({ ...base, crop: 'custom' })!
            expect(r.kc).toBe(1.0)
        })

        it('uses sprinkler system rates', () => {
            const r = calculateIrrigation({ ...base, irrigationSystem: 'sprinkler' })!
            expect(r.grossLamina).toBeCloseTo(18 / 0.70, 2)
            expect(r.applicationHours).toBeCloseTo(r.grossLamina / 8, 2)
        })
    })

    describe('validateIrrigation', () => {
        it('returns null for valid input', () => {
            expect(validateIrrigation(base)).toBeNull()
        })

        it('rejects missing temperatures', () => {
            expect(validateIrrigation({ ...base, tempMax: NaN })).toBeTruthy()
        })

        it('rejects fieldCapacity <= wiltingPoint', () => {
            expect(validateIrrigation({ ...base, fieldCapacity: 40, wiltingPoint: 40 })).toBeTruthy()
        })

        it('rejects zero root depth', () => {
            expect(validateIrrigation({ ...base, rootDepth: 0 })).toBeTruthy()
        })
    })
})
