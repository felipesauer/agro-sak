import { describe, it, expect } from 'vitest'
import {
    lookupPlantingWindows,
    validatePlantingWindowQuery,
    getAvailableCrops,
    getAvailableStates,
    PLANTING_WINDOWS,
    STATE_OPTIONS,
    CROP_OPTIONS,
    RISK_LABELS,
} from './planting-window'

describe('planting-window', () => {
    describe('lookupPlantingWindows', () => {
        it('returns entries for MT soybean', () => {
            const r = lookupPlantingWindows('MT', 'soybean')
            expect(r).toHaveLength(3)
            expect(r[0].gm).toContain('Precoce')
            expect(r[0].risk).toBe('low')
        })

        it('returns empty for invalid state', () => {
            expect(lookupPlantingWindows('XX', 'soybean')).toEqual([])
        })

        it('returns empty for missing crop in state', () => {
            expect(lookupPlantingWindows('PI', 'wheat')).toEqual([])
        })

        it('returns wheat entries for PR', () => {
            const r = lookupPlantingWindows('PR', 'wheat')
            expect(r).toHaveLength(3)
        })

        it('returns cotton for MT', () => {
            const r = lookupPlantingWindows('MT', 'cotton')
            expect(r).toHaveLength(1)
            expect(r[0].risk).toBe('medium')
        })
    })

    describe('validatePlantingWindowQuery', () => {
        it('passes valid query', () => expect(validatePlantingWindowQuery('MT', 'soybean')).toBeNull())
        it('rejects empty state', () => expect(validatePlantingWindowQuery('', 'soybean')).not.toBeNull())
        it('rejects empty crop', () => expect(validatePlantingWindowQuery('MT', '')).not.toBeNull())
        it('rejects unknown state', () => expect(validatePlantingWindowQuery('XX', 'soybean')).not.toBeNull())
    })

    describe('getAvailableCrops', () => {
        it('returns crops for MT', () => {
            const crops = getAvailableCrops('MT')
            expect(crops).toContain('soybean')
            expect(crops).toContain('cotton')
            expect(crops).toContain('bean')
        })

        it('returns empty for unknown state', () => {
            expect(getAvailableCrops('XX')).toEqual([])
        })
    })

    describe('getAvailableStates', () => {
        it('returns 13 states', () => {
            expect(getAvailableStates()).toHaveLength(13)
        })
    })

    describe('data integrity', () => {
        it('STATE_OPTIONS has 13 entries', () => expect(STATE_OPTIONS).toHaveLength(13))
        it('CROP_OPTIONS has 6 entries', () => expect(CROP_OPTIONS).toHaveLength(6))
        it('RISK_LABELS has 3 entries', () => expect(Object.keys(RISK_LABELS)).toHaveLength(3))

        it('all windows have required fields', () => {
            for (const state of Object.keys(PLANTING_WINDOWS)) {
                for (const crop of Object.keys(PLANTING_WINDOWS[state])) {
                    for (const w of PLANTING_WINDOWS[state][crop]) {
                        expect(w.gm).toBeTruthy()
                        expect(w.start).toBeTruthy()
                        expect(w.end).toBeTruthy()
                        expect(w.harvestEstimate).toBeTruthy()
                        expect(['low', 'medium', 'high']).toContain(w.risk)
                    }
                }
            }
        })
    })
})
