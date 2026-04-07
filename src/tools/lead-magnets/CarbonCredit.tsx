import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { CARBON_SEQUESTRATION, CARBON_PRICE_REF } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  area: string
  cropSystem: string
  noTill: string
  coverCrop: string
  ilpf: string
  years: string
  carbonPrice: string
}

interface Result {
  annualSequestration: number
  totalSequestration: number
  annualRevenue: number
  totalRevenue: number
  revenuePerHa: number
  practices: { name: string; contribution: number }[]
  equivalentTrees: number
}

// ── Constants ──

const INITIAL: Inputs = {
  area: '',
  cropSystem: 'soybean_corn',
  noTill: 'yes',
  coverCrop: 'no',
  ilpf: 'no',
  years: '10',
  carbonPrice: String(CARBON_PRICE_REF.avg),
}

const CROP_SYSTEM_OPTIONS = [
  { value: 'soybean_corn', label: 'Soja/Milho safrinha' },
  { value: 'soybean_wheat', label: 'Soja/Trigo' },
  { value: 'soybean_cotton', label: 'Soja/Algodão' },
  { value: 'corn_mono', label: 'Milho safra' },
  { value: 'sugarcane', label: 'Cana-de-açúcar' },
  { value: 'pasture', label: 'Pastagem' },
  { value: 'coffee', label: 'Café' },
]

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
]

// ── Average CO₂ absorbed per tree per year (tCO₂/tree/year)
const CO2_PER_TREE_YEAR = 0.022 // Source: EMBRAPA Florestas

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const years = parseFloat(inputs.years)
  const carbonPrice = parseFloat(inputs.carbonPrice)
  if (isNaN(area) || area <= 0 || isNaN(years) || years <= 0) return null

  const baseRate = CARBON_SEQUESTRATION[inputs.cropSystem] ?? CARBON_SEQUESTRATION.soybean_corn

  const practices: { name: string; contribution: number }[] = []
  let totalRate = baseRate

  practices.push({ name: 'Sistema de cultivo', contribution: baseRate * area })

  if (inputs.noTill === 'yes') {
    const noTillBonus = 0.5 // tCO₂eq/ha/year — Source: EMBRAPA Solos, Plano ABC+
    totalRate += noTillBonus
    practices.push({ name: 'Plantio direto (SPD)', contribution: noTillBonus * area })
  }

  if (inputs.coverCrop === 'yes') {
    const coverCropBonus = 0.3 // tCO₂eq/ha/year — Source: EMBRAPA Cerrados
    totalRate += coverCropBonus
    practices.push({ name: 'Planta de cobertura', contribution: coverCropBonus * area })
  }

  if (inputs.ilpf === 'yes') {
    const ilpfBonus = 1.2 // tCO₂eq/ha/year — Source: EMBRAPA ILPF
    totalRate += ilpfBonus
    practices.push({ name: 'ILPF / SAF', contribution: ilpfBonus * area })
  }

  const annualSequestration = totalRate * area
  const totalSequestration = annualSequestration * years
  const annualRevenue = annualSequestration * carbonPrice
  const totalRevenue = totalSequestration * carbonPrice
  const equivalentTrees = Math.round(annualSequestration / CO2_PER_TREE_YEAR)

  return {
    annualSequestration,
    totalSequestration,
    annualRevenue,
    totalRevenue,
    revenuePerHa: totalRate * carbonPrice,
    practices,
    equivalentTrees,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área em hectares'
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'A área deve ser maior que zero'
  if (area > 100_000) return 'Área muito grande — verifique o valor'
  const years = parseFloat(inputs.years)
  if (isNaN(years) || years < 1 || years > 50) return 'O prazo deve ser entre 1 e 50 anos'
  const price = parseFloat(inputs.carbonPrice)
  if (isNaN(price) || price <= 0) return 'Informe o preço do crédito de carbono'
  return null
}

// ── Component ──

