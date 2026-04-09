import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'
import { calculateSiloDimensioning, validateSiloDimensioning, type SiloDimensioningResult, type SiloType, GRAIN_DENSITY } from '../../core/grain/silo-dimensioning'

// ── Types ──

interface Inputs {
  type: string
  diameter: string
  height: string
  length: string
  width: string
  grainType: string
}

// ── Constants ──

const INITIAL: Inputs = {
  type: 'cylindrical',
  diameter: '',
  height: '',
  length: '',
  width: '',
  grainType: 'soybean',
}

const SILO_TYPES = [
  { value: 'cylindrical', label: 'Cilíndrico (metálico)' },
  { value: 'rectangular', label: 'Graneleiro / Armazém' },
  { value: 'bag', label: 'Silo Bolsa' },
]

const GRAIN_OPTIONS = Object.entries(GRAIN_DENSITY).map(([value, g]) => ({
  value,
  label: g.label,
}))

// ── Component ──

export default function SiloDimensioning() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, SiloDimensioningResult>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  const isCylindrical = inputs.type === 'cylindrical'
  const isBag = inputs.type === 'bag'
  const isRectangular = inputs.type === 'rectangular'

  return (
    <CalculatorLayout
      title="Dimensionamento de Silo"
      description="Calcule a capacidade de armazenagem de silos cilíndricos, graneleiros e silos bolsa em toneladas e sacas."
      about="Dimensionar corretamente o silo evita falta de espaço pós-colheita e investimento ocioso. A capacidade depende da geometria, do grão armazenado (densidade aparente) e do fator de preenchimento."
      methodology="Volume cilíndrico: π × r² × h. Graneleiro: L × W × H. Silo bolsa: seção × comprimento × 85% fill. Densidade aparente média conforme CONAB. Fator de preenchimento prático de 90%."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Capacidade"
                value={formatNumber(result.capacityTonnes, 1)}
                unit="toneladas"
                highlight
              />
              <ResultCard
                label="Volume útil"
                value={formatNumber(result.volumeM3, 1)}
                unit="m³"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Equivalente em sacas"
                value={formatNumber(result.capacityBags, 0)}
                unit="sacas"
              />
              <ResultCard
                label="Aproveitamento"
                value={formatNumber(result.fillPercent, 0)}
                unit="%"
              />
            </div>

            {result.alerts.map((a) => (
              <AlertBanner key={a} variant="info" message={a} />
            ))}
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo de silo"
          value={inputs.type}
          onChange={(v) => updateInput('type', v as never)}
          options={SILO_TYPES}
        />
        <SelectField
          label="Grão armazenado"
          value={inputs.grainType}
          onChange={(v) => updateInput('grainType', v as never)}
          options={GRAIN_OPTIONS}
        />
      </div>

      {isCylindrical && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Diâmetro"
            unit="m"
            value={inputs.diameter}
            onChange={(v) => updateInput('diameter', v as never)}
            placeholder="Ex: 12"
            min="1"
            step="0.1"
            required
            hint="Diâmetro interno do silo"
          />
          <InputField
            label="Altura útil"
            unit="m"
            value={inputs.height}
            onChange={(v) => updateInput('height', v as never)}
            placeholder="Ex: 15"
            min="1"
            step="0.1"
            required
            hint="Altura útil até a boca de saída"
          />
        </div>
      )}

      {isRectangular && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Comprimento"
            unit="m"
            value={inputs.length}
            onChange={(v) => updateInput('length', v as never)}
            placeholder="Ex: 60"
            min="1"
            step="0.1"
            required
            hint="Comprimento interno do graneleiro"
          />
          <InputField
            label="Largura"
            unit="m"
            value={inputs.width}
            onChange={(v) => updateInput('width', v as never)}
            placeholder="Ex: 30"
            min="1"
            step="0.1"
            required
            hint="Largura interna do graneleiro"
          />
          <InputField
            label="Altura útil"
            unit="m"
            value={inputs.height}
            onChange={(v) => updateInput('height', v as never)}
            placeholder="Ex: 8"
            min="1"
            step="0.1"
            required
            hint="Altura até o nível máximo de grão"
          />
        </div>
      )}

      {isBag && (
        <InputField
          label="Comprimento da bolsa"
          unit="m"
          value={inputs.length}
          onChange={(v) => updateInput('length', v as never)}
          placeholder="Ex: 60"
          min="1"
          step="1"
          required
          hint="Bolsas padrão: 60 m ou 75 m"
        />
      )}

      {error && <AlertBanner variant="error" message={error} />}

      <ActionButtons
        onCalculate={run}
        onClear={clear}
        disabled={!inputs.diameter}
      />
    </CalculatorLayout>
  )
}

// ── Logic ──

function validate(inputs: Inputs): string | null {
  return validateSiloDimensioning({
    type: inputs.type as SiloType,
    diameterM: parseFloat(inputs.diameter) || undefined,
    heightM: parseFloat(inputs.height) || undefined,
    lengthM: parseFloat(inputs.length) || undefined,
    widthM: parseFloat(inputs.width) || undefined,
    grainType: inputs.grainType,
  })
}

function calculate(inputs: Inputs): SiloDimensioningResult {
  return calculateSiloDimensioning({
    type: inputs.type as SiloType,
    diameterM: parseFloat(inputs.diameter) || undefined,
    heightM: parseFloat(inputs.height) || undefined,
    lengthM: parseFloat(inputs.length) || undefined,
    widthM: parseFloat(inputs.width) || undefined,
    grainType: inputs.grainType,
  })
}
