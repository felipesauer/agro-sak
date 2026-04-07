import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatPercent } from '../../utils/formatters'
import { SOIL_ANALYSIS_RANGES, classifySoilNutrient } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  pH: string
  organicMatter: string
  P: string
  K: string
  Ca: string
  Mg: string
  hAl: string
  S: string
  B: string
  Cu: string
  Mn: string
  Zn: string
}

interface NutrientResult {
  name: string
  value: number
  unit: string
  label: string
  color: string
}

interface Result {
  nutrients: NutrientResult[]
  ctc: number
  baseSaturation: number
  alSaturation: number
  caMgRatio: number
  caKRatio: number
  mgKRatio: number
  warningCount: number
  criticalCount: number
}

// ── Constants ──

const NUTRIENT_DISPLAY: Record<string, string> = {
  pH: 'pH (CaCl₂)',
  organicMatter: 'Matéria Orgânica',
  P: 'Fósforo (P)',
  K: 'Potássio (K)',
  Ca: 'Cálcio (Ca)',
  Mg: 'Magnésio (Mg)',
  S: 'Enxofre (S)',
  B: 'Boro (B)',
  Cu: 'Cobre (Cu)',
  Mn: 'Manganês (Mn)',
  Zn: 'Zinco (Zn)',
}

const INITIAL: Inputs = {
  pH: '',
  organicMatter: '',
  P: '',
  K: '',
  Ca: '',
  Mg: '',
  hAl: '',
  S: '',
  B: '',
  Cu: '',
  Mn: '',
  Zn: '',
}

// ── Color helpers ──

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const nutrients: NutrientResult[] = []
  let warningCount = 0
  let criticalCount = 0

  for (const [key, displayName] of Object.entries(NUTRIENT_DISPLAY)) {
    const rawValue = inputs[key as keyof Inputs]
    if (!rawValue) continue
    const value = parseFloat(rawValue)
    if (isNaN(value)) continue

    const classification = classifySoilNutrient(key, value)
    if (!classification) continue

    const unit = SOIL_ANALYSIS_RANGES[key]?.unit ?? ''
    nutrients.push({ name: displayName, value, unit, label: classification.label, color: classification.color })

    if (classification.color === 'amber' || classification.color === 'yellow') warningCount++
    if (classification.color === 'red') criticalCount++
  }

  // CTC and derived values
  const Ca = parseFloat(inputs.Ca) || 0
  const Mg = parseFloat(inputs.Mg) || 0
  const K = parseFloat(inputs.K) || 0
  const hAl = parseFloat(inputs.hAl) || 0

  const sumBases = Ca + Mg + K
  const ctc = sumBases + hAl
  const baseSaturation = ctc > 0 ? (sumBases / ctc) * 100 : 0
  const alSaturation = ctc > 0 ? (hAl / ctc) * 100 : 0

  const caMgRatio = Mg > 0 ? Ca / Mg : 0
  const caKRatio = K > 0 ? Ca / K : 0
  const mgKRatio = K > 0 ? Mg / K : 0

  return {
    nutrients,
    ctc,
    baseSaturation,
    alSaturation,
    caMgRatio,
    caKRatio,
    mgKRatio,
    warningCount,
    criticalCount,
  }
}

function validate(inputs: Inputs): string | null {
  const filledCount = Object.values(inputs).filter(v => v !== '').length
  if (filledCount < 3) return 'Preencha pelo menos 3 parâmetros da análise de solo'
  for (const [key, value] of Object.entries(inputs)) {
    if (value === '') continue
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return `Valor inválido para ${NUTRIENT_DISPLAY[key] ?? key}`
  }
  return null
}

// ── Component ──

