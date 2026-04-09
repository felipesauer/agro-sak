import useCalculator from '../../hooks/useCalculator'
import { calculateSoilAnalysis, validateSoilAnalysis, type SoilAnalysisResult } from '../../core/agronomic/soil-analysis'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatPercent } from '../../utils/formatters'
import { classifySoilNutrient } from '../../data/reference-data'

const EXTRACTION_OPTIONS = [
  { value: 'resin', label: 'Resina (IAC — SP)' },
  { value: 'mehlich1', label: 'Mehlich-1 (Cerrado/Sul)' },
  { value: 'dtpa', label: 'DTPA (micronutrientes)' },
]

// ── Types ──

interface Inputs {
  extractionMethod: string
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

// ── Constants ──

const INITIAL: Inputs = {
  extractionMethod: 'resin',
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

function buildInput(inputs: Inputs) {
  const parse = (v: string) => { const n = parseFloat(v); return isNaN(n) ? undefined : n }
  return {
    pH: parse(inputs.pH),
    organicMatter: parse(inputs.organicMatter),
    P: parse(inputs.P),
    K: parse(inputs.K),
    Ca: parse(inputs.Ca),
    Mg: parse(inputs.Mg),
    hAl: parse(inputs.hAl),
    S: parse(inputs.S),
    B: parse(inputs.B),
    Cu: parse(inputs.Cu),
    Mn: parse(inputs.Mn),
    Zn: parse(inputs.Zn),
  }
}

function calculate(inputs: Inputs): SoilAnalysisResult | null {
  return calculateSoilAnalysis(buildInput(inputs), classifySoilNutrient)
}

function validate(inputs: Inputs): string | null {
  return validateSoilAnalysis(buildInput(inputs))
}

// ── Component ──

export default function SoilAnalysis() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, SoilAnalysisResult>({
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
      methodology="Classificação baseada nos critérios da IAC (Boletim 100 — Raij et al.) e EMBRAPA Cerrados. CTC = Ca + Mg + K + H+Al. V% = (Ca + Mg + K) / CTC × 100. m% = H+Al / CTC × 100. Relações catiônicas segundo padrões regionais do Cerrado e Sul do Brasil. Faixas assumem extração por Resina (SP/IAC) ou Mehlich-1 (Cerrado) — valores de referência podem variar conforme o método do seu laboratório."
    >
      <SelectField
        label="Método de extração do laudo"
        options={EXTRACTION_OPTIONS}
        value={inputs.extractionMethod}
        onChange={(v) => updateInput('extractionMethod', v as never)}
      />

      {inputs.extractionMethod !== 'resin' && (
        <AlertBanner
          variant="warning"
          message="As faixas de classificação são calibradas para extração por Resina (IAC — Boletim 100). Laudos com Mehlich-1 podem ter valores de referência diferentes, especialmente para fósforo."
        />
      )}

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
          hint="Valor do laudo de solo"
        />
        <InputField
          label="Matéria Orgânica"
          unit="g/dm³"
          value={inputs.organicMatter}
          onChange={(v) => updateInput('organicMatter', v as never)}
          placeholder="ex: 28"
          min="0"
          max="200"
          hint="Informar em g/dm³ conforme laudo"
        />
        <InputField
          label="Fósforo (P resina)"
          unit="mg/dm³"
          value={inputs.P}
          onChange={(v) => updateInput('P', v as never)}
          placeholder="ex: 15"
          min="0"
          max="500"
          hint="P extraído por resina trocadora"
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
          hint="Valor em mmolc/dm³ do laudo"
        />
        <InputField
          label="Cálcio (Ca)"
          unit="mmolc/dm³"
          value={inputs.Ca}
          onChange={(v) => updateInput('Ca', v as never)}
          placeholder="ex: 30"
          min="0"
          max="200"
          hint="Valor em mmolc/dm³ do laudo"
        />
        <InputField
          label="Magnésio (Mg)"
          unit="mmolc/dm³"
          value={inputs.Mg}
          onChange={(v) => updateInput('Mg', v as never)}
          placeholder="ex: 10"
          min="0"
          max="100"
          hint="Valor em mmolc/dm³ do laudo"
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
          hint="Se disponível no laudo"
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
          hint="Se disponível no laudo"
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
          hint="Se disponível no laudo"
        />
        <InputField
          label="Manganês (Mn)"
          unit="mg/dm³"
          value={inputs.Mn}
          onChange={(v) => updateInput('Mn', v as never)}
          placeholder="ex: 5.0"
          min="0"
          max="100"
          hint="Se disponível no laudo"
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
          hint="Se disponível no laudo"
        />
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={Object.values(inputs).filter(v => v !== '').length < 3} />
    </CalculatorLayout>
  )
}
