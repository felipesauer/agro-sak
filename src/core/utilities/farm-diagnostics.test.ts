import { describe, it, expect } from 'vitest'
import {
    calculateDiagnostics,
    validateDiagnostics,
    getLevel,
    QUESTIONS,
    DIMENSIONS,
} from './farm-diagnostics'

describe('farm-diagnostics', () => {
    const allMax = new Array(12).fill(3) as number[]
    const allMin = new Array(12).fill(0) as number[]
    const halfDone = [3, 3, null, null, 2, 2, null, null, 1, 1, null, null] as (number | null)[]

    describe('getLevel', () => {
        it('0-12 is Iniciante', () => expect(getLevel(0).label).toBe('Iniciante'))
        it('12 is Iniciante', () => expect(getLevel(12).label).toBe('Iniciante'))
        it('13 is Em desenvolvimento', () => expect(getLevel(13).label).toBe('Em desenvolvimento'))
        it('24 is Em desenvolvimento', () => expect(getLevel(24).label).toBe('Em desenvolvimento'))
        it('25+ is Avançado', () => expect(getLevel(25).label).toBe('Avançado'))
        it('36 is Avançado', () => expect(getLevel(36).label).toBe('Avançado'))
    })

    describe('calculateDiagnostics', () => {
        it('perfect score', () => {
            const r = calculateDiagnostics(allMax)
            expect(r.totalScore).toBe(36)
            expect(r.maxScore).toBe(36)
            expect(r.totalPct).toBe(100)
            expect(r.level.label).toBe('Avançado')
        })

        it('zero score', () => {
            const r = calculateDiagnostics(allMin)
            expect(r.totalScore).toBe(0)
            expect(r.level.label).toBe('Iniciante')
        })

        it('returns 6 dimension scores', () => {
            const r = calculateDiagnostics(allMax)
            expect(r.dimensionScores).toHaveLength(6)
        })

        it('each dimension has max 6 (2 questions × 3)', () => {
            const r = calculateDiagnostics(allMax)
            r.dimensionScores.forEach((d) => {
                expect(d.max).toBe(6)
                expect(d.score).toBe(6)
                expect(d.pct).toBe(100)
            })
        })

        it('weakest returns 3 lowest', () => {
            // Financeiro=6, rest=0
            const answers = [3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as number[]
            const r = calculateDiagnostics(answers)
            expect(r.weakest).toHaveLength(3)
            expect(r.weakest[0].pct).toBe(0)
        })

        it('handles null answers as 0', () => {
            const r = calculateDiagnostics(halfDone)
            expect(r.totalScore).toBe(12)
        })
    })

    describe('validateDiagnostics', () => {
        it('passes when all answered', () => expect(validateDiagnostics(allMax)).toBeNull())
        it('rejects partial answers', () => expect(validateDiagnostics(halfDone)).not.toBeNull())
        it('rejects wrong length', () => expect(validateDiagnostics([1, 2, 3])).not.toBeNull())

        it('rejects all-null answers (correct length)', () => {
            const allNull = new Array(12).fill(null) as (number | null)[]
            expect(validateDiagnostics(allNull)).not.toBeNull()
        })
    })

    describe('data integrity', () => {
        it('QUESTIONS has 12 entries', () => expect(QUESTIONS).toHaveLength(12))
        it('DIMENSIONS has 6 entries', () => expect(DIMENSIONS).toHaveLength(6))
        it('each question has 4 options', () => {
            QUESTIONS.forEach((q) => expect(q.options).toHaveLength(4))
        })
        it('every dimension has 2 questions', () => {
            DIMENSIONS.forEach((dim) => {
                expect(QUESTIONS.filter((q) => q.dimension === dim)).toHaveLength(2)
            })
        })
    })
})
