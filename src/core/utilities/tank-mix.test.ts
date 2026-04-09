import { describe, it, expect } from 'vitest'
import { calculateTankMix, validateTankMix, TankMixProduct } from './tank-mix'

describe('tank-mix', () => {
    const products: TankMixProduct[] = [
        { name: 'Herbicida A', formulation: 'SC', dosePerHa: 2, unit: 'L' },
        { name: 'Fungicida B', formulation: 'WG', dosePerHa: 0.5, unit: 'kg' },
    ]

    const base = {
        tankVolumeL: 3000,
        sprayVolumeLHa: 120,
        areaHa: 100,
        products,
    }

    describe('calculateTankMix', () => {
        it('calculates tanks needed', () => {
            const r = calculateTankMix(base)!
            // (100*120)/3000 = 4
            expect(r.tanksNeeded).toBeCloseTo(4, 2)
        })

        it('calculates per-tank amount', () => {
            const r = calculateTankMix(base)!
            // dose * (tankVol / sprayVol) = 2*(3000/120) = 50 L
            const herbResult = r.products.find((p) => p.name === 'Herbicida A')!
            expect(herbResult.perTank).toBeCloseTo(50, 1)
        })

        it('calculates total amount', () => {
            const r = calculateTankMix(base)!
            // dose * area = 2*100 = 200 L
            const herbResult = r.products.find((p) => p.name === 'Herbicida A')!
            expect(herbResult.total).toBeCloseTo(200, 1)
        })

        it('preserves unit type', () => {
            const r = calculateTankMix(base)!
            const herb = r.products.find((p) => p.name === 'Herbicida A')!
            const fung = r.products.find((p) => p.name === 'Fungicida B')!
            expect(herb.unit).toBe('L')
            expect(fung.unit).toBe('kg')
        })

        it('sorts addition order by priority (WG first)', () => {
            const r = calculateTankMix(base)!
            expect(r.additionOrder[0]).toContain('Fungicida B')
            expect(r.additionOrder[0]).toContain('WG')
            expect(r.additionOrder[1]).toContain('Herbicida A')
        })

        it('handles all 4 formulation types in order', () => {
            const allProds: TankMixProduct[] = [
                { name: 'P-SL', formulation: 'SL', dosePerHa: 1, unit: 'L' },
                { name: 'P-WG', formulation: 'WG', dosePerHa: 1, unit: 'kg' },
                { name: 'P-EC', formulation: 'EC', dosePerHa: 1, unit: 'L' },
                { name: 'P-SC', formulation: 'SC', dosePerHa: 1, unit: 'L' },
            ]
            const r = calculateTankMix({ ...base, products: allProds })!
            expect(r.additionOrder[0]).toContain('WG')
            expect(r.additionOrder[1]).toContain('SC')
            expect(r.additionOrder[2]).toContain('EC')
            expect(r.additionOrder[3]).toContain('SL')
        })

        it('returns null for empty products', () => {
            expect(calculateTankMix({ ...base, products: [] })).toBeNull()
        })

        it('returns null for zero tank volume', () => {
            expect(calculateTankMix({ ...base, tankVolumeL: 0 })).toBeNull()
        })

        it('filters out products with zero dose', () => {
            const prods: TankMixProduct[] = [
                { name: 'Valid', formulation: 'SC', dosePerHa: 2, unit: 'L' },
                { name: 'ZeroDose', formulation: 'EC', dosePerHa: 0, unit: 'L' },
            ]
            const r = calculateTankMix({ ...base, products: prods })!
            expect(r.products).toHaveLength(1)
        })
    })

    describe('validateTankMix', () => {
        it('returns null for valid input', () => {
            expect(validateTankMix(base)).toBeNull()
        })

        it('rejects zero tank volume', () => {
            expect(validateTankMix({ ...base, tankVolumeL: 0 })).toBeTruthy()
        })

        it('rejects zero spray volume', () => {
            expect(validateTankMix({ ...base, sprayVolumeLHa: 0 })).toBeTruthy()
        })

        it('rejects zero area', () => {
            expect(validateTankMix({ ...base, areaHa: 0 })).toBeTruthy()
        })

        it('rejects empty valid products', () => {
            expect(validateTankMix({ ...base, products: [] })).toBeTruthy()
        })
    })

    describe('branch: edge cases', () => {
        it('uses fallback priority 99 for unknown formulation', () => {
            const prods: TankMixProduct[] = [
                { name: 'Known', formulation: 'WG', dosePerHa: 1, unit: 'kg' },
                { name: 'Unknown', formulation: 'XX' as never, dosePerHa: 1, unit: 'L' },
            ]
            const r = calculateTankMix({ ...base, products: prods })!
            expect(r.additionOrder[0]).toContain('Known')
            expect(r.additionOrder[1]).toContain('Unknown')
        })

        it('uses fallback priority 99 for both unknown formulations', () => {
            const prods: TankMixProduct[] = [
                { name: 'A', formulation: 'XX' as never, dosePerHa: 1, unit: 'L' },
                { name: 'B', formulation: 'YY' as never, dosePerHa: 1, unit: 'L' },
            ]
            const r = calculateTankMix({ ...base, products: prods })!
            expect(r.products).toHaveLength(2)
        })

        it('filters out product with empty name', () => {
            const prods: TankMixProduct[] = [
                { name: '', formulation: 'SC', dosePerHa: 2, unit: 'L' },
                { name: 'Valid', formulation: 'WG', dosePerHa: 1, unit: 'kg' },
            ]
            const r = calculateTankMix({ ...base, products: prods })!
            expect(r.products).toHaveLength(1)
        })
    })
})
