import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { BASE_SATURATION_TARGETS, cropOptionsFrom } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  method: string
  crop: string
  ctc: string
  v1: string
  v2: string
  prnt: string
  depth: string
  limePrice: string
}

interface Result {
  nc: number
  ncAdjusted: number
  costPerHa: number | null
  needsSplitting: boolean
}

const INITIAL: Inputs = {
  method: 'base-saturation',
  crop: 'soybean',
  ctc: '',
  v1: '',
  v2: '60',
  prnt: '80',
  depth: '20',
  limePrice: '',
}

const CROP_OPTIONS = [
  ...cropOptionsFrom(BASE_SATURATION_TARGETS),
  { value: 'custom', label: '✦ Personalizado' },
]

const METHOD_OPTIONS = [
  { value: 'base-saturation', label: 'Saturação por Bases (V%)' },
]

const DEPTH_OPTIONS = [
  { value: '20', label: '0–20 cm' },
  { value: '40', label: '0–40 cm' },
]

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const ctc = parseFloat(inputs.ctc)
  const v1 = parseFloat(inputs.v1)
  const v2 = parseFloat(inputs.v2)
  const prnt = parseFloat(inputs.prnt)
  const depth = parseFloat(inputs.depth)
  const price = parseFloat(inputs.limePrice) || 0

  // Base saturation method: NC = (V2 - V1) × CTC / (10 × PRNT/100)
  const nc = ((v2 - v1) * ctc) / (10 * (prnt / 100))
  const depthFactor = depth === 40 ? 2 : 1
  const ncAdjusted = Math.max(0, nc * depthFactor)
  const needsSplitting = ncAdjusted > 5
  const costPerHa = price > 0 ? ncAdjusted * price : null

  return { nc: Math.max(0, nc), ncAdjusted, costPerHa, needsSplitting }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.ctc) return 'Informe a CTC a pH 7'
  if (!inputs.v1) return 'Informe a saturação por bases atual (V%)'
  if (!inputs.v2) return 'Informe a saturação por bases desejada'
  if (!inputs.prnt) return 'Informe o PRNT do calcário'
  const prnt = parseFloat(inputs.prnt)
  if (prnt < 50 || prnt > 100) return 'PRNT deve estar entre 50% e 100%'
  const v1 = parseFloat(inputs.v1)
  const v2 = parseFloat(inputs.v2)
  if (v1 >= v2) return 'V% desejada deve ser maior que a atual'
  return null
}

// ── Component ──

export default function LimingCalculator() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const handleCropChange = (value: string) => {
    updateInput('crop', value as never)
    if (value !== 'custom') {
      const target = BASE_SATURATION_TARGETS[value]
      if (target) {
        updateInput('v2', String(target.min) as never)
      }
    }
  }

  const currentTarget = inputs.crop !== 'custom' ? BASE_SATURATION_TARGETS[inputs.crop] : null
  const lowPrnt = parseFloat(inputs.prnt) < 70 && parseFloat(inputs.prnt) > 0

  return (
    <CalculatorLayout
      title="Calagem — Correção de Solo"
      description="Calcule a necessidade de calcário (t/ha) pelo método da saturação por bases."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Necessidade de calcário"
              value={formatNumber(result.ncAdjusted, 2)}
              unit="t/ha"
              highlight
              variant="default"
            >
              {result.ncAdjusted !== result.nc && (
                <p className="text-xs text-gray-500 mt-1">
                  NC base (0–20 cm): {formatNumber(result.nc, 2)} t/ha — ajustado para profundidade 0–40 cm (×2)
                </p>
              )}
            </ResultCard>

            {result.costPerHa !== null && (
              <ResultCard
                label="Custo estimado"
                value={formatCurrency(result.costPerHa)}
                unit="R$/ha"
                variant="warning"
              />
            )}

            {result.needsSplitting && (
              <AlertBanner
                variant="warning"
                message="Necessidade acima de 5 t/ha. Recomenda-se parcelar a aplicação em 2 anos."
              />
            )}

            <AlertBanner
              variant="info"
              message="Aguarde 60–90 dias após a aplicação antes do plantio para que o calcário reaja no solo."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Método de cálculo"
        options={METHOD_OPTIONS}
        value={inputs.method}
        onChange={(v) => updateInput('method', v as never)}
      />

      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={inputs.crop}
        onChange={handleCropChange}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="CTC a pH 7"
          unit="cmolc/dm³"
          value={inputs.ctc}
          onChange={(v) => updateInput('ctc', v as never)}
          placeholder="ex: 8.5"
          hint="Dados do laudo de solo"
          min="1"
          max="40"
          step="0.1"
          required
        />
        <InputField
          label="Saturação por bases atual (V%)"
          unit="%"
          value={inputs.v1}
          onChange={(v) => updateInput('v1', v as never)}
          placeholder="ex: 35"
          hint="Encontrado no laudo de solo"
          min="5"
          max="100"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Saturação por bases desejada (V%)"
          unit="%"
          value={inputs.v2}
          onChange={(v) => updateInput('v2', v as never)}
          placeholder="ex: 60"
          hint={currentTarget ? `${CROP_OPTIONS.find(c => c.value === inputs.crop)?.label}: ${currentTarget.min}–${currentTarget.max}%` : ''}
          min="40"
          max="80"
          required
        />
        <InputField
          label="PRNT do calcário"
          unit="%"
          value={inputs.prnt}
          onChange={(v) => updateInput('prnt', v as never)}
          placeholder="ex: 80"
          hint="Na embalagem do calcário"
          min="50"
          max="100"
          required
        />
      </div>

      {lowPrnt && (
        <AlertBanner
          variant="warning"
          message="PRNT abaixo de 70% indica calcário de baixa qualidade. A necessidade será maior."
        />
      )}

      <SelectField
        label="Profundidade de incorporação"
        options={DEPTH_OPTIONS}
        value={inputs.depth}
        onChange={(v) => updateInput('depth', v as never)}
      />

      <InputField
        label="Preço do calcário por tonelada (opcional)"
        unit="R$/t"
        value={inputs.limePrice}
        onChange={(v) => updateInput('limePrice', v as never)}
        placeholder="ex: 180"
        min="0"
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
