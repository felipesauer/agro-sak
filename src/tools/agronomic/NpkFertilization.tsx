import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber } from '../../utils/formatters'

// ── Reference tables (simplified EMBRAPA/Cerrado) ──

const P_CLASSES: Record<string, { limits: number[]; labels: string[] }> = {
  clay: { limits: [3, 6, 9, 18], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
  medium: { limits: [6, 12, 18, 36], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
  sandy: { limits: [10, 20, 30, 60], labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] },
}

const K_CLASSES = {
  limits: [25, 50, 80, 120],
  labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'],
}

// Simplified P₂O₅ recommendation (kg/ha) by level for general crops
const P_REC: Record<string, number[]> = {
  soybean: [120, 90, 60, 30, 0],
  corn:    [140, 100, 70, 40, 0],
  cotton:  [140, 110, 80, 40, 0],
  bean:    [120, 90, 60, 30, 0],
}

// Simplified K₂O recommendation (kg/ha) by level
const K_REC: Record<string, number[]> = {
  soybean: [120, 90, 60, 30, 0],
  corn:    [120, 80, 60, 30, 0],
  cotton:  [140, 100, 70, 40, 0],
  bean:    [100, 70, 50, 30, 0],
}

// N recommendation (kg/ha)
const N_REC: Record<string, { inoculated: number; notInoculated: number }> = {
  soybean: { inoculated: 0, notInoculated: 20 },
  corn:    { inoculated: 120, notInoculated: 140 },
  cotton:  { inoculated: 120, notInoculated: 120 },
  bean:    { inoculated: 60, notInoculated: 80 },
}

// Formulas NPK comerciais comuns
const NPK_FORMULAS = [
  { formula: '02-20-18', n: 2, p: 20, k: 18, total: 40 },
  { formula: '04-14-08', n: 4, p: 14, k: 8, total: 26 },
  { formula: '04-30-10', n: 4, p: 30, k: 10, total: 44 },
  { formula: '05-25-15', n: 5, p: 25, k: 15, total: 45 },
  { formula: '08-28-16', n: 8, p: 28, k: 16, total: 52 },
  { formula: '10-10-10', n: 10, p: 10, k: 10, total: 30 },
  { formula: '20-00-20', n: 20, p: 0, k: 20, total: 40 },
  { formula: '20-05-20', n: 20, p: 5, k: 20, total: 45 },
  { formula: '00-20-20', n: 0, p: 20, k: 20, total: 40 },
]

function classifyLevel(value: number, limits: number[]): number {
  for (let i = 0; i < limits.length; i++) {
    if (value < limits[i]) return i
  }
  return limits.length - 1
}

// ── Types ──

interface Inputs {
  crop: string
  texture: string
  pSoil: string
  kSoil: string
  organicMatter: string
  inoculated: string
  customN: string
  customP: string
  customK: string
}

interface Result {
  nRec: number
  pRec: number
  kRec: number
  pLevel: string
  kLevel: string
  formulas: { formula: string; kgPerHa: number; bagsPerHa: number; nSupplied: number; pSupplied: number; kSupplied: number }[]
}

const INITIAL: Inputs = {
  crop: 'soybean',
  texture: 'clay',
  pSoil: '',
  kSoil: '',
  organicMatter: '',
  inoculated: 'yes',
  customN: '',
  customP: '',
  customK: '',
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'bean', label: 'Feijão' },
  { value: 'custom', label: '✦ Personalizado' },
]

const TEXTURE_OPTIONS = [
  { value: 'sandy', label: 'Arenoso (<15% argila)' },
  { value: 'medium', label: 'Médio (15–35% argila)' },
  { value: 'clay', label: 'Argiloso (>35% argila)' },
]

