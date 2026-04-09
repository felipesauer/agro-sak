import { describe, it, expect } from 'vitest'
import { calculateGpsArea, validateGpsArea, ALQ_HA } from './gps-area'

describe('gps-area', () => {
    // ~1 km² square near equator
    const square = [
        { lat: -15.0, lng: -47.0 },
        { lat: -15.0, lng: -46.99 },
        { lat: -15.01, lng: -46.99 },
        { lat: -15.01, lng: -47.0 },
    ]

    describe('calculateGpsArea', () => {
        it('returns null with fewer than 3 points', () => {
            expect(calculateGpsArea([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBeNull()
        })

        it('calculates area of a simple triangle', () => {
            const triangle = [
                { lat: 0, lng: 0 },
                { lat: 0, lng: 0.01 },
                { lat: 0.01, lng: 0 },
            ]
            const r = calculateGpsArea(triangle)!
            expect(r.areaM2).toBeGreaterThan(0)
            expect(r.areaHa).toBeCloseTo(r.areaM2 / 10000, 4)
        })

        it('calculates area of the square polygon', () => {
            const r = calculateGpsArea(square)!
            // ~0.01° × ~0.01° at lat -15 ≈ 1.113 km × 1.075 km ≈ ~120 ha
            expect(r.areaHa).toBeGreaterThan(100)
            expect(r.areaHa).toBeLessThan(150)
        })

        it('calculates perimeter in meters', () => {
            const r = calculateGpsArea(square)!
            // ~4 km perimeter
            expect(r.perimeterM).toBeGreaterThan(3000)
            expect(r.perimeterM).toBeLessThan(5000)
        })

        it('detects non-self-intersecting polygon', () => {
            const r = calculateGpsArea(square)!
            expect(r.selfIntersecting).toBe(false)
        })

        it('detects self-intersecting polygon (bowtie)', () => {
            const bowtie = [
                { lat: 0, lng: 0 },
                { lat: 0.01, lng: 0.01 },
                { lat: 0, lng: 0.01 },
                { lat: 0.01, lng: 0 },
            ]
            const r = calculateGpsArea(bowtie)!
            expect(r.selfIntersecting).toBe(true)
        })

        it('filters out NaN points', () => {
            const pts = [
                { lat: 0, lng: 0 },
                { lat: NaN, lng: 0 },
                { lat: 0, lng: 0.01 },
                { lat: 0.01, lng: 0 },
            ]
            const r = calculateGpsArea(pts)!
            expect(r.areaM2).toBeGreaterThan(0)
        })

        it('returns null if less than 3 valid points after filter', () => {
            const pts = [
                { lat: 0, lng: 0 },
                { lat: NaN, lng: 0 },
                { lat: 1, lng: NaN },
            ]
            expect(calculateGpsArea(pts)).toBeNull()
        })
    })

    describe('validateGpsArea', () => {
        it('returns null for valid points', () => {
            expect(validateGpsArea(square)).toBeNull()
        })

        it('rejects fewer than 3 valid points', () => {
            expect(validateGpsArea([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBeTruthy()
        })

        it('rejects invalid latitude', () => {
            const pts = [
                { lat: 91, lng: 0 },
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
            ]
            expect(validateGpsArea(pts)).toBeTruthy()
        })

        it('rejects invalid longitude', () => {
            const pts = [
                { lat: 0, lng: 181 },
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
            ]
            expect(validateGpsArea(pts)).toBeTruthy()
        })

        it('rejects latitude < -90', () => {
            const pts = [
                { lat: -91, lng: 0 },
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
            ]
            expect(validateGpsArea(pts)).toBeTruthy()
        })

        it('rejects longitude < -180', () => {
            const pts = [
                { lat: 0, lng: -181 },
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
            ]
            expect(validateGpsArea(pts)).toBeTruthy()
        })
    })

    describe('branch: complex polygons', () => {
        it('handles non-intersecting pentagon', () => {
            const pentagon = [
                { lat: 0, lng: 0 },
                { lat: 0, lng: 0.02 },
                { lat: 0.015, lng: 0.025 },
                { lat: 0.02, lng: 0.01 },
                { lat: 0.01, lng: -0.005 },
            ]
            const r = calculateGpsArea(pentagon)!
            expect(r.selfIntersecting).toBe(false)
            expect(r.areaHa).toBeGreaterThan(0)
        })

        it('handles complex self-intersecting polygon', () => {
            const star = [
                { lat: 0, lng: 0 },
                { lat: 0.03, lng: 0.01 },
                { lat: 0, lng: 0.02 },
                { lat: 0.01, lng: -0.01 },
                { lat: 0.01, lng: 0.03 },
            ]
            const r = calculateGpsArea(star)!
            expect(r.selfIntersecting).toBe(true)
        })

        it('handles many-point non-intersecting polygon', () => {
            const hex = [
                { lat: 0, lng: 0.01 },
                { lat: 0.01, lng: 0.02 },
                { lat: 0.02, lng: 0.02 },
                { lat: 0.03, lng: 0.01 },
                { lat: 0.02, lng: 0 },
                { lat: 0.01, lng: 0 },
            ]
            const r = calculateGpsArea(hex)!
            expect(r.selfIntersecting).toBe(false)
            expect(r.perimeterM).toBeGreaterThan(0)
        })
    })

    describe('ALQ_HA', () => {
        it('has correct values', () => {
            expect(ALQ_HA.mt).toBe(4.84)
            expect(ALQ_HA.sp).toBe(2.42)
        })
    })
})
