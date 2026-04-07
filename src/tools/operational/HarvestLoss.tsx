import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  crop: string
  expectedYield: string
  preHarvestGrains: string
  platformGrains: string
  threshingGrains: string
  sacPrice: string
  area: string
  customGrainsFactor: string
}

interface LossDetail {
  label: string
  scHa: number
  costHa: number
}

interface Result {
  losses: LossDetail[]
  totalScHa: number
  totalCostHa: number
  totalCostArea: number | null
  percentLoss: number
  severity: 'success' | 'warning' | 'error'
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'wheat', label: 'Trigo' },
  { value: 'rice', label: 'Arroz' },
  { value: 'bean', label: 'Feijão' },
  { value: 'custom', label: '✦ Personalizado' },
]

// Grãos/m² por sc/ha — soja: 16, milho: 8, trigo: 20, arroz: 14, feijão: 12
const GRAINS_PER_SC: Record<string, number> = {
  soybean: 16,
  corn: 8,
  wheat: 20,
  rice: 14,
  bean: 12,
}

const INITIAL: Inputs = {
  crop: 'soybean',
  expectedYield: '65',
  preHarvestGrains: '4',
  platformGrains: '8',
  threshingGrains: '6',
  sacPrice: '115',
  area: '',
  customGrainsFactor: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const grainsFactor = inputs.crop === 'custom'
    ? (parseFloat(inputs.customGrainsFactor) || 16)
    : (GRAINS_PER_SC[inputs.crop] ?? 16)
  const price = parseFloat(inputs.sacPrice)
  const expectedYield = parseFloat(inputs.expectedYield)
  const area = parseFloat(inputs.area) || 0

  const stages = [
    { label: 'Pré-colheita (debulha natural)', grains: parseFloat(inputs.preHarvestGrains) },
    { label: 'Plataforma de corte', grains: parseFloat(inputs.platformGrains) },
    { label: 'Trilha e separação', grains: parseFloat(inputs.threshingGrains) },
  ]

  const losses: LossDetail[] = stages.map((s) => {
    const scHa = s.grains / grainsFactor
    return { label: s.label, scHa, costHa: scHa * price }
  })

  const totalScHa = losses.reduce((sum, l) => sum + l.scHa, 0)
  const totalCostHa = totalScHa * price
  const totalCostArea = area > 0 ? totalCostHa * area : null
  const percentLoss = expectedYield > 0 ? (totalScHa / expectedYield) * 100 : 0

  let severity: 'success' | 'warning' | 'error' = 'success'
  if (totalScHa > 2) severity = 'error'
  else if (totalScHa > 1) severity = 'warning'

  return { losses, totalScHa, totalCostHa, totalCostArea, percentLoss, severity }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.expectedYield) return 'Informe a produtividade esperada'
  if (!inputs.preHarvestGrains) return 'Informe os grãos/m² — pré-colheita'
  if (!inputs.platformGrains) return 'Informe os grãos/m² — plataforma'
  if (!inputs.threshingGrains) return 'Informe os grãos/m² — trilha'
  if (!inputs.sacPrice) return 'Informe o preço da saca'
  return null
}

// ── Recommendations ──

function getRecommendation(result: Result): string[] {
  const tips: string[] = []
  const [preHarvest, platform, threshing] = result.losses
  if (preHarvest.scHa > 0.5)
    tips.push('Alta perda pré-colheita: avalie janela de colheita e maturação.')
  if (platform.scHa > 0.5)
    tips.push('Alta perda na plataforma: verifique velocidade, altura do molinete e navalhas.')
  if (threshing.scHa > 0.5)
    tips.push('Alta perda no sistema de trilha: regulagem de côncavo, cilindro e peneiras.')
  if (tips.length === 0)
    tips.push('Perdas dentro do aceitável. Continue monitorando ao longo da colheita.')
  return tips
}

// ── Component ──