const INOC_OPTIONS = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
]

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  let nRec: number, pRec: number, kRec: number, pLevel: string, kLevel: string

  if (inputs.crop === 'custom') {
    nRec = parseFloat(inputs.customN) || 0
    pRec = parseFloat(inputs.customP) || 0
    kRec = parseFloat(inputs.customK) || 0
    pLevel = 'Personalizado'
    kLevel = 'Personalizado'
  } else {
    const p = parseFloat(inputs.pSoil)
    const k = parseFloat(inputs.kSoil)

    const pClasses = P_CLASSES[inputs.texture] ?? P_CLASSES.clay
    const pLevelIdx = classifyLevel(p, pClasses.limits)
    const kLevelIdx = classifyLevel(k, K_CLASSES.limits)

    pLevel = pClasses.labels[pLevelIdx]
    kLevel = K_CLASSES.labels[kLevelIdx]

    const nRef = N_REC[inputs.crop] ?? N_REC.soybean
    nRec = inputs.inoculated === 'yes' ? nRef.inoculated : nRef.notInoculated

    const pRecTable = P_REC[inputs.crop] ?? P_REC.soybean
    const kRecTable = K_REC[inputs.crop] ?? K_REC.soybean
    pRec = pRecTable[pLevelIdx] ?? 0
    kRec = kRecTable[kLevelIdx] ?? 0
  }

  // Find best 3 formulas
  const scored = NPK_FORMULAS
    .filter((f) => {
      // at least one needed nutrient should be present in the formula
      if (nRec > 0 && pRec > 0 && kRec > 0) return true
      if (pRec > 0 && f.p > 0) return true
      if (kRec > 0 && f.k > 0) return true
      if (nRec > 0 && f.n > 0) return true
      return false
    })
    .map((f) => {
      // Target kg/ha to roughly meet P requirement (often the driver for base fertilization)
      const kgByP = pRec > 0 && f.p > 0 ? (pRec / (f.p / 100)) : Infinity
      const kgByK = kRec > 0 && f.k > 0 ? (kRec / (f.k / 100)) : Infinity
      const kgPerHa = Math.min(
        Math.max(kgByP, kgByK) > 2000 ? 400 : Math.round(Math.min(kgByP, kgByK)),
        2000,
      )

      const nSupplied = kgPerHa * (f.n / 100)
      const pSupplied = kgPerHa * (f.p / 100)
      const kSupplied = kgPerHa * (f.k / 100)

      const pError = Math.abs(pSupplied - pRec)
      const kError = Math.abs(kSupplied - kRec)
      const score = pError + kError

      return {
        formula: f.formula,
        kgPerHa,
        bagsPerHa: kgPerHa / 50,
        nSupplied,
        pSupplied,
        kSupplied,
        score,
      }
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  return {
    nRec,
    pRec,
    kRec,
    pLevel,
    kLevel,
    formulas: scored,
  }
}

function validate(inputs: Inputs): string | null {
  if (inputs.crop === 'custom') {
    if (!inputs.customP && !inputs.customK && !inputs.customN) return 'Informe ao menos um nutriente alvo'
    return null
  }
  if (!inputs.pSoil) return 'Informe o fósforo (P) do laudo'
  if (!inputs.kSoil) return 'Informe o potássio (K) do laudo'
  return null
}

// ── Component ──

export default function NpkFertilization() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Adubação NPK"
      description="Recomendação de N, P₂O₅ e K₂O com base no laudo de solo e cultura. Simplificado a partir de tabelas EMBRAPA/Cerrado."
      about="A adubação NPK repõe os nutrientes essenciais do solo — nitrogênio (N), fósforo (P₂O₅) e potássio (K₂O) — de acordo com a demanda da cultura e a disponibilidade no solo. A recomendação é baseada na classificação dos teores de P e K do laudo de análise de solo em faixas (muito baixo a muito alto)."
      methodology="Classificação de P por textura do solo e K por faixas universais (EMBRAPA Cerrados). Dose de N conforme cultura e inoculação. Formulações comerciais sugeridas por otimização de atendimento à demanda de P₂O₅ e K₂O. Fontes: Boletim Técnico EMBRAPA Cerrados, CFSEMG."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard label="Nitrogênio (N)" value={formatNumber(result.nRec, 0)} unit="kg/ha" variant="default" />
              <ResultCard label="Fósforo (P₂O₅)" value={formatNumber(result.pRec, 0)} unit="kg/ha" highlight variant="default" />
              <ResultCard label="Potássio (K₂O)" value={formatNumber(result.kRec, 0)} unit="kg/ha" highlight variant="default" />
            </div>

            <div className="flex gap-4 text-sm">
              <span>P no solo: <strong className="text-agro-700">{result.pLevel}</strong></span>
              <span>K no solo: <strong className="text-agro-700">{result.kLevel}</strong></span>
            </div>

            {result.formulas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Formulações sugeridas</h3>
                <ComparisonTable
                  columns={[
                    { key: 'formula', label: 'Fórmula' },
                    { key: 'kgPerHa', label: 'kg/ha', format: (v) => formatNumber(v as number, 0) },
                    { key: 'bagsPerHa', label: 'sc 50kg/ha', format: (v) => formatNumber(v as number, 1) },
                    { key: 'nSupplied', label: 'N (kg)', format: (v) => formatNumber(v as number, 0) },
                    { key: 'pSupplied', label: 'P₂O₅ (kg)', format: (v) => formatNumber(v as number, 0) },
                    { key: 'kSupplied', label: 'K₂O (kg)', format: (v) => formatNumber(v as number, 0) },
                  ]}
                  rows={result.formulas}
                  highlightIndex={0}
                  rowKey="formula"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A primeira formulação é a melhor aproximação. Ajustes finos devem ser feitos por um agrônomo.
                </p>
              </div>
            )}

            {result.nRec === 0 && inputs.crop === 'soybean' && (
              <AlertBanner
                variant="info"
                message="Soja com inoculação de Bradyrhizobium não necessita adubação nitrogenada de base."
              />
            )}
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={(v) => updateInput('crop', v as never)}
        />
        {inputs.crop !== 'custom' && (
          <SelectField
            label="Textura do solo"
            options={TEXTURE_OPTIONS}
            value={inputs.texture}
            onChange={(v) => updateInput('texture', v as never)}
          />
        )}
      </div>

      {inputs.crop === 'custom' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="N alvo"
            unit="kg/ha"
            value={inputs.customN}
            onChange={(v) => updateInput('customN', v as never)}
            placeholder="ex: 120"
            min="0"
            hint="Dose desejada de nitrogênio"
          />
          <InputField
            label="P₂O₅ alvo"
            unit="kg/ha"
            value={inputs.customP}
            onChange={(v) => updateInput('customP', v as never)}
            placeholder="ex: 90"
            min="0"
            hint="Dose desejada de fósforo"
          />
          <InputField
            label="K₂O alvo"
            unit="kg/ha"
            value={inputs.customK}
            onChange={(v) => updateInput('customK', v as never)}
            placeholder="ex: 60"
            min="0"
            hint="Dose desejada de potássio"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Fósforo no solo (P Mehlich)"
          unit="mg/dm³"
          value={inputs.pSoil}
          onChange={(v) => updateInput('pSoil', v as never)}
          placeholder="ex: 12"
          hint="Resultado do laudo de solo"
          min="0"
          step="0.1"
          required
        />
        <InputField
          label="Potássio no solo (K)"
          unit="mg/dm³"
          value={inputs.kSoil}
          onChange={(v) => updateInput('kSoil', v as never)}
          placeholder="ex: 90"
          hint="Resultado do laudo de solo"
          min="0"
          step="0.1"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Matéria orgânica (opcional)"
          unit="%"
          value={inputs.organicMatter}
          onChange={(v) => updateInput('organicMatter', v as never)}
          placeholder="ex: 2.5"
          min="0"
          max="15"
          step="0.1"
          hint="Dados do laudo de solo"
        />
        {(inputs.crop === 'soybean' || inputs.crop === 'bean') && (
          <SelectField
            label="Vai inocular com rizóbio?"
            options={INOC_OPTIONS}
            value={inputs.inoculated}
            onChange={(v) => updateInput('inoculated', v as never)}
          />
        )}
      </div>
        </>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={inputs.crop !== 'custom' ? (!inputs.pSoil || !inputs.kSoil) : (!inputs.customN && !inputs.customP && !inputs.customK)} />
    </CalculatorLayout>
  )
}
