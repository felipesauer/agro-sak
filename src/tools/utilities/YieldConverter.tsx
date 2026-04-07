import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { BAG_WEIGHT_KG, SC_HA_TO_BU_AC } from '../../utils/conversions'
import { cropOptionsFrom } from '../../data/reference-data'

// ── Types ──

interface Inputs {
  crop: string
  value: string
  fromUnit: string
  customBagKg: string
}

interface Result {
  scHa: number
  kgHa: number
  tHa: number
  buAc: number | null
}

const INITIAL: Inputs = {
  crop: 'soybean',
  value: '',
  fromUnit: 'sc_ha',
  customBagKg: '60',
}

const CROP_OPTIONS = [
  ...cropOptionsFrom(BAG_WEIGHT_KG),
  { value: 'custom', label: '✦ Personalizado' },
]

const UNIT_OPTIONS = [
  { value: 'sc_ha', label: 'sc/ha' },
  { value: 'kg_ha', label: 'kg/ha' },
  { value: 't_ha', label: 't/ha' },
  { value: 'bu_ac', label: 'bushel/acre' },
]

// Average yield by state (sc/ha) — soybean reference
const STATE_AVERAGES: Record<string, number> = {
  MT: 58,
  PR: 56,
  GO: 55,
  SP: 53,
  MS: 54,
  MG: 52,
  BA: 50,
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const val = parseFloat(inputs.value)
  const bagKg = inputs.crop === 'custom' ? (parseFloat(inputs.customBagKg) || 60) : (BAG_WEIGHT_KG[inputs.crop] ?? 60)
  const buAcFactor = inputs.crop === 'custom' ? null : (SC_HA_TO_BU_AC[inputs.crop] ?? null)

  // Convert input to kg/ha first (base unit)
  let kgHa: number
  switch (inputs.fromUnit) {
    case 'sc_ha':
      kgHa = val * bagKg
      break
    case 'kg_ha':
      kgHa = val
      break
    case 't_ha':
      kgHa = val * 1000
      break
    case 'bu_ac':
      // bu/ac → sc/ha → kg/ha
      if (!buAcFactor) return null
      kgHa = (val / buAcFactor) * bagKg
      break
    default:
      return null
  }

  const scHa = kgHa / bagKg
  const tHa = kgHa / 1000
  const buAc = buAcFactor ? scHa * buAcFactor : null

  return { scHa, kgHa, tHa, buAc }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.value) return 'Informe o valor de produtividade'
  if (parseFloat(inputs.value) < 0) return 'O valor não pode ser negativo'
  if (inputs.fromUnit === 'bu_ac' && !SC_HA_TO_BU_AC[inputs.crop])
    return 'Conversão bushel/acre não disponível para esta cultura'
  return null
}

// ── Component ──

export default function YieldConverter() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Conversor de Produtividade"
      description="Converta produtividade entre sc/ha, kg/ha, t/ha e bushel/acre. Inclui médias de referência por estado."
      about="Converta produtividade entre sacas/ha, kg/ha, t/ha e bushels/acre. Inclui referências de produtividade média por estado para contextualizar seus números."
      methodology="sc/ha = kg/ha / peso_saca. t/ha = kg/ha / 1000. bu/ac soja = kg/ha × 0.0148. bu/ac milho = kg/ha × 0.01593. Referências: CONAB safra 2023/24."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Sacas por hectare"
                value={formatNumber(result.scHa, 1)}
                unit="sc/ha"
                highlight
                variant="default"
              />
              <ResultCard
                label="Quilos por hectare"
                value={formatNumber(result.kgHa, 0)}
                unit="kg/ha"
                variant="default"
              />
              <ResultCard
                label="Toneladas por hectare"
                value={formatNumber(result.tHa, 2)}
                unit="t/ha"
                variant="default"
              />
              {result.buAc !== null && (
                <ResultCard
                  label="Bushels por acre"
                  value={formatNumber(result.buAc, 1)}
                  unit="bu/ac"
                  variant="default"
                />
              )}
            </div>

            {inputs.crop === 'soybean' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Médias de produtividade de soja por estado (sc/ha)
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATE_AVERAGES).map(([state, avg]) => (
                    <span
                      key={state}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {state}: {avg} sc/ha
                    </span>
                  ))}
                </div>
              </div>
            )}
            <AlertBanner
              variant="info"
              message="A conversão bushel/acre usa o peso padrão CBOT para cada grão. Para peso diferente, ajuste a cultura personalizada."
            />
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        value={inputs.crop}
        onChange={(v) => updateInput('crop', v)}
        options={CROP_OPTIONS}
        required
        hint={inputs.crop !== 'custom' ? 'Define o peso da saca e fator de conversão bushel' : ''}
      />

      {inputs.crop === 'custom' && (
        <InputField
          label="Peso da saca"
          unit="kg"
          value={inputs.customBagKg}
          onChange={(v) => updateInput('customBagKg', v)}
          placeholder="ex: 60"
          min="1"
          required
          hint="Peso em kg de uma saca da cultura"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Valor de produtividade"
          value={inputs.value}
          onChange={(v) => updateInput('value', v)}
          placeholder="ex: 62"
          step="0.1"
          min="0"
          required
          hint="Produtividade medida ou esperada"
        />
        <SelectField
          label="Unidade"
          value={inputs.fromUnit}
          onChange={(v) => updateInput('fromUnit', v)}
          options={UNIT_OPTIONS}
          required
        />
      </div>

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.value} />
    </CalculatorLayout>
  )
}