export default function SoilAnalysis() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  return (
    <CalculatorLayout
      title="Interpretação de Análise de Solo"
      description="Digite os valores do laudo de análise de solo e veja a classificação de cada nutriente com diagnóstico visual."
      result={
        result && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="CTC total"
                value={formatNumber(result.ctc, 1)}
                unit="mmolc/dm³"
                highlight
              />
              <ResultCard
                label="Saturação por bases (V%)"
                value={formatPercent(result.baseSaturation)}
                variant={result.baseSaturation >= 50 ? 'success' : 'warning'}
              />
              <ResultCard
                label="Sat. por alumínio (m%)"
                value={formatPercent(result.alSaturation)}
                variant={result.alSaturation > 20 ? 'danger' : 'default'}
              />
            </div>

            {/* Cation ratios */}
            {(result.caMgRatio > 0 || result.caKRatio > 0) && (
              <div className="grid gap-3 sm:grid-cols-3">
                <ResultCard
                  label="Relação Ca/Mg"
                  value={formatNumber(result.caMgRatio, 1)}
                  variant={result.caMgRatio >= 2 && result.caMgRatio <= 5 ? 'default' : 'warning'}
                >
                  <p className="text-xs text-gray-500 mt-1">Ideal: 2 a 5</p>
                </ResultCard>
                <ResultCard
                  label="Relação Ca/K"
                  value={formatNumber(result.caKRatio, 1)}
                  variant={result.caKRatio >= 10 && result.caKRatio <= 30 ? 'default' : 'warning'}
                >
                  <p className="text-xs text-gray-500 mt-1">Ideal: 10 a 30</p>
                </ResultCard>
                <ResultCard
                  label="Relação Mg/K"
                  value={formatNumber(result.mgKRatio, 1)}
                  variant={result.mgKRatio >= 3 && result.mgKRatio <= 10 ? 'default' : 'warning'}
                >
                  <p className="text-xs text-gray-500 mt-1">Ideal: 3 a 10</p>
                </ResultCard>
              </div>
            )}

            {/* Nutrient classification */}
            {result.nutrients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">Classificação dos nutrientes</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.nutrients.map((n) => {
                    const colors = COLOR_MAP[n.color] ?? COLOR_MAP.emerald
                    return (
                      <div key={n.name} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{n.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(n.value, n.unit === '' ? 1 : 2)} {n.unit}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {n.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {result.criticalCount > 0 && (
              <AlertBanner
                variant="error"
                title={`${result.criticalCount} nutriente(s) em nível crítico`}
                message="Nutrientes classificados como 'Muito baixo' ou 'Baixo' precisam de correção antes do plantio. Consulte um agrônomo para definir as doses."
              />
            )}

            {result.baseSaturation < 50 && (
              <AlertBanner
                variant="warning"
                title="V% abaixo do ideal"
                message={`A saturação por bases de ${formatPercent(result.baseSaturation)} indica necessidade de calagem. Use a ferramenta de Calagem para calcular a dose de calcário.`}
              />
            )}

            {result.alSaturation > 30 && (
              <AlertBanner
                variant="error"
                title="Saturação por alumínio elevada"
                message={`A saturação por alumínio de ${formatPercent(result.alSaturation)} indica toxidez para a maioria das culturas. Faça calagem e considere gessagem.`}
              />
            )}

            {result.criticalCount === 0 && result.warningCount === 0 && result.nutrients.length > 0 && (
              <AlertBanner
                variant="success"
                title="Solo em boas condições"
                message="Todos os nutrientes analisados estão em níveis adequados ou altos. Mantenha o monitoramento com análises periódicas."
              />
            )}
          </div>
        )
      }
      about="A interpretação da análise de solo é o primeiro passo para definir a estratégia de correção e adubação da lavoura. Com base nos valores do laudo do laboratório, classificamos cada nutriente em faixas (muito baixo, baixo, médio, adequado, alto) e calculamos indicadores como CTC, V% e relações entre cátions."
      methodology="Classificação baseada nos critérios da IAC (Boletim 100 — Raij et al.) e EMBRAPA Cerrados. CTC = Ca + Mg + K + H+Al. V% = (Ca + Mg + K) / CTC × 100. m% = H+Al / CTC × 100. Relações catiônicas segundo padrões regionais do Cerrado e Sul do Brasil."
    >
      <h3 className="text-sm font-semibold text-gray-700 mt-2">Macronutrientes e pH</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="pH (CaCl₂)"
          value={inputs.pH}
          onChange={(v) => updateInput('pH', v as never)}
          placeholder="ex: 5.2"
          min="0"
          max="14"
          step="0.1"
        />
        <InputField
          label="Matéria Orgânica"
          unit="g/dm³"
          value={inputs.organicMatter}
          onChange={(v) => updateInput('organicMatter', v as never)}
          placeholder="ex: 28"
          min="0"
          max="200"
        />
        <InputField
          label="Fósforo (P resina)"
          unit="mg/dm³"
          value={inputs.P}
          onChange={(v) => updateInput('P', v as never)}
          placeholder="ex: 15"
          min="0"
          max="500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <InputField
          label="Potássio (K)"
          unit="mmolc/dm³"
          value={inputs.K}
          onChange={(v) => updateInput('K', v as never)}
          placeholder="ex: 2.5"
          min="0"
          max="50"
          step="0.1"
        />
        <InputField
          label="Cálcio (Ca)"
          unit="mmolc/dm³"
          value={inputs.Ca}
          onChange={(v) => updateInput('Ca', v as never)}
          placeholder="ex: 30"
          min="0"
          max="200"
        />
        <InputField
          label="Magnésio (Mg)"
          unit="mmolc/dm³"
          value={inputs.Mg}
          onChange={(v) => updateInput('Mg', v as never)}
          placeholder="ex: 10"
          min="0"
          max="100"
        />
        <InputField
          label="H+Al (Acidez)"
          unit="mmolc/dm³"
          value={inputs.hAl}
          onChange={(v) => updateInput('hAl', v as never)}
          placeholder="ex: 38"
          hint="Necessário para V% e CTC"
          min="0"
          max="300"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mt-4">Enxofre e Micronutrientes (opcional)</h3>
      <div className="grid gap-4 sm:grid-cols-5">
        <InputField
          label="Enxofre (S)"
          unit="mg/dm³"
          value={inputs.S}
          onChange={(v) => updateInput('S', v as never)}
          placeholder="ex: 8"
          min="0"
          max="200"
        />
        <InputField
          label="Boro (B)"
          unit="mg/dm³"
          value={inputs.B}
          onChange={(v) => updateInput('B', v as never)}
          placeholder="ex: 0.4"
          min="0"
          max="10"
          step="0.1"
        />
        <InputField
          label="Cobre (Cu)"
          unit="mg/dm³"
          value={inputs.Cu}
          onChange={(v) => updateInput('Cu', v as never)}
          placeholder="ex: 1.0"
          min="0"
          max="50"
          step="0.1"
        />
        <InputField
          label="Manganês (Mn)"
          unit="mg/dm³"
          value={inputs.Mn}
          onChange={(v) => updateInput('Mn', v as never)}
          placeholder="ex: 5.0"
          min="0"
          max="100"
        />
        <InputField
          label="Zinco (Zn)"
          unit="mg/dm³"
          value={inputs.Zn}
          onChange={(v) => updateInput('Zn', v as never)}
          placeholder="ex: 1.5"
          min="0"
          max="50"
          step="0.1"
        />
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
