import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import DataFreshness from '../../components/ui/DataFreshness'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { CROP_INSURANCE_REF, CROP_PRICE_REF, cropOptionsFrom } from '../../data/reference-data'
import { useCropPrices } from '../../db/hooks'
import { calculateCropInsurance, validateCropInsurance, type CropInsuranceResult, type ScenarioRow as CoreScenarioRow } from '../../core/financial/crop-insurance'

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

interface ScenarioRow extends CoreScenarioRow {
  [key: string]: unknown
  scenario: string
}

interface Result extends Omit<CropInsuranceResult, 'scenarios'> {
  scenarios: ScenarioRow[]
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
  pricePerBag: String(CROP_PRICE_REF['soybean']?.avg ?? ''),
  coverageLevel: '70',
  riskLevel: 'medium',
  insuranceType: 'psr',
  financedValue: '',
  customPremiumRate: '',
}

// ── Calculation ──

function buildCoreInput(inputs: Inputs) {
  const isProagro = inputs.insuranceType === 'proagro' || inputs.insuranceType === 'proagro_mais'
  const premiumRatePercent = inputs.customPremiumRate
    ? parseFloat(inputs.customPremiumRate)
    : (CROP_INSURANCE_REF.premiumRates[inputs.riskLevel as keyof typeof CROP_INSURANCE_REF.premiumRates]?.rate ?? 6)
  const subsidyCategory = inputs.crop === 'coffee' ? 'coffee' : 'grains'
  const subsidyRatePercent = CROP_INSURANCE_REF.subsidyRates[subsidyCategory as keyof typeof CROP_INSURANCE_REF.subsidyRates]?.rate ?? 40
  const proagroRatePercent = isProagro
    ? (inputs.insuranceType === 'proagro' ? CROP_INSURANCE_REF.proagroRate : CROP_INSURANCE_REF.proagroMaisRate)
    : undefined

  return {
    insuranceType: inputs.insuranceType as 'psr' | 'proagro' | 'proagro_mais',
    areaHa: parseFloat(inputs.area) || 0,
    yieldScHa: parseFloat(inputs.yield) || 0,
    pricePerBag: parseFloat(inputs.pricePerBag) || 0,
    coverageLevelPercent: parseFloat(inputs.coverageLevel) || 70,
    premiumRatePercent,
    subsidyRatePercent,
    financedValue: isProagro ? parseFloat(inputs.financedValue) || 0 : undefined,
    proagroRatePercent,
  }
}

function calculate(inputs: Inputs): Result | null {
  const coreResult = calculateCropInsurance(buildCoreInput(inputs))
  if (!coreResult) return null
  return {
    ...coreResult,
    scenarios: coreResult.scenarios.map(s => ({
      ...s,
      scenario: `${s.lossPct}% de perda`,
    })),
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área em hectares'
  if (!inputs.yield) return 'Informe a produtividade esperada (sc/ha)'
  if (!inputs.pricePerBag) return 'Informe o preço por saca'
  return validateCropInsurance(buildCoreInput(inputs))
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
          hint="Área total segurada em hectares"
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
          hint="Produtividade média da lavoura segurada"
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
          hint="Preço usado para calcular a receita esperada"
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
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area || !inputs.yield || !inputs.pricePerBag} />
      <DataFreshness table="cropPrices" label="Preços" />
    </CalculatorLayout>
  )
}
