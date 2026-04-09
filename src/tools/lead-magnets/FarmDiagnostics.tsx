import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import AlertBanner from '../../components/ui/AlertBanner'
import {
  QUESTIONS,
  calculateDiagnostics,
} from '../../core/utilities/farm-diagnostics'

// ── Component ──

export default function FarmDiagnostics() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null),
  )
  const [showResult, setShowResult] = useState(false)

  const answered = answers.filter((a) => a !== null).length
  const allAnswered = answered === QUESTIONS.length

  const result = calculateDiagnostics(answers)
  const { totalScore, maxScore, level, dimensionScores, weakest } = result

  return (
    <CalculatorLayout
      title="Diagnóstico de Gestão da Fazenda"
      description="Avalie o nível de maturidade da gestão da sua fazenda em 6 dimensões. 12 perguntas rápidas, resultado imediato."
      about="Faça um diagnóstico rápido da maturidade de gestão da sua fazenda. Responda 12 perguntas em 6 dimensões (financeiro, insumos, planejamento, máquinas, fiscal e tecnologia) e receba uma pontuação."
      methodology="Cada pergunta pontua de 0 a 3 (nunca, às vezes, quase sempre, sempre). Pontuação total: 0-36 pontos. Classificação: Iniciante (0-33%), Em desenvolvimento (34-67%), Avançado (68-100%)."
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