export default function CarbonCredit() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Crédito de Carbono Rural"
      description="Estime o potencial de sequestro de carbono e a receita com créditos de carbono da sua propriedade."
      result={result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Sequestro anual"
              value={formatNumber(result.annualSequestration, 1)}
              unit="tCO₂eq/ano"
              highlight
            />
            <ResultCard
              label="Receita anual estimada"
              value={formatCurrency(result.annualRevenue)}
              unit="/ano"
              highlight
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label={`Sequestro em ${inputs.years} anos`}
              value={formatNumber(result.totalSequestration, 0)}
              unit="tCO₂eq"
            />
            <ResultCard
              label="Receita total estimada"
              value={formatCurrency(result.totalRevenue, 0)}
            />
            <ResultCard
              label="Receita por ha/ano"
              value={formatCurrency(result.revenuePerHa)}
              unit="/ha"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
              Contribuição por prática
            </p>
            <div className="space-y-2">
              {result.practices.map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-agro-700">
                    {formatNumber(p.contribution, 1)} tCO₂eq/ano
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ResultCard
            label="Equivalente em árvores plantadas"
            value={formatNumber(result.equivalentTrees, 0)}
            unit="árvores/ano"
          >
            <p className="text-xs text-gray-500 mt-1">
              Sequestro equivalente ao plantio de {formatNumber(result.equivalentTrees, 0)} árvores por ano
            </p>
          </ResultCard>

          {result.annualRevenue > 50000 && (
            <AlertBanner
              variant="success"
              title="Alto potencial de receita"
              message={`Com ${formatCurrency(result.annualRevenue)} por ano, o crédito de carbono pode ser uma fonte relevante de renda para sua propriedade.`}
            />
          )}

          {inputs.noTill === 'no' && (
            <AlertBanner
              variant="info"
              title="Oportunidade: Plantio direto"
              message="A adoção do SPD (Sistema Plantio Direto) pode aumentar significativamente o sequestro de carbono e o valor dos créditos."
            />
          )}

          {inputs.ilpf === 'yes' && (
            <AlertBanner
              variant="success"
              title="ILPF: máximo potencial"
              message="Sistemas integrados (ILPF/SAF) são os que mais sequestram carbono — excelente para o mercado de créditos."
            />
          )}
        </div>
      )}
      about="Estime o potencial de sequestro de carbono da sua propriedade rural e a receita que pode ser gerada com a venda de créditos de carbono no mercado voluntário. Considera as principais práticas conservacionistas reconhecidas pelo Plano ABC+ (Agricultura de Baixa Emissão de Carbono)."
      methodology="Taxas de sequestro baseadas em publicações da EMBRAPA (Solos, Cerrados, Florestas) e diretrizes do Plano ABC+. Valores variam conforme sistema de cultivo, práticas adotadas e região. O preço do crédito de carbono reflete o mercado voluntário brasileiro (2023-2024). Resultados são estimativas — certificação real requer auditoria de entidade credenciada (Verra, Gold Standard)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Sistema de cultivo"
          options={CROP_SYSTEM_OPTIONS}
          value={inputs.cropSystem}
          onChange={(v) => updateInput('cropSystem', v as never)}
          required
        />
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          required
          hint="Área total da propriedade"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Plantio direto (SPD)"
          options={YES_NO_OPTIONS}
          value={inputs.noTill}
          onChange={(v) => updateInput('noTill', v as never)}
          hint="Não revolvimento do solo"
        />
        <SelectField
          label="Planta de cobertura"
          options={YES_NO_OPTIONS}
          value={inputs.coverCrop}
          onChange={(v) => updateInput('coverCrop', v as never)}
          hint="Braquiária, crotalária, etc."
        />
        <SelectField
          label="ILPF / SAF"
          options={YES_NO_OPTIONS}
          value={inputs.ilpf}
          onChange={(v) => updateInput('ilpf', v as never)}
          hint="Integração Lavoura-Pecuária-Floresta"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Prazo de projeção"
          unit="anos"
          value={inputs.years}
          onChange={(v) => updateInput('years', v as never)}
          placeholder="ex: 10"
          min="1"
          max="50"
          required
          hint="Horizonte de tempo para a estimativa"
        />
        <InputField
          label="Preço do crédito"
          unit="R$/tCO₂eq"
          value={inputs.carbonPrice}
          onChange={(v) => updateInput('carbonPrice', v as never)}
          placeholder="ex: 50"
          hint={`Mercado: ${formatCurrency(CARBON_PRICE_REF.min)} a ${formatCurrency(CARBON_PRICE_REF.max)}`}
          required
        />
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
