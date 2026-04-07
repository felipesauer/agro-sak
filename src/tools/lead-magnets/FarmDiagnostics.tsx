import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import AlertBanner from '../../components/ui/AlertBanner'

// ── Quiz structure ──

interface Question {
  dimension: string
  text: string
  options: { label: string; score: number }[]
}

const QUESTIONS: Question[] = [
  // 1. Controle Financeiro
  { dimension: 'Financeiro', text: 'Como você controla as despesas da fazenda?', options: [
    { label: 'Memória / não controla', score: 0 }, { label: 'Caderno', score: 1 },
    { label: 'Planilha Excel', score: 2 }, { label: 'Software específico', score: 3 },
  ]},
  { dimension: 'Financeiro', text: 'Com que frequência você sabe o custo por hectare da safra?', options: [
    { label: 'Nunca', score: 0 }, { label: 'Após a colheita', score: 1 },
    { label: 'Durante a safra', score: 2 }, { label: 'Em tempo real', score: 3 },
  ]},
  // 2. Gestão de Insumos
  { dimension: 'Insumos', text: 'Como você controla o estoque de insumos?', options: [
    { label: 'Sem controle', score: 0 }, { label: 'Planilha', score: 1 },
    { label: 'Software', score: 2 }, { label: 'Automático / integrado', score: 3 },
  ]},
  { dimension: 'Insumos', text: 'Você consegue rastrear qual insumo foi usado em qual talhão?', options: [
    { label: 'Não', score: 0 }, { label: 'Parcialmente', score: 1 },
    { label: 'Sim, em planilha', score: 2 }, { label: 'Sim, em sistema', score: 3 },
  ]},
  // 3. Planejamento de Safra
  { dimension: 'Planejamento', text: 'Você faz orçamento da safra antes de plantar?', options: [
    { label: 'Não', score: 0 }, { label: 'Estimativa mental', score: 1 },
    { label: 'Planilha simples', score: 2 }, { label: 'Orçamento detalhado', score: 3 },
  ]},
  { dimension: 'Planejamento', text: 'Você acompanha o custo real vs orçado durante a safra?', options: [
    { label: 'Não', score: 0 }, { label: 'Raramente', score: 1 },
    { label: 'Às vezes', score: 2 }, { label: 'Sempre', score: 3 },
  ]},
  // 4. Gestão de Máquinas
  { dimension: 'Máquinas', text: 'Você sabe o custo por hora de cada máquina?', options: [
    { label: 'Não', score: 0 }, { label: 'Aproximado', score: 1 },
    { label: 'Calculei uma vez', score: 2 }, { label: 'Atualizado sempre', score: 3 },
  ]},
  { dimension: 'Máquinas', text: 'Como você controla a manutenção das máquinas?', options: [
    { label: 'Sem controle', score: 0 }, { label: 'Pela memória', score: 1 },
    { label: 'Planilha', score: 2 }, { label: 'Sistema', score: 3 },
  ]},
  // 5. Fiscal e Tributário
  { dimension: 'Fiscal', text: 'Você emite NF-e como produtor rural?', options: [
    { label: 'Não emito', score: 0 }, { label: 'Emito com dificuldade', score: 1 },
    { label: 'Emito normalmente', score: 2 }, { label: 'Integrado ao sistema', score: 3 },
  ]},
  { dimension: 'Fiscal', text: 'Você conhece sua carga tributária real (Funrural, ITR, IR)?', options: [
    { label: 'Não sei', score: 0 }, { label: 'Sei aproximado', score: 1 },
    { label: 'Sei precisamente', score: 2 }, { label: 'Sei e otimizo', score: 3 },
  ]},
  // 6. Tecnologia e Dados
  { dimension: 'Tecnologia', text: 'Você utiliza algum software de gestão agrícola?', options: [
    { label: 'Não', score: 0 }, { label: 'Planilha avançada', score: 1 },
    { label: 'Software básico', score: 2 }, { label: 'Software completo', score: 3 },
  ]},
  { dimension: 'Tecnologia', text: 'Você toma decisões baseadas em dados históricos da fazenda?', options: [
    { label: 'Nunca', score: 0 }, { label: 'Raramente', score: 1 },
    { label: 'Às vezes', score: 2 }, { label: 'Sempre', score: 3 },
  ]},
]

