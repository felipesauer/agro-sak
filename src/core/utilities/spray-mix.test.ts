import { describe, it, expect } from 'vitest'
import { calculateSprayMix, validateSprayMix } from './spray-mix'

describe('calculateSprayMix', () => {
    it('calcula dose por tanque', () => {
        const r = calculateSprayMix({ tankVolumeLiters: 3000, sprayVolumeLPerHa: 120, dosePerHa: 0.5 })
        // area per tank = 3000/120 = 25 ha
        expect(r.areaCoveredPerTank).toBe(25)
        // per tank = 0.5 * 25 = 12.5
        expect(r.perTank).toBeCloseTo(12.5, 2)
    })

    it('calcula dose por 100L', () => {
        const r = calculateSprayMix({ tankVolumeLiters: 3000, sprayVolumeLPerHa: 120, dosePerHa: 0.5 })
        // per 100L = 0.5 * (100/120) ≈ 0.4167
        expect(r.per100L).toBeCloseTo(0.4167, 3)
    })

    it('funciona com volumes grandes', () => {
        const r = calculateSprayMix({ tankVolumeLiters: 5000, sprayVolumeLPerHa: 200, dosePerHa: 2 })
        expect(r.areaCoveredPerTank).toBe(25)
        expect(r.perTank).toBe(50) // 2 * 25
    })

    it('tank pequeno', () => {
        const r = calculateSprayMix({ tankVolumeLiters: 600, sprayVolumeLPerHa: 150, dosePerHa: 1 })
        expect(r.areaCoveredPerTank).toBe(4)
        expect(r.perTank).toBe(4)
    })
})

describe('validateSprayMix', () => {
    it('rejeita tanque zero', () => {
        expect(validateSprayMix({ tankVolumeLiters: 0, sprayVolumeLPerHa: 120, dosePerHa: 0.5 })).toBeTruthy()
    })

    it('rejeita calda zero', () => {
        expect(validateSprayMix({ tankVolumeLiters: 3000, sprayVolumeLPerHa: 0, dosePerHa: 0.5 })).toBeTruthy()
    })

    it('rejeita dose zero', () => {
        expect(validateSprayMix({ tankVolumeLiters: 3000, sprayVolumeLPerHa: 120, dosePerHa: 0 })).toBeTruthy()
    })

    it('aceita válidos', () => {
        expect(validateSprayMix({ tankVolumeLiters: 3000, sprayVolumeLPerHa: 120, dosePerHa: 0.5 })).toBeNull()
    })
})
