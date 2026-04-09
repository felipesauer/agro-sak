import { useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { MOISTURE_STANDARD, IMPURITY_STANDARD, cropOptionsFrom } from '../../data/reference-data'
import { useMoistureStandards } from '../../db/hooks'
import { calculateMoistureDiscount, validateMoistureDiscount, type MoistureDiscountResult } from '../../core/grain/moisture-discount'

// ── Types ──

interface Inputs {
  crop: string
  grossWeight: string
  moistureMeasured: string
  impurityMeasured: string
  damaged: string
  pricePerBag: string
}

const INITIAL: Inputs = {
  crop: 'soybean',
  grossWeight: '',
  moistureMeasured: '',
  impurityMeasured: '',
  damaged: '0',
  pricePerBag: '',
}

// ── Calculation ──

function calculate(inputs: Inputs, moistureStds: Record<string, number>, impurityStds: Record<string, number>): MoistureDiscountResult | null {
  const grossKg = parseFloat(inputs.grossWeight)
  const moistureMeasured = parseFloat(inputs.moistureMeasured)
  const impurityMeasured = parseFloat(inputs.impurityMeasured)
  const damaged = parseFloat(inputs.damaged) || 0
  const price = parseFloat(inputs.pricePerBag) || 0
  const moistureStd = moistureStds[inputs.crop] ?? 14
  const impurityStd = impurityStds[inputs.crop] ?? 1

  return calculateMoistureDiscount({
    grossWeightKg: grossKg,
    moistureMeasured,
    impurityMeasured,
    damagedPercent: damaged,
    pricePerBag: price,
    moistureStandard: moistureStd,
    impurityStandard: impurityStd,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.grossWeight) return 'Informe o peso bruto da carga'
  if (!inputs.moistureMeasured) return 'Informe a umidade medida'
  if (!inputs.impurityMeasured) return 'Informe a impureza medida'
  return validateMoistureDiscount({
    grossWeightKg: parseFloat(inputs.grossWeight),
    moistureMeasured: parseFloat(inputs.moistureMeasured),
    impurityMeasured: parseFloat(inputs.impurityMeasured),
  })
}

// ── Component ──

export default function MoistureDiscount() {
  const dbStandards = useMoistureStandards()
  const moistureStds = useMemo(() => {
    if (!dbStandards) return MOISTURE_STANDARD
    return Object.fromEntries(dbStandards.map(d => [d.crop, d.moisture])) as Record<string, number>
  }, [dbStandards])
  const impurityStds = useMemo(() => {
    if (!dbStandards) return IMPURITY_STANDARD
    return Object.fromEntries(dbStandards.map(d => [d.crop, d.impurity])) as Record<string, number>
  }, [dbStandards])
  const cropOptions = useMemo(() => [
    ...cropOptionsFrom(moistureStds),
    { value: 'custom', label: '✦ Personalizado' },
  ], [moistureStds])
  const calcFn = useMemo(() => (inputs: Inputs) => calculate(inputs, moistureStds, impurityStds), [moistureStds, impurityStds])
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, MoistureDiscountResult>({ initialInputs: INITIAL, calculate: calcFn, validate })

  const moistureHigh =
    inputs.crop === 'soybean' && parseFloat(inputs.moistureMeasured) > 18
  const damagedHigh = parseFloat(inputs.damaged) > 8

  return (
    <CalculatorLayout
      title="Desconto por Umidade e Impureza"
      description="Calcule os descontos de peso aplicados pela balança do armazém/trading com base na umidade, impureza e grãos ardidos."
      about="Calcule os descontos aplicados na balança por umidade e impureza acima do padrão. Saiba exatamente quanto peso líquido você receberá após os descontos."
      methodology="Desconto por umidade = Peso × (Umidade real - Umidade padrão) / (100 - Umidade padrão). Desconto por impureza = Peso × (Impureza real - Impureza padrão) / 100. Padrões conforme IN MAPA."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Peso líquido"
                value={formatNumber(result.netWeightKg, 0)}
                unit="kg"
                highlight
                variant="success"
              />
              <ResultCard
                label="Sacas líquidas"
                value={formatNumber(result.netBags, 1)}
                unit="sc"
                highlight
                variant="success"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                Decomposição dos descontos
              </p>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Desconto por umidade</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatNumber(result.moistureDiscountKg, 1)} kg
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Desconto por impureza</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatNumber(result.impurityDiscountKg, 1)} kg
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Desconto por ardidos</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatNumber(result.damagedDiscountKg, 1)} kg
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            {parseFloat(inputs.pricePerBag) > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Valor total da carga"
                  value={formatCurrency(result.totalValue)}
                  variant="success"
                />
                <ResultCard label="Perda nos descontos" value={formatCurrency(result.lossValue)} variant="danger">
                  <p className="text-xs text-red-500 mt-1">
                    Você perdeu {formatCurrency(result.lossValue)} pelos descontos
                  </p>
                </ResultCard>
              </div>
            )}
          </div>
        )
      }
    >
      <SelectField
        label="Cultura"
        value={inputs.crop}
        onChange={(v) => updateInput('crop', v)}
        options={cropOptions}
        required
      />

      <InputField
        label="Peso bruto da carga"
        unit="kg"
        value={inputs.grossWeight}
        onChange={(v) => updateInput('grossWeight', v)}
        placeholder="ex: 27000"
        min="0"
        required
        hint="Peso total da carga na balança"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Umidade medida"
          unit="%"
          value={inputs.moistureMeasured}
          onChange={(v) => updateInput('moistureMeasured', v)}
          placeholder="ex: 16.5"
          step="0.1"
          min="0"
          max="40"
          required
          hint={`Padrão: ${MOISTURE_STANDARD[inputs.crop] ?? 14}%`}
        />
        <InputField
          label="Impureza medida"
          unit="%"
          value={inputs.impurityMeasured}
          onChange={(v) => updateInput('impurityMeasured', v)}
          placeholder="ex: 2.2"
          step="0.1"
          min="0"
          max="30"
          required
          hint={`Padrão: ${IMPURITY_STANDARD[inputs.crop] ?? 1}%`}
        />
      </div>

      <InputField
        label="Grãos ardidos"
        unit="%"
        value={inputs.damaged}
        onChange={(v) => updateInput('damaged', v)}
        placeholder="ex: 0.5"
        step="0.1"
        min="0"
        max="20"
        hint="Percentual de grãos com alteração de cor"
      />

      <InputField
        label="Preço de referência"
        prefix="R$" mask="currency" unit="R$/sc"
        value={inputs.pricePerBag}
        onChange={(v) => updateInput('pricePerBag', v)}
        placeholder="ex: 115"
        step="0.01"
        min="0"
        hint="Opcional — para calcular perda em R$"
      />

      {moistureHigh && (
        <div className="mt-3">
          <AlertBanner
            variant="error"
            message="Umidade acima de 18% para soja — muitos armazéns recusam a carga nessa condição."
          />
        </div>
      )}

      {damagedHigh && (
        <div className="mt-3">
          <AlertBanner
            variant="warning"
            message="Ardidos acima de 8% — a carga pode ser rejeitada pelo armazém."
          />
        </div>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.grossWeight || !inputs.moistureMeasured} />
    </CalculatorLayout>
  )
}
