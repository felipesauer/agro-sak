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

// ── Gypsum need criteria (EMBRAPA Cerrados) ──
// Apply gypsum when ANY of these conditions are met in the 20-40cm layer:
// - Ca < 0.5 cmolc/dm³
// - Al > 0.5 cmolc/dm³
// - Ca/CTC < 25%
// - (Ca+Mg)/Al saturation is problematic

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const Ca = parseFloat(inputs.Ca)
  const Mg = parseFloat(inputs.Mg)
  const Al = parseFloat(inputs.Al)
  const ctc = parseFloat(inputs.ctc)
  const clay = parseFloat(inputs.clayPercent)
  const area = parseFloat(inputs.area)
  const price = parseFloat(inputs.gypPrice)
  const depth = parseFloat(inputs.targetDepth)

  if (isNaN(Ca) || isNaN(area) || area <= 0) return null

  let gypsumNeedKgHa = 0
  let justified = false
  let reason = ''

  const lowCa = Ca < 0.5
  const highAl = !isNaN(Al) && Al > 0.5
  const lowCaCTC = !isNaN(ctc) && ctc > 0 && (Ca / ctc) * 100 < 25
  const lowCaMg = !isNaN(Mg) && (Ca + Mg) < 1.0

  if (lowCa || highAl || lowCaCTC || lowCaMg) {
    justified = true
    const reasons: string[] = []
    if (lowCa) reasons.push(`Ca subsuperficial baixo (${formatNumber(Ca, 1)} cmolc/dm³)`)
    if (highAl) reasons.push(`Al tóxico elevado (${formatNumber(Al, 1)} cmolc/dm³)`)
    if (lowCaCTC) reasons.push(`Saturação de Ca na CTC < 25%`)
    if (lowCaMg) reasons.push(`Ca + Mg baixo (${formatNumber(Ca + Mg, 1)} cmolc/dm³)`)
    reason = reasons.join('; ')
  } else {
    reason = 'Indicadores dentro da faixa adequada — gessagem pode ser dispensável'
  }

  switch (inputs.method) {
    case 'sousa': {
      // Sousa et al. (2004) — EMBRAPA Cerrados
      // NG (kg/ha) = 50 × argila (%)  for 20cm layer
      if (isNaN(clay) || clay <= 0) return null
      gypsumNeedKgHa = 50 * clay
      break
    }
    case 'clay': {
      // EMBRAPA Soja — simplified clay-based
      // NG (kg/ha) = 75 × argila (%) for 20cm
      if (isNaN(clay) || clay <= 0) return null
      gypsumNeedKgHa = 75 * clay
      break
    }
    case 'raij': {
      // Van Raij (1988) — IAC
      // NG (kg/ha) = 6 × CTC (mmolc/dm³)
      // Note: CTC in mmolc/dm³ (1 cmolc = 10 mmolc)
      if (isNaN(ctc) || ctc <= 0) return null
      const ctcMmolc = ctc * 10
      gypsumNeedKgHa = 6 * ctcMmolc
      break
    }
  }

  // Adjust for depth (base is 20cm)
  const depthFactor = depth / 20
  gypsumNeedKgHa = gypsumNeedKgHa * depthFactor

  const gypsumNeedTHa = gypsumNeedKgHa / 1000
  const totalTons = gypsumNeedTHa * area
  const costPerHa = gypsumNeedTHa * price
  const totalCost = costPerHa * area

  return {
    gypsumNeedKgHa,
    gypsumNeedTHa,
    totalTons,
    totalCost,
    costPerHa,
    justified,
    reason,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.Ca) return 'Informe o teor de cálcio (Ca) da camada subsuperficial'
  if (!inputs.area) return 'Informe a área em hectares'
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'A área deve ser maior que zero'
  if (inputs.method === 'raij' && !inputs.ctc) return 'O método Van Raij exige o valor da CTC'
  if ((inputs.method === 'sousa' || inputs.method === 'clay') && !inputs.clayPercent) {
    return 'Informe o teor de argila (%)'
  }
  return null
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
      <ActionButtons onCalculate={run} onClear={clear} />
    </CalculatorLayout>
  )
}
