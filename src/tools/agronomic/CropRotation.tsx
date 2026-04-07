import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatPercent } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  system: string
  area: string
  soybeanYield: string
  cornYield: string
  soybeanPrice: string
  cornPrice: string
  soybeanCost: string
  cornCost: string
}

interface CropRow {
  [key: string]: unknown
  crop: string
  yield: number
  revenue: number
  cost: number
  profit: number
  margin: number
}

interface Result {
  rows: CropRow[]
  annualProfit: number
  profitVsMonoculture: number
  rotationBenefit: number
  alerts: string[]
}

// ── Constants ──

const INITIAL: Inputs = {
  system: 'soy_corn',
  area: '',
  soybeanYield: '',
  cornYield: '',
  soybeanPrice: '',
  cornPrice: '',
  soybeanCost: '',
  cornCost: '',
}

const SYSTEM_OPTIONS = [
  { value: 'soy_corn', label: 'Soja + Milho safrinha' },
  { value: 'soy_wheat', label: 'Soja + Trigo' },
  { value: 'soy_only', label: 'Soja solteira (referência)' },
]

// Rotation benefits (EMBRAPA)
// Corn/wheat after soy: +5-15% yield boost on next soy due to improved soil biology
const ROTATION_YIELD_BONUS = 0.08 // 8% average yield increase on soy following rotation

const COLUMNS: { key: keyof CropRow; label: string; format?: (v: unknown) => string; align?: 'left' | 'center' | 'right' }[] = [
  { key: 'crop', label: 'Cultura', align: 'left' },
  { key: 'yield', label: 'Produtividade (sc/ha)', format: (v) => formatNumber(v as number, 1), align: 'right' },
  { key: 'revenue', label: 'Receita (R$/ha)', format: (v) => formatNumber(v as number, 2), align: 'right' },
  { key: 'cost', label: 'Custo (R$/ha)', format: (v) => formatNumber(v as number, 2), align: 'right' },
  { key: 'profit', label: 'Lucro (R$/ha)', format: (v) => formatNumber(v as number, 2), align: 'right' },
  { key: 'margin', label: 'Margem', format: (v) => formatPercent(v as number), align: 'right' },
]

// ── Component ──

export default function CropRotation() {
  const [system, setSystem] = useState('soy_corn')

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: { ...INITIAL, system },
      calculate,
      validate,
    })

  const handleSystemChange = (v: string) => {
    setSystem(v)
    updateInput('system', v as never)
  }

  const showSecondCrop = system !== 'soy_only'
  const secondCropLabel = system === 'soy_wheat' ? 'Trigo' : 'Milho safrinha'

  return (
    <CalculatorLayout
      title="Rotação de Culturas"
      description="Compare a rentabilidade de sistemas de rotação (soja + safrinha) versus monocultura e veja o benefício econômico da rotação."
      about="A rotação de culturas melhora a saúde do solo, reduz pressão de pragas e doenças, e pode aumentar a produtividade da cultura principal em 5-15%. Estudos da EMBRAPA Soja mostram que soja após milho rende em média 8% mais que soja sobre soja."
      methodology="Lucro = Receita − Custo por cultura. Para rotação, aplica-se bônus de +8% na produtividade da soja (efeito rotação conforme EMBRAPA). A comparação com monocultura assume soja solteira sem bônus e sem receita de safrinha."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Lucro anual do sistema"
                value={formatNumber(result.annualProfit, 2)}
                unit="R$/ha"
                highlight
                variant={result.annualProfit >= 0 ? 'success' : 'danger'}
              />
              <ResultCard
                label="Vantagem vs monocultura"
                value={`${result.profitVsMonoculture >= 0 ? '+' : ''}${formatNumber(result.profitVsMonoculture, 2)}`}
                unit="R$/ha"
                variant={result.profitVsMonoculture >= 0 ? 'success' : 'warning'}
              />
            </div>

            {result.rotationBenefit > 0 && (
              <ResultCard
                label="Bônus de produtividade (efeito rotação)"
                value={`+${formatPercent(result.rotationBenefit * 100)}`}
                variant="success"
              >
                <p className="text-xs text-emerald-600 mt-1">
                  Aumento médio na soja quando cultivada em rotação (EMBRAPA)
                </p>
              </ResultCard>
            )}

            <ComparisonTable
              columns={COLUMNS}
              rows={result.rows}
              rowKey="crop"
              rowClassName={(row) =>
                (row.profit as number) < 0 ? 'bg-red-50' : ''
              }
            />

            {result.alerts.map((a) => (
              <AlertBanner key={a} variant="info" message={a} />
            ))}
          </div>
        )
      }
    >
      <SelectField
        label="Sistema de cultivo"
        value={inputs.system}
        onChange={handleSystemChange}
        options={SYSTEM_OPTIONS}
      />

      <InputField
        label="Área"
        unit="ha"
        value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
        placeholder="Ex: 500"
        min="0"
        required
        hint="Área total do sistema de rotação"
      />

      {/* Soybean inputs */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <p className="text-xs font-semibold text-agro-700 uppercase tracking-wider mb-3">Soja</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Produtividade"
            unit="sc/ha"
            value={inputs.soybeanYield}
              onChange={(v) => updateInput('soybeanYield', v as never)}
            placeholder="Ex: 60"
            min="0"
            required
            hint="Produtividade média esperada da soja"
          />
          <InputField
            label="Preço da saca"
            unit="R$/sc"
            value={inputs.soybeanPrice}
              onChange={(v) => updateInput('soybeanPrice', v as never)}
            placeholder="Ex: 120"
            min="0"
            required
            hint="Cotação atual da saca de soja"
          />
          <InputField
            label="Custo de produção"
            unit="R$/ha"
            value={inputs.soybeanCost}
              onChange={(v) => updateInput('soybeanCost', v as never)}
            placeholder="Ex: 4500"
            min="0"
            required
            hint="Soma dos custos por hectare"
          />
        </div>
      </div>

      {/* Second crop inputs */}
      {showSecondCrop && (
        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-agro-700 uppercase tracking-wider mb-3">{secondCropLabel}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <InputField
              label="Produtividade"
              unit="sc/ha"
              value={inputs.cornYield}
              onChange={(v) => updateInput('cornYield', v as never)}
              placeholder="Ex: 90"
              min="0"
              required
              hint="Produtividade esperada da safrinha"
            />
            <InputField
              label="Preço da saca"
              unit="R$/sc"
              value={inputs.cornPrice}
              onChange={(v) => updateInput('cornPrice', v as never)}
              placeholder="Ex: 55"
              min="0"
              required
              hint="Cotação da saca (milho ou trigo)"
            />
            <InputField
              label="Custo de produção"
              unit="R$/ha"
              value={inputs.cornCost}
              onChange={(v) => updateInput('cornCost', v as never)}
              placeholder="Ex: 3200"
              min="0"
              required
              hint="Custo do cultivo da segunda safra"
            />
          </div>
        </div>
      )}

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons
        onCalculate={run}
        onClear={clear}
        disabled={!inputs.area || !inputs.soybeanYield || !inputs.soybeanPrice}
      />
    </CalculatorLayout>
  )
}

