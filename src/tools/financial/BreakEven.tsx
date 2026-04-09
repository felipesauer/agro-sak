import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import { calculateBreakEven, validateBreakEven, type BreakEvenResult, type BreakEvenMode } from '../../core/financial/break-even'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency, formatPercent } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  mode: BreakEvenMode
  costPerHa: string
  sacPrice: string
  expectedYield: string
}

const MODE_OPTIONS = [
  { value: 'yield', label: 'Produtividade mínima (sc/ha)' },
  { value: 'price', label: 'Preço mínimo (R$/sc)' },
]

const INITIAL: Inputs = {
  mode: 'yield',
  costPerHa: '4200',
  sacPrice: '115',
  expectedYield: '65',
}

// ── Calculation ──

function calculate(inputs: Inputs): BreakEvenResult | null {
  return calculateBreakEven({
    mode: inputs.mode,
    costPerHa: parseFloat(inputs.costPerHa),
    sacPrice: parseFloat(inputs.sacPrice) || 0,
    expectedYield: parseFloat(inputs.expectedYield) || 0,
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.costPerHa || isNaN(parseFloat(inputs.costPerHa))) return 'Informe o custo total por hectare'
  return validateBreakEven({
    mode: inputs.mode,
    costPerHa: parseFloat(inputs.costPerHa),
    sacPrice: parseFloat(inputs.sacPrice) || 0,
    expectedYield: parseFloat(inputs.expectedYield) || 0,
  })
}

// ── Component ──

export default function BreakEven() {
  const [mode, setMode] = useState<BreakEvenMode>('yield')

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, BreakEvenResult>({ initialInputs: INITIAL, calculate, validate })

  const handleModeChange = (value: string) => {
    setMode(value as BreakEvenMode)
    updateInput('mode', value as BreakEvenMode)
  }

  return (
    <CalculatorLayout
      title="Ponto de Equilíbrio (Break-even)"
      description="Descubra a produtividade mínima ou o preço mínimo de venda para cobrir todos os custos."
      about="Descubra a produtividade mínima necessária para cobrir todos os custos, ou o preço mínimo de venda que evita prejuízo. Fundamental para tomada de decisão de venda."
      methodology="Break-even por produtividade: sc/ha = Custo total (R$/ha) / Preço (R$/sc). Break-even por preço: R$/sc = Custo total / Produtividade esperada."
      result={
        result && (
          <div className="space-y-4">
            {result.breakEvenYield !== null && (
              <ResultCard
                label="Produtividade mínima (break-even)"
                value={formatNumber(result.breakEvenYield, 1)}
                unit="sc/ha"
                highlight
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Você precisa colher pelo menos {formatNumber(result.breakEvenYield, 1)} sc/ha para pagar todos os custos
                </p>
              </ResultCard>
            )}

            {result.breakEvenPrice !== null && (
              <ResultCard
                label="Preço mínimo de venda (break-even)"
                value={formatCurrency(result.breakEvenPrice)}
                unit="/sc"
                highlight
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Você precisa vender a pelo menos {formatCurrency(result.breakEvenPrice)}/sc para não ter prejuízo
                </p>
              </ResultCard>
            )}

            {result.safetyMargin !== null && (
              <ResultCard
                label="Margem de segurança"
                value={formatPercent(result.safetyMargin)}
                unit=""
                variant={result.safetyMargin >= 20 ? 'success' : result.safetyMargin >= 0 ? 'warning' : 'danger'}
              >
                <p className="text-xs text-gray-500 mt-1">
                  {result.safetyMargin > 0
                    ? `Você pode ter uma queda de até ${formatPercent(result.safetyMargin)} sem prejuízo`
                    : 'A operação está no prejuízo com os valores informados'}
                </p>
              </ResultCard>
            )}

            {result.safetyMargin !== null && (
              <AlertBanner
                variant={result.safetyMargin >= 20 ? 'success' : result.safetyMargin >= 0 ? 'warning' : 'error'}
                message={
                  result.safetyMargin >= 20
                    ? 'Boa margem de segurança — acima de 20%.'
                    : result.safetyMargin >= 0
                      ? 'Margem apertada — atenção com variações de preço e clima.'
                      : 'Resultado negativo — custo supera a receita com os valores informados.'
                }
              />
            )}
          </div>
        )
      }
    >
      <SelectField
        label="Modo de cálculo"
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
      />

      <InputField
        label="Custo total de produção"
        prefix="R$" mask="currency" unit="R$/ha"
        value={inputs.costPerHa}
        onChange={(v) => updateInput('costPerHa', v)}
        placeholder="ex: 4200"
        step="10"
        required
        hint="Soma de todos os gastos para produzir um hectare"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Preço de venda da saca"
          prefix="R$" mask="currency" unit="R$/sc"
          value={inputs.sacPrice}
          onChange={(v) => updateInput('sacPrice', v)}
          placeholder="ex: 115"
          step="0.01"
          required={mode === 'yield'}
          hint={mode === 'price' ? 'Opcional — para margem de segurança' : undefined}
        />
        <InputField
          label="Produtividade esperada"
          unit="sc/ha"
          value={inputs.expectedYield}
          onChange={(v) => updateInput('expectedYield', v)}
          placeholder="ex: 65"
          required={mode === 'price'}
          hint={mode === 'yield' ? 'Opcional — para margem de segurança' : undefined}
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.costPerHa} />
    </CalculatorLayout>
  )
}
