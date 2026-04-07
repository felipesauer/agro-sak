import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { CROP_INSURANCE_REF, CROP_PRICE_REF, cropOptionsFrom } from '../../data/reference-data'
import { useCropPrices } from '../../db/hooks'

// ── Types ──

interface Inputs {
  crop: string
  area: string
  yield: string
  pricePerBag: string
  coverageLevel: string
  riskLevel: string
  insuranceType: string
  financedValue: string
  customPremiumRate: string
}

interface Result {
  insuredValuePerHa: number
  insuredValueTotal: number
  grossPremium: number
  subsidyAmount: number
  farmerPremium: number
  farmerPremiumPerHa: number
  coverageValuePerHa: number
  coverageValueTotal: number
  breakEvenLossPct: number
  scenarios: ScenarioRow[]
}

interface ScenarioRow {
  [key: string]: unknown
  scenario: string
  lossPct: number
  indemnity: number
  netResult: number
}

// ── Constants ──

const CROP_OPTIONS = [
  ...cropOptionsFrom(CROP_PRICE_REF),
  { value: 'custom', label: '✦ Personalizado' },
]

const RISK_OPTIONS = Object.entries(CROP_INSURANCE_REF.premiumRates).map(([value, r]) => ({
  value,
  label: `${r.label} (${formatPercent(r.rate, 1)})`,
}))

const INSURANCE_TYPE_OPTIONS = [
  { value: 'psr', label: 'Seguro Rural com PSR' },
  { value: 'proagro', label: 'Proagro (crédito rural)' },
  { value: 'proagro_mais', label: 'Proagro Mais (mini/pequeno)' },
]

const INITIAL: Inputs = {
  crop: 'soybean',
  area: '',
  yield: '',
  pricePerBag: '',
  coverageLevel: '70',
  riskLevel: 'medium',
  insuranceType: 'psr',
  financedValue: '',
  customPremiumRate: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const yield_ = parseFloat(inputs.yield)
  const price = parseFloat(inputs.pricePerBag)
  const coveragePct = parseFloat(inputs.coverageLevel) / 100

  const revenuePerHa = yield_ * price
  const revenueTotal = revenuePerHa * area

  if (inputs.insuranceType === 'proagro' || inputs.insuranceType === 'proagro_mais') {
    const financedValue = parseFloat(inputs.financedValue)
    if (!financedValue || financedValue <= 0) return null

    const rate = inputs.insuranceType === 'proagro'
      ? CROP_INSURANCE_REF.proagroRate
      : CROP_INSURANCE_REF.proagroMaisRate

    const grossPremium = (rate / 100) * financedValue
    const coverageValueTotal = financedValue
    const coverageValuePerHa = financedValue / area

    return {
      insuredValuePerHa: revenuePerHa,
      insuredValueTotal: revenueTotal,
      grossPremium,
      subsidyAmount: 0,
      farmerPremium: grossPremium,
      farmerPremiumPerHa: grossPremium / area,
      coverageValuePerHa,
      coverageValueTotal,
      breakEvenLossPct: grossPremium > 0 ? (grossPremium / coverageValueTotal) * 100 : 0,
      scenarios: buildScenarios(revenuePerHa, area, coverageValuePerHa, grossPremium / area),
    }
  }

  // PSR insurance
  const premiumRate = inputs.customPremiumRate
    ? parseFloat(inputs.customPremiumRate) / 100
    : (CROP_INSURANCE_REF.premiumRates[inputs.riskLevel as keyof typeof CROP_INSURANCE_REF.premiumRates]?.rate ?? 6) / 100

  const insuredValuePerHa = revenuePerHa
  const insuredValueTotal = revenueTotal
  const grossPremium = insuredValueTotal * premiumRate

  const subsidyCategory = inputs.crop === 'coffee' ? 'coffee' : 'grains'
  const subsidyRate = CROP_INSURANCE_REF.subsidyRates[subsidyCategory as keyof typeof CROP_INSURANCE_REF.subsidyRates]?.rate ?? 40
  const subsidyAmount = grossPremium * (subsidyRate / 100)
  const farmerPremium = grossPremium - subsidyAmount
  const farmerPremiumPerHa = farmerPremium / area

  const coverageValuePerHa = insuredValuePerHa * coveragePct
  const coverageValueTotal = insuredValueTotal * coveragePct

  const breakEvenLossPct = farmerPremium > 0 ? (farmerPremium / coverageValueTotal) * 100 : 0

  return {
    insuredValuePerHa,
    insuredValueTotal,
    grossPremium,
    subsidyAmount,
    farmerPremium,
    farmerPremiumPerHa,
    coverageValuePerHa,
    coverageValueTotal,
    breakEvenLossPct,
    scenarios: buildScenarios(revenuePerHa, area, coverageValuePerHa, farmerPremiumPerHa),
  }
}