// ── Logic ──

function validate(inputs: Inputs): string | null {
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'Informe a área'

  const sy = parseFloat(inputs.soybeanYield)
  const sp = parseFloat(inputs.soybeanPrice)
  const sc = parseFloat(inputs.soybeanCost)
  if (isNaN(sy) || sy <= 0) return 'Informe a produtividade da soja'
  if (isNaN(sp) || sp <= 0) return 'Informe o preço da saca de soja'
  if (isNaN(sc) || sc < 0) return 'Informe o custo de produção da soja'

  if (inputs.system !== 'soy_only') {
    const cy = parseFloat(inputs.cornYield)
    const cp = parseFloat(inputs.cornPrice)
    const cc = parseFloat(inputs.cornCost)
    if (isNaN(cy) || cy <= 0) return 'Informe a produtividade da segunda cultura'
    if (isNaN(cp) || cp <= 0) return 'Informe o preço da segunda cultura'
    if (isNaN(cc) || cc < 0) return 'Informe o custo da segunda cultura'
  }

  return null
}

function calculate(inputs: Inputs): Result {
  const system = inputs.system
  const syRaw = parseFloat(inputs.soybeanYield)
  const sp = parseFloat(inputs.soybeanPrice)
  const sc = parseFloat(inputs.soybeanCost)

  const isRotation = system !== 'soy_only'
  const rotationBenefit = isRotation ? ROTATION_YIELD_BONUS : 0

  // Apply rotation bonus to soybean yield
  const sy = syRaw * (1 + rotationBenefit)
  const soyRevenue = sy * sp
  const soyProfit = soyRevenue - sc
  const soyMargin = soyRevenue > 0 ? (soyProfit / soyRevenue) * 100 : 0

  const rows: CropRow[] = [
    {
      crop: `Soja${isRotation ? ' (com bônus rotação)' : ''}`,
      yield: sy,
      revenue: soyRevenue,
      cost: sc,
      profit: soyProfit,
      margin: soyMargin,
    },
  ]

  let annualProfit = soyProfit

  if (isRotation) {
    const cy = parseFloat(inputs.cornYield)
    const cp = parseFloat(inputs.cornPrice)
    const cc = parseFloat(inputs.cornCost)
    const secondRevenue = cy * cp
    const secondProfit = secondRevenue - cc
    const secondMargin = secondRevenue > 0 ? (secondProfit / secondRevenue) * 100 : 0
    const label = system === 'soy_wheat' ? 'Trigo' : 'Milho safrinha'

    rows.push({
      crop: label,
      yield: cy,
      revenue: secondRevenue,
      cost: cc,
      profit: secondProfit,
      margin: secondMargin,
    })

    annualProfit += secondProfit
  }

  // Monoculture reference: soy only, without rotation bonus
  const monocultureProfit = syRaw * sp - sc
  const profitVsMonoculture = annualProfit - monocultureProfit

  const alerts: string[] = []

  if (isRotation && rotationBenefit > 0) {
    const bonusSc = sy - syRaw
    alerts.push(
      `Efeito rotação: +${formatNumber(bonusSc, 1)} sc/ha na soja (de ${formatNumber(syRaw, 1)} para ${formatNumber(sy, 1)} sc/ha).`
    )
  }

  if (soyProfit < 0) {
    alerts.push('Soja com resultado negativo. Revise custos ou considere aumentar a produtividade.')
  }

  if (isRotation && rows[1].profit < 0) {
    alerts.push('Segunda cultura com prejuízo. Avalie se a palhada e os benefícios agronômicos justificam o investimento.')
  }

  return { rows, annualProfit, profitVsMonoculture, rotationBenefit, alerts }
}
