import useCalculator from '../../hooks/useCalculator'
import { calculateGypsum, validateGypsum, type GypsumMethod } from '../../core/agronomic/gypsum'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  method: string
  Ca: string
  Mg: string
  Al: string
  ctc: string
  clayPercent: string
  targetDepth: string
  area: string
  gypPrice: string
}

interface Result {
  gypsumNeedKgHa: number
  gypsumNeedTHa: number
  totalTons: number
  totalCost: number
  costPerHa: number
  justified: boolean
  reason: string
}

// ── Constants ──

const INITIAL: Inputs = {
  method: 'sousa',
  Ca: '',
  Mg: '',
  Al: '',
  ctc: '',
  clayPercent: '40',
  targetDepth: '20',
  area: '',
  gypPrice: '250',
}

const METHOD_OPTIONS = [
  { value: 'sousa', label: 'Sousa et al. (Cerrado) — EMBRAPA' },
  { value: 'clay', label: 'Baseado no teor de argila — EMBRAPA Soja' },
  { value: 'raij', label: 'Van Raij — IAC (São Paulo)' },
]

const DEPTH_OPTIONS = [
  { value: '20', label: '20 cm (subsuperficial)' },
  { value: '40', label: '40 cm (perfil completo)' },
  { value: '60', label: '60 cm (café/fruticultura)' },
]

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const coreResult = calculateGypsum({
    method: inputs.method as GypsumMethod,
    Ca: parseFloat(inputs.Ca),
    Mg: inputs.Mg ? parseFloat(inputs.Mg) : undefined,
    Al: inputs.Al ? parseFloat(inputs.Al) : undefined,
    ctc: inputs.ctc ? parseFloat(inputs.ctc) : undefined,
    clayPercent: inputs.clayPercent ? parseFloat(inputs.clayPercent) : undefined,
    targetDepthCm: parseFloat(inputs.targetDepth),
    areaHa: parseFloat(inputs.area),
    gypPricePerTon: parseFloat(inputs.gypPrice),
  })
  if (!coreResult) return null
  return {
    gypsumNeedKgHa: coreResult.gypsumNeedKgHa,
    gypsumNeedTHa: coreResult.gypsumNeedTHa,
    totalTons: coreResult.totalTons,
    totalCost: coreResult.totalCost,
    costPerHa: coreResult.costPerHa,
    justified: coreResult.justified,
    reason: coreResult.reasons.join('; '),
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.Ca) return 'Informe o teor de cálcio (Ca) da camada subsuperficial'
  if (!inputs.area) return 'Informe a área em hectares'
  return validateGypsum({
    method: inputs.method as GypsumMethod,
    Ca: parseFloat(inputs.Ca),
    ctc: inputs.ctc ? parseFloat(inputs.ctc) : undefined,
    clayPercent: inputs.clayPercent ? parseFloat(inputs.clayPercent) : undefined,
    targetDepthCm: parseFloat(inputs.targetDepth),
    areaHa: parseFloat(inputs.area),
    gypPricePerTon: parseFloat(inputs.gypPrice),
  })
}

// ── Component ──

export default function GypsumCalculator() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Gesso Agrícola"
      description="Calcule a necessidade de gesso agrícola (sulfato de cálcio) para correção do perfil subsuperficial do solo."
      result={result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Necessidade de gesso"
              value={formatNumber(result.gypsumNeedKgHa, 0)}
              unit="kg/ha"
              highlight
            />
            <ResultCard
              label="Necessidade de gesso"
              value={formatNumber(result.gypsumNeedTHa, 2)}
              unit="t/ha"
              highlight
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Total necessário"
              value={formatNumber(result.totalTons, 1)}
              unit="toneladas"
            />
            <ResultCard
              label="Custo por hectare"
              value={formatCurrency(result.costPerHa)}
            />
            <ResultCard
              label="Custo total"
              value={formatCurrency(result.totalCost, 0)}
            />
          </div>

          {result.justified ? (
            <AlertBanner
              variant="warning"
              title="Gessagem recomendada"
              message={result.reason}
            />
          ) : (
            <AlertBanner
              variant="info"
              title="Gessagem pode ser dispensável"
              message={result.reason}
            />
          )}

          {result.gypsumNeedTHa > 3 && (
            <AlertBanner
              variant="info"
              title="Dose elevada"
              message="Considere parcelar a aplicação em 2 anos para doses acima de 3 t/ha."
            />
          )}

          <AlertBanner
            variant="info"
            message="A migração do gesso no perfil do solo não é linear — depende da textura, umidade e teor de matéria orgânica. O efeito pleno pode levar 6 a 12 meses."
          />
        </div>
      )}
      about="Calcule a quantidade de gesso agrícola (CaSO₄) necessária para corrigir o perfil subsuperficial do solo (20-40 cm). O gesso melhora o ambiente radicular em profundidade, fornece cálcio e enxofre, e reduz a toxidez por alumínio sem alterar o pH."
      methodology="Método Sousa et al. (2004): NG (kg/ha) = 50 × argila (%). Método EMBRAPA Soja: NG = 75 × argila (%). Método Van Raij (IAC): NG = 6 × CTC (mmolc/dm³). Critérios para gessagem: Ca < 0,5 cmolc/dm³, Al > 0,5 cmolc/dm³, ou saturação Ca/CTC < 25% na camada 20-40 cm. Fonte: EMBRAPA Cerrados, Boletim de Pesquisa nº 210."
    >
      <SelectField
        label="Método de cálculo"
        options={METHOD_OPTIONS}
        value={inputs.method}
        onChange={(v) => updateInput('method', v as never)}
        required
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Ca subsuperficial"
          unit="cmolc/dm³"
          value={inputs.Ca}
          onChange={(v) => updateInput('Ca', v as never)}
          placeholder="ex: 0.3"
          hint="Camada 20-40 cm"
          required
        />
        <InputField
          label="Mg"
          unit="cmolc/dm³"
          value={inputs.Mg}
          onChange={(v) => updateInput('Mg', v as never)}
          placeholder="ex: 0.2"
          hint="Opcional — usado no diagnóstico"
        />
        <InputField
          label="Al trocável"
          unit="cmolc/dm³"
          value={inputs.Al}
          onChange={(v) => updateInput('Al', v as never)}
          placeholder="ex: 0.8"
          hint="Opcional — toxidez"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="CTC"
          unit="cmolc/dm³"
          value={inputs.ctc}
          onChange={(v) => updateInput('ctc', v as never)}
          placeholder="ex: 8.5"
          hint={inputs.method === 'raij' ? 'Obrigatório para Van Raij' : 'Opcional'}
          required={inputs.method === 'raij'}
        />
        <InputField
          label="Argila"
          unit="%"
          value={inputs.clayPercent}
          onChange={(v) => updateInput('clayPercent', v as never)}
          placeholder="ex: 40"
          required={inputs.method !== 'raij'}
          hint="Teor de argila do laudo de solo"
        />
        <SelectField
          label="Profundidade de correção"
          options={DEPTH_OPTIONS}
          value={inputs.targetDepth}
          onChange={(v) => updateInput('targetDepth', v as never)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 200"
          required
          hint="Área total para aplicação de gesso"
        />
        <InputField
          label="Preço do gesso"
          unit="R$/tonelada"
          value={inputs.gypPrice}
          onChange={(v) => updateInput('gypPrice', v as never)}
          placeholder="ex: 250"
          hint="CIF na fazenda"
        />
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.Ca || !inputs.area} />
    </CalculatorLayout>
  )
}