export default function HarvestLoss() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Perdas na Colheita"
      description="Quantifique as perdas de grãos por etapa da colheita e o prejuízo financeiro."
      about="Quantifique as perdas de grãos durante a colheita mecânica. Cada grão no chão significa sacas a menos no silo. Identifique se as perdas estão na plataforma, nos mecanismos internos ou na distribuição."
      methodology="Soja: 1 grão/m² ≈ 1 saca/ha de perda. Milho: 1 grão/m² ≈ 0.15 sc/ha. O tolerável é até 1 sc/ha para soja e 1.5 sc/ha para milho."
      result={
        result && (
          <div className="space-y-4">
            {/* Per-stage breakdown */}
            <div className="grid gap-3 sm:grid-cols-3">
              {result.losses.map((l) => (
                <ResultCard
                  key={l.label}
                  label={l.label}
                  value={formatNumber(l.scHa, 2)}
                  unit="sc/ha"
                  variant="warning"
                >
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(l.costHa)}/ha</p>
                </ResultCard>
              ))}
            </div>

            {/* Totals */}
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Perda total"
                value={formatNumber(result.totalScHa, 2)}
                unit="sc/ha"
                highlight
                variant="danger"
              >
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(result.totalCostHa)}/ha — {formatNumber(result.percentLoss, 1)}% da produtividade
                </p>
              </ResultCard>
              {result.totalCostArea !== null && (
                <ResultCard
                  label="Prejuízo total na área"
                  value={formatCurrency(result.totalCostArea, 0)}
                  unit=""
                  highlight
                  variant="danger"
                />
              )}
            </div>

            {/* Severity indicator */}
            <AlertBanner
              variant={result.severity}
              message={
                result.severity === 'success'
                  ? `Perda ≤ 1 sc/ha — dentro da tolerância recomendada.`
                  : result.severity === 'warning'
                    ? `Perda entre 1 e 2 sc/ha — atenção, acima do ideal.`
                    : `Perda > 2 sc/ha — necessário regulagem urgente da colheitadeira.`
              }
            />

            {/* Recommendations */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Recomendações</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {getRecommendation(result).map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={inputs.crop}
        onChange={(v) => updateInput('crop', v)}
      />

      {inputs.crop === 'custom' && (
        <InputField
          label="Grãos/m² por sc/ha"
          value={inputs.customGrainsFactor}
          onChange={(v) => updateInput('customGrainsFactor', v)}
          placeholder="ex: 16"
          hint="Soja≈16, Milho≈8, Trigo≈20, Arroz≈14, Feijão≈12"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Produtividade esperada"
          unit="sc/ha"
          value={inputs.expectedYield}
          onChange={(v) => updateInput('expectedYield', v)}
          placeholder="ex: 65"
          required
        />
        <InputField
          label="Preço da saca"
          prefix="R$" unit="R$"
          value={inputs.sacPrice}
          onChange={(v) => updateInput('sacPrice', v)}
          placeholder="ex: 115"
          step="0.01"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Grãos — Pré-colheita"
          unit="grãos/m²"
          value={inputs.preHarvestGrains}
          onChange={(v) => updateInput('preHarvestGrains', v)}
          placeholder="ex: 4"
          required
        />
        <InputField
          label="Grãos — Plataforma"
          unit="grãos/m²"
          value={inputs.platformGrains}
          onChange={(v) => updateInput('platformGrains', v)}
          placeholder="ex: 8"
          required
        />
        <InputField
          label="Grãos — Trilha"
          unit="grãos/m²"
          value={inputs.threshingGrains}
          onChange={(v) => updateInput('threshingGrains', v)}
          placeholder="ex: 6"
          required
        />
      </div>

      <InputField
        label="Área total"
        unit="ha"
        value={inputs.area}
        onChange={(v) => updateInput('area', v)}
        placeholder="ex: 500 (opcional)"
        hint="Opcional — para calcular o prejuízo total na fazenda"
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
