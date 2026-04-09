import { describe, it, expect } from 'vitest'
import { calculateOperationalCapacity, validateOperationalCapacity } from './operational-capacity'

describe('operational-capacity', () => {
    const base = {
        workWidthM: 10,
        speedKmH: 6,
        efficiencyPercent: 75,
    }

    describe('calculateOperationalCapacity', () => {
        it('calculates ha/hour correctly', () => {
            // (10 × 6 × 0.75) / 10 = 4.5
            const r = calculateOperationalCapacity(base)
            expect(r.haPerHour).toBe(4.5)
        })

        it('returns null hours/days when no area provided', () => {
            const r = calculateOperationalCapacity(base)
            expect(r.hoursNeeded).toBeNull()
            expect(r.daysNeeded).toBeNull()
        })

        it('calculates hours needed for area', () => {
            const r = calculateOperationalCapacity({ ...base, areaHa: 45 })
            expect(r.hoursNeeded).toBe(10) // 45 / 4.5
        })

        it('calculates days needed when hoursPerDay provided', () => {
            const r = calculateOperationalCapacity({ ...base, areaHa: 45, hoursPerDay: 10 })
            expect(r.daysNeeded).toBe(1) // 10 hours / 10 h/day
        })

        it('handles 100% efficiency', () => {
            const r = calculateOperationalCapacity({ ...base, efficiencyPercent: 100 })
            expect(r.haPerHour).toBe(6) // (10 × 6 × 1.0) / 10
        })
    })

    describe('validateOperationalCapacity', () => {
        it('passes with valid inputs', () => {
            expect(validateOperationalCapacity(base)).toBeNull()
        })

        it('rejects zero width', () => {
            expect(validateOperationalCapacity({ ...base, workWidthM: 0 })).not.toBeNull()
        })

        it('rejects zero speed', () => {
            expect(validateOperationalCapacity({ ...base, speedKmH: 0 })).not.toBeNull()
        })

        it('rejects efficiency > 100', () => {
            expect(validateOperationalCapacity({ ...base, efficiencyPercent: 101 })).not.toBeNull()
        })

        it('rejects zero efficiency', () => {
            expect(validateOperationalCapacity({ ...base, efficiencyPercent: 0 })).not.toBeNull()
        })
    })
})
