import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { CARBON_PRICE_REF } from '../../data/reference-data'
import { calculateCarbonCredit, validateCarbonCredit, type CarbonCreditResult } from '../../core/utilities/carbon-credit'

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

// ── Calculation ──

function calculate(inputs: Inputs): CarbonCreditResult | null {
  const parsed = {
    areaHa: parseFloat(inputs.area),
    cropSystem: inputs.cropSystem,
    noTill: inputs.noTill === 'yes',
    coverCrop: inputs.coverCrop === 'yes',
    ilpf: inputs.ilpf === 'yes',
    years: parseFloat(inputs.years),
    carbonPrice: parseFloat(inputs.carbonPrice),
  }
  return calculateCarbonCredit(parsed)
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área em hectares'
  return validateCarbonCredit({
    areaHa: parseFloat(inputs.area),
    cropSystem: inputs.cropSystem,
    noTill: inputs.noTill === 'yes',
    coverCrop: inputs.coverCrop === 'yes',
    ilpf: inputs.ilpf === 'yes',
    years: parseFloat(inputs.years),
    carbonPrice: parseFloat(inputs.carbonPrice),
  })
}

// ── Component ──

export default function CarbonCredit() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, CarbonCreditResult>({ initialInputs: INITIAL, calculate, validate })

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

          <AlertBanner
            variant="warning"
            message="Valores são estimativas para orientação. A geração real de créditos de carbono requer projeto certificado por entidade credenciada (Verra, Gold Standard ou similar) com monitoramento e verificação em campo."
          />
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
