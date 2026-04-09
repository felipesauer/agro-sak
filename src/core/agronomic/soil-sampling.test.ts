import { describe, it, expect } from 'vitest'
import { calculateSoilSampling, validateSoilSampling } from './soil-sampling'

describe('soil-sampling', () => {
    const base = {
        areaHa: 500,
        samplingMethod: 'conventional' as const,
        managementZones: 3,
        costPerSample: 55,
        depthLayers: 1,
    }

    describe('calculateSoilSampling', () => {
        it('calculates samples per zone', () => {
            const r = calculateSoilSampling(base)!
            // avg 15 ha/sample; 500/3 = 166.67 ha/zone → ceil(166.67/15) = 12
            expect(r.samplesPerZone).toBe(12)
        })

        it('total samples = zones * samplesPerZone * layers', () => {
            const r = calculateSoilSampling(base)!
            expect(r.totalSamples).toBe(12 * 3 * 1)
        })

        it('multiplies layers', () => {
            const r = calculateSoilSampling({ ...base, depthLayers: 2 })!
            expect(r.totalSamples).toBe(12 * 3 * 2)
        })

        it('calculates cost', () => {
            const r = calculateSoilSampling(base)!
            expect(r.totalCost).toBe(r.totalSamples * 55)
            expect(r.costPerHa).toBeCloseTo(r.totalCost / 500, 2)
        })

        it('grid method more samples', () => {
            const conv = calculateSoilSampling(base)!
            const grid = calculateSoilSampling({ ...base, samplingMethod: 'grid' })!
            expect(grid.totalSamples).toBeGreaterThan(conv.totalSamples)
        })

        it('returns subSamplesPerComposite from rate table', () => {
            const r = calculateSoilSampling(base)!
            expect(r.subSamplesPerComposite).toBe(15)
        })

        it('returns null for invalid samplingMethod', () => {
            const r = calculateSoilSampling({ ...base, samplingMethod: 'unknown' as never })
            expect(r).toBeNull()
        })
    })

    describe('validateSoilSampling', () => {
        it('passes', () => expect(validateSoilSampling(base)).toBeNull())
        it('rejects zero area', () => expect(validateSoilSampling({ ...base, areaHa: 0 })).not.toBeNull())
        it('rejects zone > 50', () => expect(validateSoilSampling({ ...base, managementZones: 51 })).not.toBeNull())
        it('rejects area > 100000', () => expect(validateSoilSampling({ ...base, areaHa: 200_000 })).not.toBeNull())
        it('rejects zone < 1', () => expect(validateSoilSampling({ ...base, managementZones: 0 })).not.toBeNull())
        it('rejects negative costPerSample', () => expect(validateSoilSampling({ ...base, costPerSample: -10 })).not.toBeNull())
    })
})