function buildScenarios(revenuePerHa: number, area: number, coveragePerHa: number, premiumPerHa: number): ScenarioRow[] {
  return [20, 40, 60, 80, 100].map(lossPct => {
    const lostRevenue = revenuePerHa * (lossPct / 100)
    const indemnityPerHa = Math.min(lostRevenue, coveragePerHa)
    const netResult = (indemnityPerHa - premiumPerHa) * area
    return {
      scenario: `${lossPct}% de perda`,
      lossPct,
      indemnity: indemnityPerHa * area,
      netResult,
    }
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área em hectares'
  if (!inputs.yield) return 'Informe a produtividade esperada (sc/ha)'
  if (!inputs.pricePerBag) return 'Informe o preço por saca'
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'A área deve ser maior que zero'
  if (area > 100_000) return 'Área muito grande — verifique o valor'
  const yield_ = parseFloat(inputs.yield)
  if (isNaN(yield_) || yield_ <= 0) return 'A produtividade deve ser maior que zero'
  const price = parseFloat(inputs.pricePerBag)
  if (isNaN(price) || price <= 0) return 'O preço deve ser maior que zero'
  if ((inputs.insuranceType === 'proagro' || inputs.insuranceType === 'proagro_mais') && !inputs.financedValue) {
    return 'Informe o valor financiado para o Proagro'
  }
  return null
}

// ── Component ──

export default function CropInsurance() {
  const cropPrices = useCropPrices()

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    updateInput('crop', value as never)
    if (value !== 'custom') {
      const dexiePrice = cropPrices?.find(p => p.crop === value)
      const price = dexiePrice?.avg ?? CROP_PRICE_REF[value]?.avg
      if (price) updateInput('pricePerBag', String(price) as never)
    }
  }

  const isProagro = inputs.insuranceType === 'proagro' || inputs.insuranceType === 'proagro_mais'

  return (
    <CalculatorLayout
      title="Seguro Rural / Proagro"
      description="Estime o prêmio do seguro rural, a subvenção do PSR e simule o valor da indenização em diferentes cenários de perda."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Prêmio pago pelo produtor"
                value={formatCurrency(result.farmerPremiumPerHa)}
                unit="R$/ha"
                highlight
              />
              <ResultCard
                label="Cobertura contratada"
                value={formatCurrency(result.coverageValuePerHa)}
                unit="R$/ha"
                highlight
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Prêmio total"
                value={formatCurrency(result.farmerPremium)}
                variant="default"
              />
              {result.subsidyAmount > 0 && (
                <ResultCard
                  label="Subvenção PSR"
                  value={formatCurrency(result.subsidyAmount)}
                  variant="success"
                />
              )}
              <ResultCard
                label="Perda mín. para compensar"
                value={formatPercent(result.breakEvenLossPct)}
                variant={result.breakEvenLossPct > 30 ? 'warning' : 'default'}
              />
            </div>

            <ComparisonTable
              columns={[
                { key: 'scenario', label: 'Cenário' },
                { key: 'indemnity', label: 'Indenização', format: (v) => formatCurrency(v as number) },
                { key: 'netResult', label: 'Resultado líquido', format: (v) => {
                  const val = v as number
                  return val >= 0 ? formatCurrency(val) : `−${formatCurrency(Math.abs(val))}`
                }},
              ]}
              rows={result.scenarios}
              highlightIndex={2}
            />

            {result.farmerPremiumPerHa > result.coverageValuePerHa * 0.15 && (
              <AlertBanner
                variant="warning"
                title="Prêmio elevado"
                message={`O custo do seguro representa mais de 15% da cobertura. Avalie se o custo-benefício compensa para sua região.`}
              />
            )}

            {result.breakEvenLossPct < 15 && (
              <AlertBanner
                variant="success"
                title="Boa relação custo-benefício"
                message={`Com perda acima de ${formatPercent(result.breakEvenLossPct)} já compensa o seguro. Considerando a frequência de perdas na sua região, pode ser vantajoso.`}
              />
            )}
          </div>
        )
      }
      about="O seguro rural protege o produtor contra perdas de safra causadas por eventos climáticos (seca, granizo, geada, excesso de chuva). O Programa de Subvenção ao Prêmio (PSR) subsidia parte do prêmio. O Proagro é vinculado ao crédito rural e cobre a parcela financiada."
      methodology="Prêmio = receita esperada × taxa de prêmio. Subvenção PSR descontada conforme categoria da cultura (40% para grãos). Cobertura = receita × nível de cobertura contratado. Indenização = min(perda real, cobertura). Fontes: MAPA, BACEN Res. 4.939, Circular SUSEP."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={handleCropChange}
          required
        />
        <SelectField
          label="Tipo de seguro"
          options={INSURANCE_TYPE_OPTIONS}
          value={inputs.insuranceType}
          onChange={(v) => updateInput('insuranceType', v as never)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          min="0"
          max="100000"
          required
        />
        <InputField
          label="Produtividade esperada"
          unit="sc/ha"
          value={inputs.yield}
          onChange={(v) => updateInput('yield', v as never)}
          placeholder="ex: 55"
          min="0"
          max="500"
          required
        />
        <InputField
          label="Preço por saca"
          unit="R$/sc"
          value={inputs.pricePerBag}
          onChange={(v) => updateInput('pricePerBag', v as never)}
          placeholder="ex: 130"
          min="0"
          max="5000"
          required
        />
      </div>

      {!isProagro && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Nível de cobertura"
            options={[...CROP_INSURANCE_REF.coverageLevels]}
            value={inputs.coverageLevel}
            onChange={(v) => updateInput('coverageLevel', v as never)}
            required
          />
          <SelectField
            label="Nível de risco da região"
            options={RISK_OPTIONS}
            value={inputs.riskLevel}
            onChange={(v) => updateInput('riskLevel', v as never)}
            required
          />
          <InputField
            label="Taxa personalizada"
            unit="%"
            value={inputs.customPremiumRate}
            onChange={(v) => updateInput('customPremiumRate', v as never)}
            placeholder="Deixe vazio para usar referência"
            hint="Informe a taxa da cotação real"
            min="0"
            max="30"
          />
        </div>
      )}

      {isProagro && (
        <InputField
          label="Valor financiado"
          unit="R$"
          value={inputs.financedValue}
          onChange={(v) => updateInput('financedValue', v as never)}
          placeholder="ex: 350000"
          hint={`Taxa: ${inputs.insuranceType === 'proagro' ? CROP_INSURANCE_REF.proagroRate : CROP_INSURANCE_REF.proagroMaisRate}% do valor financiado`}
          min="0"
          max="50000000"
          required
        />
      )}

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
