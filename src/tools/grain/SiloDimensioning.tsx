import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  type: string
  diameter: string
  height: string
  length: string
  width: string
  grainType: string
}

interface Result {
  volumeM3: number
  capacityTonnes: number
  capacityBags: number
  fillPercent: number
  alerts: string[]
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

// Bulk density of grains (t/m³) — average values from CONAB
const GRAIN_DENSITY: Record<string, { density: number; label: string; bagKg: number }> = {
  soybean: { density: 0.72, label: 'Soja', bagKg: 60 },
  corn: { density: 0.73, label: 'Milho', bagKg: 60 },
  wheat: { density: 0.78, label: 'Trigo', bagKg: 60 },
  rice: { density: 0.58, label: 'Arroz', bagKg: 50 },
  sorghum: { density: 0.72, label: 'Sorgo', bagKg: 60 },
  cotton_seed: { density: 0.40, label: 'Caroço de algodão', bagKg: 60 },
  coffee: { density: 0.40, label: 'Café beneficiado', bagKg: 60 },
  bean: { density: 0.78, label: 'Feijão', bagKg: 60 },
}

const GRAIN_OPTIONS = Object.entries(GRAIN_DENSITY).map(([value, g]) => ({
  value,
  label: g.label,
}))

// Practical fill factor — you can't fill 100% of the geometric volume
const FILL_FACTOR = 0.90

// Silo bolsa standard dimensions
const BAG_DIAMETER_M = 2.74 // 9 feet standard
const BAG_CROSS_SECTION_M2 = Math.PI * (BAG_DIAMETER_M / 2) ** 2 * 0.85 // ~85% fill

// ── Component ──

export default function SiloDimensioning() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
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
  const { type } = inputs

  if (type === 'cylindrical') {
    const d = parseFloat(inputs.diameter)
    const h = parseFloat(inputs.height)
    if (isNaN(d) || d <= 0) return 'Informe o diâmetro do silo'
    if (isNaN(h) || h <= 0) return 'Informe a altura útil do silo'
    if (d > 50) return 'Diâmetro acima de 50 m — verifique o valor'
    if (h > 40) return 'Altura acima de 40 m — verifique o valor'
  } else if (type === 'rectangular') {
    const l = parseFloat(inputs.length)
    const w = parseFloat(inputs.width)
    const h = parseFloat(inputs.height)
    if (isNaN(l) || l <= 0) return 'Informe o comprimento'
    if (isNaN(w) || w <= 0) return 'Informe a largura'
    if (isNaN(h) || h <= 0) return 'Informe a altura útil'
  } else if (type === 'bag') {
    const l = parseFloat(inputs.length)
    if (isNaN(l) || l <= 0) return 'Informe o comprimento da bolsa'
  }

  return null
}

function calculate(inputs: Inputs): Result {
  const grain = GRAIN_DENSITY[inputs.grainType] ?? GRAIN_DENSITY.soybean
  const alerts: string[] = []
  let volumeGross = 0

  if (inputs.type === 'cylindrical') {
    const r = parseFloat(inputs.diameter) / 2
    const h = parseFloat(inputs.height)
    volumeGross = Math.PI * r ** 2 * h
  } else if (inputs.type === 'rectangular') {
    const l = parseFloat(inputs.length)
    const w = parseFloat(inputs.width)
    const h = parseFloat(inputs.height)
    volumeGross = l * w * h
  } else {
    // Silo bolsa
    const l = parseFloat(inputs.length)
    volumeGross = BAG_CROSS_SECTION_M2 * l / FILL_FACTOR // will multiply by FILL_FACTOR below
  }

  const volumeM3 = volumeGross * FILL_FACTOR
  const capacityTonnes = volumeM3 * grain.density
  const capacityBags = (capacityTonnes * 1000) / grain.bagKg
  const fillPercent = FILL_FACTOR * 100

  if (inputs.type === 'bag') {
    const bags60 = Math.floor(capacityTonnes / 200) // ~200t per 60m bag
    if (bags60 < 1) {
      alerts.push(`Capacidade estimada: ${formatNumber(capacityTonnes, 0)} t de ${grain.label.toLowerCase()}. `)
    }
    alerts.push(`Silo bolsa padrão 9 pés (${formatNumber(BAG_DIAMETER_M, 2)} m). O preenchimento real depende da compactação da ensacadora.`)
  }

  if (capacityTonnes > 5000) {
    alerts.push('Capacidade acima de 5.000 t. Para grandes unidades armazenadoras, considere projeto estrutural completo.')
  }

  return { volumeM3, capacityTonnes, capacityBags, fillPercent, alerts }
}
