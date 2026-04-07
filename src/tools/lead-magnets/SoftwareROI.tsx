import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  area: string
  crop: string
  management: string
  softwareCostMonth: string
  customInputCost: string
  customProd: string
  customPrice: string
}

interface SavingsRow {
  label: string
  annual: number
}

interface Result {
  savings: SavingsRow[]
  totalAnnual: number
  softwareAnnual: number
  roi: number
  paybackMonths: number
}

const INITIAL: Inputs = {
  area: '',
  crop: 'soybean',
  management: 'spreadsheet',
  softwareCostMonth: '290',
  customInputCost: '',
  customProd: '',
  customPrice: '',
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'mixed', label: 'Misto (Soja + Milho)' },
  { value: 'custom', label: '✦ Personalizado' },
]

const MGMT_OPTIONS = [
  { value: 'memory', label: 'Memória / cadernos' },
  { value: 'spreadsheet', label: 'Planilhas Excel' },
  { value: 'basic_software', label: 'Software básico' },
]

// Average input cost R$/ha by crop
const INPUT_COST: Record<string, number> = {
  soybean: 2800,
  corn: 2400,
  cotton: 5500,
  mixed: 2600,
}

// Average productivity sc/ha
const AVG_PROD: Record<string, number> = {
  soybean: 55,
  corn: 100,
  cotton: 280, // @/ha
  mixed: 55,
}

// Average sack price
const AVG_PRICE: Record<string, number> = {
  soybean: 110,
  corn: 50,
  cotton: 120, // R$/@
  mixed: 110,
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const swCost = parseFloat(inputs.softwareCostMonth) || 290

  const inputCost = (inputs.crop === 'custom'
    ? (parseFloat(inputs.customInputCost) || 2800)
    : (INPUT_COST[inputs.crop] ?? 2800)) * area
  const prod = inputs.crop === 'custom'
    ? (parseFloat(inputs.customProd) || 55)
    : (AVG_PROD[inputs.crop] ?? 55)
  const price = inputs.crop === 'custom'
    ? (parseFloat(inputs.customPrice) || 110)
    : (AVG_PRICE[inputs.crop] ?? 110)

  // Savings estimates (conservative)
  const inputSaving = inputCost * 0.015
  const salesGain = area * prod * 3 // R$3/sc better timing
  const harvestSaving = area * 0.7 * price // 0.7 sc/ha less loss
  const timeSaving = 10 * 12 * 100 // 10h/month × R$100/h equivalent
  const fiscalSaving = 8000 // Average avoided errors

  // Management discount: if already using spreadsheets, less gain
  const mgmtFactor = inputs.management === 'memory' ? 1.0 : inputs.management === 'spreadsheet' ? 0.7 : 0.4

  const savings: SavingsRow[] = [
    { label: 'Redução de perdas em insumos (1,5%)', annual: inputSaving * mgmtFactor },
    { label: 'Melhor timing de venda (R$3/sc)', annual: salesGain * mgmtFactor },
    { label: 'Redução de perdas na colheita (0,7 sc/ha)', annual: harvestSaving * mgmtFactor },
    { label: 'Economia de tempo de gestão (10h/mês)', annual: timeSaving * mgmtFactor },
    { label: 'Redução de erros fiscais', annual: fiscalSaving * mgmtFactor },
  ]

  const totalAnnual = savings.reduce((s, r) => s + r.annual, 0)
  const softwareAnnual = swCost * 12
  const roi = softwareAnnual > 0 ? ((totalAnnual - softwareAnnual) / softwareAnnual) * 100 : 0
  const paybackMonths = totalAnnual > 0 ? softwareAnnual / (totalAnnual / 12) : 0

  return { savings, totalAnnual, softwareAnnual, roi, paybackMonths }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área da fazenda'
  if (isNaN(parseFloat(inputs.area)) || parseFloat(inputs.area) <= 0) return 'Área deve ser positiva'
  return null
}

// ── Component ──

export default function SoftwareROI() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="ROI do Software de Gestão"
      description="Calcule quanto você pode economizar com um software de gestão agrícola. Estimativas conservadoras baseadas em médias de mercado."
      about="Descubra quanto você pode economizar adotando um software de gestão agrícola. Calcule o retorno sobre o investimento considerando redução de perdas, melhor timing de venda e economia de insumos."
      methodology='Economia = Redução perdas (0,7 sc/ha) + Melhor timing (R$3/sc) + Economia insumos (1,5%) + Tempo economizado (R$40/h). ROI = (Economia anual - Custo software) / Custo software × 100.'
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Economia anual estimada"
                value={formatCurrency(result.totalAnnual)}
                prefix="R$" unit="R$/ano"
                highlight
                variant="success"
              />
              <ResultCard
                label="ROI do software"
                value={formatNumber(result.roi, 0)}
                unit="%"
                highlight
                variant="success"
              />
              <ResultCard
                label="Payback"
                value={formatNumber(result.paybackMonths, 1)}
                unit="meses"
                variant="success"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Detalhamento por categoria</h3>
              <div className="space-y-2">
                {result.savings.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="font-medium text-agro-700">{formatCurrency(s.annual)}/ano</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Custo anual do software: {formatCurrency(result.softwareAnnual)}
            </div>

            <AlertBanner
              variant="info"
              message="Estimativas baseadas em médias de mercado. Resultados individuais podem variar."
            />
          </div>
        )
      }
    >
      <InputField
        label="Área da fazenda"
        unit="ha"
        value={inputs.area}
        onChange={(v) => updateInput('area', v as never)}
        placeholder="ex: 1000"
        min="0"
        required
        hint="Área total cultivada da propriedade"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Principal cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={(v) => updateInput('crop', v as never)}
        />
        <SelectField
          label="Como gerencia hoje?"
          options={MGMT_OPTIONS}
          value={inputs.management}
          onChange={(v) => updateInput('management', v as never)}
        />
      </div>

      {inputs.crop === 'custom' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Custo de insumos"
            unit="R$/ha"
            value={inputs.customInputCost}
            onChange={(v) => updateInput('customInputCost', v as never)}
            placeholder="ex: 2800"
            min="0"
            hint="Custo total de insumos por hectare"
          />
          <InputField
            label="Produtividade média"
            unit="sc/ha"
            value={inputs.customProd}
            onChange={(v) => updateInput('customProd', v as never)}
            placeholder="ex: 55"
            min="0"
            hint="Produtividade média da cultura"
          />
          <InputField
            label="Preço médio da saca"
            unit="R$/sc"
            value={inputs.customPrice}
            onChange={(v) => updateInput('customPrice', v as never)}
            placeholder="ex: 110"
            min="0"
            hint="Preço de referência da saca"
          />
        </div>
      )}

      <InputField
        label="Custo mensal do software"
        prefix="R$" mask="currency" unit="R$/mês"
        value={inputs.softwareCostMonth}
        onChange={(v) => updateInput('softwareCostMonth', v as never)}
        placeholder="ex: 290"
        min="0"
        hint="Valor da assinatura mensal do sistema"
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
