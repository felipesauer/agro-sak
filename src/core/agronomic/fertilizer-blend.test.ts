import { describe, it, expect } from 'vitest'
import { calculateFertilizerBlend, solveBlend, validateFertilizerBlend } from './fertilizer-blend'
import type { FertilizerSource } from './fertilizer-blend'

const MAP: FertilizerSource = { name: 'MAP', n: 11, p2o5: 52, k2o: 0, s: 0, pricePerTon: 3200 }
const KCL: FertilizerSource = { name: 'KCl', n: 0, p2o5: 0, k2o: 60, s: 0, pricePerTon: 2800 }
const UREIA: FertilizerSource = { name: 'Uréia', n: 45, p2o5: 0, k2o: 0, s: 0, pricePerTon: 2600 }

describe('fertilizer-blend', () => {
    describe('solveBlend', () => {
        it('allocates P source for P demand', () => {
            const r = solveBlend({ n: 0, p: 90, k: 0 }, [{ source: MAP }])
            expect(r).toHaveLength(1)
            expect(r[0].pDelivered).toBeCloseTo(90, 0)
        })

        it('allocates K source for K demand', () => {
            const r = solveBlend({ n: 0, p: 0, k: 60 }, [{ source: KCL }])
            expect(r).toHaveLength(1)
            expect(r[0].kDelivered).toBeCloseTo(60, 0)
        })

        it('allocates N-only source when only N demand remains', () => {
            const r = solveBlend({ n: 50, p: 0, k: 0 }, [{ source: UREIA }])
            expect(r).toHaveLength(1)
            expect(r[0].nDelivered).toBeCloseTo(50, 0)
        })

        it('skips source that cannot fulfill any remaining demand', () => {
            const r = solveBlend({ n: 0, p: 90, k: 0 }, [{ source: MAP }, { source: UREIA }])
            expect(r).toHaveLength(1)
            expect(r[0].name).toBe('MAP')
        })
    })

    describe('calculateFertilizerBlend', () => {
        it('calculates area-dependent totals', () => {
            const r = calculateFertilizerBlend({ n: 0, p: 90, k: 60 }, [{ source: MAP }, { source: KCL }], 500)
            expect(r).not.toBeNull()
            expect(r!.sources[0].kgTotal).toBe(r!.sources[0].kgPerHa * 500)
        })

        it('calculates excess nutrients', () => {
            const r = calculateFertilizerBlend({ n: 0, p: 90, k: 60 }, [{ source: MAP }, { source: KCL }], 100)!
            // MAP delivers some N as side effect
            expect(r.nExcess).toBeGreaterThanOrEqual(0)
        })

        it('returns null when no sources match', () => {
            const r = calculateFertilizerBlend({ n: 0, p: 90, k: 0 }, [{ source: KCL }], 100)
            expect(r).toBeNull()
        })
    })

    describe('validateFertilizerBlend', () => {
        it('passes', () =>
            expect(validateFertilizerBlend({ n: 20, p: 90, k: 60 }, [{ source: MAP }], 500)).toBeNull())
        it('rejects no nutrients', () =>
            expect(validateFertilizerBlend({ n: 0, p: 0, k: 0 }, [{ source: MAP }], 500)).not.toBeNull())
        it('rejects no sources', () =>
            expect(validateFertilizerBlend({ n: 20, p: 90, k: 60 }, [], 500)).not.toBeNull())
        it('rejects zero area', () =>
            expect(validateFertilizerBlend({ n: 20, p: 90, k: 60 }, [{ source: MAP }], 0)).not.toBeNull())
        it('rejects area > 100,000', () =>
            expect(validateFertilizerBlend({ n: 20, p: 90, k: 60 }, [{ source: MAP }], 200_000)).not.toBeNull())
    })

    it('solveBlend sort tiebreaker uses max concentration when priorities equal', () => {
        const srcA: FertilizerSource = { name: 'A', n: 0, p2o5: 0, k2o: 40, s: 0, pricePerTon: 2000 }
        const srcB: FertilizerSource = { name: 'B', n: 0, p2o5: 0, k2o: 60, s: 0, pricePerTon: 2000 }
        const r = solveBlend({ n: 0, p: 0, k: 60 }, [{ source: srcA }, { source: srcB }])
        expect(r[0].name).toBe('B')
    })
})
