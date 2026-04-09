import { describe, it, expect } from 'vitest'
import { calculatePreHarvestYield, validatePreHarvestYield } from './pre-harvest-yield'

describe('pre-harvest-yield', () => {
    describe('soybean', () => {
        const base = {
            crop: 'soybean' as const,
            plantsPerMeter: 14,
            podsPerPlant: 32,
            grainsPerPod: 2.4,
            thousandGrainWeight: 145,
            rowSpacingM: 0.50,
        }

        it('calculates yield kg/ha', () => {
            const r = calculatePreHarvestYield(base)
            // plantsPerM2 = 14 / 0.5 = 28
            // kg/ha = 28 × 32 × 2.4 × (145/1000) = 28 × 32 × 2.4 × 0.145
            // = 28 × 32 × 0.348 = 28 × 11.136 = 311.808
            // Wait, 2.4 × 0.145 = 0.348, 32 × 0.348 = 11.136, 28 × 11.136 = 311.808
            expect(r.yieldKgHa).toBeCloseTo(311.808, 1)
        })

        it('calculates yield sc/ha', () => {
            const r = calculatePreHarvestYield(base)
            expect(r.yieldScHa).toBeCloseTo(311.808 / 60, 1)
        })

        it('confidence interval is ±10%', () => {
            const r = calculatePreHarvestYield(base)
            expect(r.yieldLow).toBeCloseTo(r.yieldScHa * 0.9, 2)
            expect(r.yieldHigh).toBeCloseTo(r.yieldScHa * 1.1, 2)
        })
    })

    describe('corn', () => {
        const base = {
            crop: 'corn' as const,
            earsPerMeter: 3.5,
            rowsPerEar: 16,
            grainsPerRow: 34,
            thousandGrainWeight: 290,
            rowSpacingM: 0.50,
        }

        it('calculates yield kg/ha', () => {
            const r = calculatePreHarvestYield(base)
            // earsPerM2 = 3.5 / 0.5 = 7
            // kg/ha = 7 × 16 × 34 × (290/1000) = 7 × 16 × 34 × 0.29
            // = 7 × 16 × 9.86 = 7 × 157.76 = 1104.32
            expect(r.yieldKgHa).toBeCloseTo(1104.32, 1)
        })

        it('calculates yield sc/ha', () => {
            const r = calculatePreHarvestYield(base)
            expect(r.yieldScHa).toBeCloseTo(1104.32 / 60, 1)
        })
    })

    describe('validatePreHarvestYield', () => {
        it('passes for valid soybean input', () => {
            const r = validatePreHarvestYield({
                crop: 'soybean', plantsPerMeter: 14, podsPerPlant: 32,
                grainsPerPod: 2.4, thousandGrainWeight: 145, rowSpacingM: 0.5,
            })
            expect(r).toBeNull()
        })

        it('passes for valid corn input', () => {
            const r = validatePreHarvestYield({
                crop: 'corn', earsPerMeter: 3.5, rowsPerEar: 16,
                grainsPerRow: 34, thousandGrainWeight: 290, rowSpacingM: 0.5,
            })
            expect(r).toBeNull()
        })

        it('rejects zero spacing', () => {
            const r = validatePreHarvestYield({
                crop: 'soybean', plantsPerMeter: 14, podsPerPlant: 32,
                grainsPerPod: 2.4, thousandGrainWeight: 145, rowSpacingM: 0,
            })
            expect(r).not.toBeNull()
        })

        it('rejects zero PMG', () => {
            const r = validatePreHarvestYield({
                crop: 'corn', earsPerMeter: 3.5, rowsPerEar: 16,
                grainsPerRow: 34, thousandGrainWeight: 0, rowSpacingM: 0.5,
            })
            expect(r).not.toBeNull()
        })

        it('rejects missing soybean plants', () => {
            const r = validatePreHarvestYield({
                crop: 'soybean', plantsPerMeter: 0, podsPerPlant: 32,
                grainsPerPod: 2.4, thousandGrainWeight: 145, rowSpacingM: 0.5,
            })
            expect(r).not.toBeNull()
        })

        it('rejects missing corn ears', () => {
            const r = validatePreHarvestYield({
                crop: 'corn', earsPerMeter: 0, rowsPerEar: 16,
                grainsPerRow: 34, thousandGrainWeight: 290, rowSpacingM: 0.5,
            })
            expect(r).not.toBeNull()
        })

        it('rejects missing soybean podsPerPlant', () => {
            expect(validatePreHarvestYield({
                crop: 'soybean', plantsPerMeter: 14, podsPerPlant: 0,
                grainsPerPod: 2.4, thousandGrainWeight: 145, rowSpacingM: 0.5,
            })).not.toBeNull()
        })

        it('rejects missing soybean grainsPerPod', () => {
            expect(validatePreHarvestYield({
                crop: 'soybean', plantsPerMeter: 14, podsPerPlant: 32,
                grainsPerPod: 0, thousandGrainWeight: 145, rowSpacingM: 0.5,
            })).not.toBeNull()
        })

        it('rejects missing corn rowsPerEar', () => {
            expect(validatePreHarvestYield({
                crop: 'corn', earsPerMeter: 3.5, rowsPerEar: 0,
                grainsPerRow: 34, thousandGrainWeight: 290, rowSpacingM: 0.5,
            })).not.toBeNull()
        })

        it('rejects missing corn grainsPerRow', () => {
            expect(validatePreHarvestYield({
                crop: 'corn', earsPerMeter: 3.5, rowsPerEar: 16,
                grainsPerRow: 0, thousandGrainWeight: 290, rowSpacingM: 0.5,
            })).not.toBeNull()
        })
    })
})