const DIMENSIONS = ['Financeiro', 'Insumos', 'Planejamento', 'Máquinas', 'Fiscal', 'Tecnologia']

function getLevel(score: number): { label: string; color: string } {
  if (score <= 12) return { label: 'Iniciante', color: 'text-red-600' }
  if (score <= 24) return { label: 'Em desenvolvimento', color: 'text-yellow-600' }
  return { label: 'Avançado', color: 'text-green-600' }
}

// ── Component ──

export default function FarmDiagnostics() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null),
  )
  const [showResult, setShowResult] = useState(false)

  const answered = answers.filter((a) => a !== null).length
  const allAnswered = answered === QUESTIONS.length

  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0)
  const maxScore = QUESTIONS.length * 3

  // Per-dimension scores
  const dimensionScores = DIMENSIONS.map((dim) => {
    const qs = QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.dimension === dim)
    const score = qs.reduce((s, { i }) => s + (answers[i] ?? 0), 0)
    const max = qs.length * 3
    return { dim, score, max, pct: max > 0 ? (score / max) * 100 : 0 }
  })

  const weakest = [...dimensionScores].sort((a, b) => a.pct - b.pct).slice(0, 3)

  const level = getLevel(totalScore)

  return (
    <CalculatorLayout
      title="Diagnóstico de Gestão da Fazenda"
      description="Avalie o nível de maturidade da gestão da sua fazenda em 6 dimensões. 12 perguntas rápidas, resultado imediato."
      about="Faça um diagnóstico rápido da maturidade de gestão da sua fazenda. Responda 12 perguntas em 6 dimensões (financeiro, insumos, planejamento, máquinas, fiscal e tecnologia) e receba uma pontuação."
      methodology="Cada pergunta pontua de 0 a 3 (nunca, às vezes, quase sempre, sempre). Pontuação total: 0-36 pontos. Classificação: Iniciante (0-36%), Em desenvolvimento (36-72%), Avançado (72-100%)."
      result={
        showResult ? (
          <div className="space-y-6">
            {/* Overall score */}
            <div className="text-center">
              <p className="text-4xl font-bold text-agro-700">{totalScore}/{maxScore}</p>
              <p className={`text-lg font-semibold ${level.color}`}>{level.label}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-agro-500 h-3 rounded-full transition-all"
                  style={{ width: `${(totalScore / maxScore) * 100}%` }}
                />
              </div>
            </div>

            {/* Radar-like dimension bars */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Resultado por dimensão</h3>
              <div className="space-y-2">
                {dimensionScores.map((d) => (
                  <div key={d.dim} className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-right font-medium">{d.dim}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${
                          d.pct >= 66 ? 'bg-green-500' : d.pct >= 33 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right">{d.score}/{d.max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Recomendações</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                {weakest.map((w) => (
                  <li key={w.dim}>
                    <strong>{w.dim}</strong>: oportunidade de melhoria — sua nota foi {w.score}/{w.max}.
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowResult(false)
                setAnswers(new Array(QUESTIONS.length).fill(null))
              }}
              className="text-sm text-agro-600 hover:text-agro-800 font-medium"
            >
              Refazer diagnóstico
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {QUESTIONS.map((q, idx) => (
          <div key={q.text} className="space-y-2">
            <p className="text-sm font-medium">
              <span className="text-agro-600">{idx + 1}.</span> {q.text}
              <span className="ml-1 text-xs text-gray-400">({q.dimension})</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    const next = [...answers]
                    next[idx] = opt.score
                    setAnswers(next)
                  }}
                  className={`text-left text-sm px-3 py-2 rounded border transition-colors ${
                    answers[idx] === opt.score
                      ? 'border-agro-500 bg-agro-50 text-agro-800'
                      : 'border-gray-200 hover:border-agro-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => setShowResult(true)}
          className="px-6 py-2 rounded-lg text-white font-medium bg-agro-700 hover:bg-agro-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Ver resultado
        </button>
        <span className="text-sm text-gray-500">
          {answered}/{QUESTIONS.length} respondidas
        </span>
      </div>

      {!allAnswered && answered > 0 && (
        <AlertBanner
          variant="info"
          message={`Responda todas as ${QUESTIONS.length} perguntas para ver o resultado.`}
        />
      )}
    </CalculatorLayout>
  )
}
