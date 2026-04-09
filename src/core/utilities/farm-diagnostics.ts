// ── Farm Diagnostics Module (Quiz scoring) ──

export interface QuestionOption {
    label: string
    score: number
}

export interface Question {
    dimension: string
    text: string
    options: QuestionOption[]
}

export interface DiagnosticLevel {
    label: string
    color: string
}

export interface DimensionScore {
    dim: string
    score: number
    max: number
    pct: number
}

export interface FarmDiagnosticsResult {
    totalScore: number
    maxScore: number
    totalPct: number
    level: DiagnosticLevel
    dimensionScores: DimensionScore[]
    weakest: DimensionScore[]
}

export const DIMENSIONS = ['Financeiro', 'Insumos', 'Planejamento', 'Máquinas', 'Fiscal', 'Tecnologia'] as const

export const QUESTIONS: Question[] = [
    { dimension: 'Financeiro', text: 'Como você controla as despesas da fazenda?', options: [
        { label: 'Memória / não controla', score: 0 }, { label: 'Caderno', score: 1 },
        { label: 'Planilha Excel', score: 2 }, { label: 'Software específico', score: 3 },
    ]},
    { dimension: 'Financeiro', text: 'Com que frequência você sabe o custo por hectare da safra?', options: [
        { label: 'Nunca', score: 0 }, { label: 'Após a colheita', score: 1 },
        { label: 'Durante a safra', score: 2 }, { label: 'Em tempo real', score: 3 },
    ]},
    { dimension: 'Insumos', text: 'Como você controla o estoque de insumos?', options: [
        { label: 'Sem controle', score: 0 }, { label: 'Planilha', score: 1 },
        { label: 'Software', score: 2 }, { label: 'Automático / integrado', score: 3 },
    ]},
    { dimension: 'Insumos', text: 'Você consegue rastrear qual insumo foi usado em qual talhão?', options: [
        { label: 'Não', score: 0 }, { label: 'Parcialmente', score: 1 },
        { label: 'Sim, em planilha', score: 2 }, { label: 'Sim, em sistema', score: 3 },
    ]},
    { dimension: 'Planejamento', text: 'Você faz orçamento da safra antes de plantar?', options: [
        { label: 'Não', score: 0 }, { label: 'Estimativa mental', score: 1 },
        { label: 'Planilha simples', score: 2 }, { label: 'Orçamento detalhado', score: 3 },
    ]},
    { dimension: 'Planejamento', text: 'Você acompanha o custo real vs orçado durante a safra?', options: [
        { label: 'Não', score: 0 }, { label: 'Raramente', score: 1 },
        { label: 'Às vezes', score: 2 }, { label: 'Sempre', score: 3 },
    ]},
    { dimension: 'Máquinas', text: 'Você sabe o custo por hora de cada máquina?', options: [
        { label: 'Não', score: 0 }, { label: 'Aproximado', score: 1 },
        { label: 'Calculei uma vez', score: 2 }, { label: 'Atualizado sempre', score: 3 },
    ]},
    { dimension: 'Máquinas', text: 'Como você controla a manutenção das máquinas?', options: [
        { label: 'Sem controle', score: 0 }, { label: 'Pela memória', score: 1 },
        { label: 'Planilha', score: 2 }, { label: 'Sistema', score: 3 },
    ]},
    { dimension: 'Fiscal', text: 'Você emite NF-e como produtor rural?', options: [
        { label: 'Não emito', score: 0 }, { label: 'Emito com dificuldade', score: 1 },
        { label: 'Emito normalmente', score: 2 }, { label: 'Integrado ao sistema', score: 3 },
    ]},
    { dimension: 'Fiscal', text: 'Você conhece sua carga tributária real (Funrural, ITR, IR)?', options: [
        { label: 'Não sei', score: 0 }, { label: 'Sei aproximado', score: 1 },
        { label: 'Sei precisamente', score: 2 }, { label: 'Sei e otimizo', score: 3 },
    ]},
    { dimension: 'Tecnologia', text: 'Você utiliza algum software de gestão agrícola?', options: [
        { label: 'Não', score: 0 }, { label: 'Planilha avançada', score: 1 },
        { label: 'Software básico', score: 2 }, { label: 'Software completo', score: 3 },
    ]},
    { dimension: 'Tecnologia', text: 'Você toma decisões baseadas em dados históricos da fazenda?', options: [
        { label: 'Nunca', score: 0 }, { label: 'Raramente', score: 1 },
        { label: 'Às vezes', score: 2 }, { label: 'Sempre', score: 3 },
    ]},
]

export function getLevel(score: number): DiagnosticLevel {
    if (score <= 12) return { label: 'Iniciante', color: 'text-red-600' }
    if (score <= 24) return { label: 'Em desenvolvimento', color: 'text-yellow-600' }
    return { label: 'Avançado', color: 'text-green-600' }
}

export function calculateDiagnostics(answers: (number | null)[]): FarmDiagnosticsResult {
    const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0)
    const maxScore = QUESTIONS.length * 3

    const dimensionScores: DimensionScore[] = DIMENSIONS.map((dim) => {
        const qs = QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.dimension === dim)
        const score = qs.reduce((s, { i }) => s + (answers[i] ?? 0), 0)
        const max = qs.length * 3
        return { dim, score, max, pct: max > 0 ? (score / max) * 100 : 0 }
    })

    const weakest = [...dimensionScores].sort((a, b) => a.pct - b.pct).slice(0, 3)
    const level = getLevel(totalScore)

    return {
        totalScore,
        maxScore,
        totalPct: (totalScore / maxScore) * 100,
        level,
        dimensionScores,
        weakest,
    }
}

export function validateDiagnostics(answers: (number | null)[]): string | null {
    if (answers.length !== QUESTIONS.length) return `Responda todas as ${QUESTIONS.length} perguntas`
    const answered = answers.filter((a) => a !== null).length
    if (answered < QUESTIONS.length) return `Responda todas as ${QUESTIONS.length} perguntas (${answered}/${QUESTIONS.length} respondidas)`
    return null
}
