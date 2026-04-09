import { describe, it, expect } from 'vitest'
import { calculateSprayerCalibration, validateSprayerCalibration } from './sprayer-calibration'

describe('sprayer-calibration', () => {
    const base = {
        flowPerNozzleLPerMin: 0.8,
        speedKmH: 6,
        nozzleSpacingM: 0.5,
        tankCapacityL: 2000,
    }

    describe('calculateSprayerCalibration', () => {
        it('calculates spray volume L/ha', () => {
            const r = calculateSprayerCalibration(base)
            // (0.8 × 600) / (6 × 0.5) = 480/3 = 160
            expect(r.sprayVolumeLPerHa).toBe(160)
        })

        it('calculates area covered per tank', () => {
            const r = calculateSprayerCalibration(base)
            // 2000 / 160 = 12.5 ha
            expect(r.areaCoveredPerTank).toBe(12.5)
        })

        it('returns null productPerTank when no dose', () => {
            const r = calculateSprayerCalibration(base)
            expect(r.productPerTank).toBeNull()
        })

        it('calculates product per tank when dose provided', () => {
            const r = calculateSprayerCalibration({ ...base, dosePerHa: 2 })
            expect(r.productPerTank).toBe(25) // 2 × 12.5
        })

        it('shows no alert for normal volume', () => {
            const r = calculateSprayerCalibration(base)
            expect(r.volumeAlert).toBeNull()
        })

        it('warns when volume < 50', () => {
            // make volume low: (0.1 × 600) / (6 × 0.5) = 20
            const r = calculateSprayerCalibration({ ...base, flowPerNozzleLPerMin: 0.1 })
            expect(r.volumeAlert).not.toBeNull()
            expect(r.volumeAlert).toContain('50')
        })

        it('warns when volume > 400', () => {
            // (3 × 600) / (2 × 0.5) = 1800
            const r = calculateSprayerCalibration({ ...base, flowPerNozzleLPerMin: 3, speedKmH: 2 })
            expect(r.volumeAlert).not.toBeNull()
            expect(r.volumeAlert).toContain('400')
        })
    })

    describe('validateSprayerCalibration', () => {
        it('passes with valid inputs', () => {
            expect(validateSprayerCalibration(base)).toBeNull()
        })

        it('rejects zero flow', () => {
            expect(validateSprayerCalibration({ ...base, flowPerNozzleLPerMin: 0 })).not.toBeNull()
        })

        it('rejects zero speed', () => {
            expect(validateSprayerCalibration({ ...base, speedKmH: 0 })).not.toBeNull()
        })

        it('rejects zero spacing', () => {
            expect(validateSprayerCalibration({ ...base, nozzleSpacingM: 0 })).not.toBeNull()
        })

        it('rejects zero tank capacity', () => {
            expect(validateSprayerCalibration({ ...base, tankCapacityL: 0 })).not.toBeNull()
        })
    })

    describe('branch: edge cases', () => {
        it('productPerTank is null when dosePerHa is 0', () => {
            const r = calculateSprayerCalibration({ ...base, dosePerHa: 0 })
            expect(r.productPerTank).toBeNull()
        })
    })
})
