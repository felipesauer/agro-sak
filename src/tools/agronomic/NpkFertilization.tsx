import useCalculator from '../../hooks/useCalculator'
import { calculateNpkFertilization, validateNpkFertilization, type NpkFertilizationResult } from '../../core/agronomic/npk-fertilization'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  crop: string
  texture: string
  pSoil: string
  kSoil: string
  organicMatter: string
  inoculated: string
  customN: string
  customP: string
  customK: string
}

const INITIAL: Inputs = {
  crop: 'soybean',
  texture: 'clay',
  pSoil: '',
  kSoil: '',
  organicMatter: '',
  inoculated: 'yes',
  customN: '',
  customP: '',
  customK: '',
}

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn', label: 'Milho' },
  { value: 'cotton', label: 'Algodão' },
  { value: 'bean', label: 'Feijão' },
  { value: 'custom', label: '✦ Personalizado' },
]

const TEXTURE_OPTIONS = [
  { value: 'sandy', label: 'Arenoso (<15% argila)' },
  { value: 'medium', label: 'Médio (15–35% argila)' },
  { value: 'clay', label: 'Argiloso (>35% argila)' },
]

const INOC_OPTIONS = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
]

// ── Calculation ──

function calculate(inputs: Inputs): NpkFertilizationResult | null {
  return calculateNpkFertilization({
    crop: inputs.crop,
    texture: inputs.texture,
    pSoil: parseFloat(inputs.pSoil) || 0,
    kSoil: parseFloat(inputs.kSoil) || 0,
    inoculated: inputs.inoculated === 'yes',
    customN: inputs.customN ? parseFloat(inputs.customN) : undefined,
    customP: inputs.customP ? parseFloat(inputs.customP) : undefined,
    customK: inputs.customK ? parseFloat(inputs.customK) : undefined,
  })
}

function validate(inputs: Inputs): string | null {
  return validateNpkFertilization({
    crop: inputs.crop,
    texture: inputs.texture,
    pSoil: parseFloat(inputs.pSoil) || 0,
    kSoil: parseFloat(inputs.kSoil) || 0,
    inoculated: inputs.inoculated === 'yes',
    customN: inputs.customN ? parseFloat(inputs.customN) : undefined,
    customP: inputs.customP ? parseFloat(inputs.customP) : undefined,
    customK: inputs.customK ? parseFloat(inputs.customK) : undefined,
  })
}

// ── Component ──

export default function NpkFertilization() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, NpkFertilizationResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Adubação NPK"
      description="Recomendação de N, P₂O₅ e K₂O com base no laudo de solo e cultura. Simplificado a partir de tabelas EMBRAPA/Cerrado."
      about="A adubação NPK repõe os nutrientes essenciais do solo — nitrogênio (N), fósforo (P₂O₅) e potássio (K₂O) — de acordo com a demanda da cultura e a disponibilidade no solo. A recomendação é baseada na classificação dos teores de P e K do laudo de análise de solo em faixas (muito baixo a muito alto)."
      methodology="Classificação de P por textura do solo e K por faixas universais (EMBRAPA Cerrados). Dose de N conforme cultura e inoculação. Formulações comerciais sugeridas por otimização de atendimento à demanda de P₂O₅ e K₂O. Fontes: Boletim Técnico EMBRAPA Cerrados, CFSEMG."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard label="Nitrogênio (N)" value={formatNumber(result.nRec, 0)} unit="kg/ha" variant="default" />
              <ResultCard label="Fósforo (P₂O₅)" value={formatNumber(result.pRec, 0)} unit="kg/ha" highlight variant="default" />
              <ResultCard label="Potássio (K₂O)" value={formatNumber(result.kRec, 0)} unit="kg/ha" highlight variant="default" />
            </div>

            <div className="flex gap-4 text-sm">
              <span>P no solo: <strong className="text-agro-700">{result.pLevel}</strong></span>
              <span>K no solo: <strong className="text-agro-700">{result.kLevel}</strong></span>
            </div>

            {result.formulas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Formulações sugeridas</h3>
                <ComparisonTable
                  columns={[
                    { key: 'formula', label: 'Fórmula' },
                    { key: 'kgPerHa', label: 'kg/ha', format: (v) => formatNumber(v as number, 0) },
                    { key: 'bagsPerHa', label: 'sc 50kg/ha', format: (v) => formatNumber(v as number, 1) },
                    { key: 'nSupplied', label: 'N (kg)', format: (v) => formatNumber(v as number, 0) },
                    { key: 'pSupplied', label: 'P₂O₅ (kg)', format: (v) => formatNumber(v as number, 0) },
                    { key: 'kSupplied', label: 'K₂O (kg)', format: (v) => formatNumber(v as number, 0) },
                  ]}
                  rows={result.formulas}
                  highlightIndex={0}
                  rowKey="formula"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A primeira formulação é a melhor aproximação. Ajustes finos devem ser feitos por um agrônomo.
                </p>
              </div>
            )}

            {result.nRec === 0 && inputs.crop === 'soybean' && (
              <AlertBanner
                variant="info"
                message="Soja com inoculação de Bradyrhizobium não necessita adubação nitrogenada de base."
              />
            )}
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={inputs.crop}
          onChange={(v) => updateInput('crop', v as never)}
        />
        {inputs.crop !== 'custom' && (
          <SelectField
            label="Textura do solo"
            options={TEXTURE_OPTIONS}
            value={inputs.texture}
            onChange={(v) => updateInput('texture', v as never)}
          />
        )}
      </div>

      {inputs.crop === 'custom' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="N alvo"
            unit="kg/ha"
            value={inputs.customN}
            onChange={(v) => updateInput('customN', v as never)}
            placeholder="ex: 120"
            min="0"
            hint="Dose desejada de nitrogênio"
          />
          <InputField
            label="P₂O₅ alvo"
            unit="kg/ha"
            value={inputs.customP}
            onChange={(v) => updateInput('customP', v as never)}
            placeholder="ex: 90"
            min="0"
            hint="Dose desejada de fósforo"
          />
          <InputField
            label="K₂O alvo"
            unit="kg/ha"
            value={inputs.customK}
            onChange={(v) => updateInput('customK', v as never)}
            placeholder="ex: 60"
            min="0"
            hint="Dose desejada de potássio"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Fósforo no solo (P Mehlich)"
          unit="mg/dm³"
          value={inputs.pSoil}
          onChange={(v) => updateInput('pSoil', v as never)}
          placeholder="ex: 12"
          hint="Resultado do laudo de solo"
          min="0"
          step="0.1"
          required
        />
        <InputField
          label="Potássio no solo (K)"
          unit="mg/dm³"
          value={inputs.kSoil}
          onChange={(v) => updateInput('kSoil', v as never)}
          placeholder="ex: 90"
          hint="Resultado do laudo de solo"
          min="0"
          step="0.1"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Matéria orgânica (opcional)"
          unit="%"
          value={inputs.organicMatter}
          onChange={(v) => updateInput('organicMatter', v as never)}
          placeholder="ex: 2.5"
          min="0"
          max="15"
          step="0.1"
          hint="Dados do laudo de solo"
        />
        {(inputs.crop === 'soybean' || inputs.crop === 'bean') && (
          <SelectField
            label="Vai inocular com rizóbio?"
            options={INOC_OPTIONS}
            value={inputs.inoculated}
            onChange={(v) => updateInput('inoculated', v as never)}
          />
        )}
      </div>
        </>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={inputs.crop !== 'custom' ? (!inputs.pSoil || !inputs.kSoil) : (!inputs.customN && !inputs.customP && !inputs.customK)} />
    </CalculatorLayout>
  )
}
