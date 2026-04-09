import useCalculator from '../../hooks/useCalculator'
import { calculateItr, validateItr, type ItrResult } from '../../core/tax/itr'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'



// ── Types ──

interface Inputs {
  totalArea: string
  usedArea: string
  vtnPerHa: string
}



const INITIAL: Inputs = {
  totalArea: '',
  usedArea: '',
  vtnPerHa: '',
}

// ── Calculation ──

function calculate(inputs: Inputs): ItrResult | null {
  return calculateItr({
    totalArea: parseFloat(inputs.totalArea),
    usedArea: parseFloat(inputs.usedArea),
    vtnPerHa: parseFloat(inputs.vtnPerHa),
  })
}

function validate(inputs: Inputs): string | null {
  if (!inputs.totalArea) return 'Informe a área total'
  if (!inputs.usedArea) return 'Informe a área utilizada'
  if (!inputs.vtnPerHa) return 'Informe o VTN por hectare'
  return validateItr({
    totalArea: parseFloat(inputs.totalArea),
    usedArea: parseFloat(inputs.usedArea),
    vtnPerHa: parseFloat(inputs.vtnPerHa),
  })
}

// ── Component ──

export default function ITR() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, ItrResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Calculadora de ITR"
      description="Calcule o Imposto sobre a Propriedade Territorial Rural com base na área, utilização e valor da terra nua."
      about="Calcule o Imposto Territorial Rural (ITR) com base na área do imóvel, valor da terra nua (VTN) e grau de utilização. Quanto mais produtiva a terra, menor a alíquota."
      methodology="Alíquota definida pelo cruzamento: faixa de área total × grau de utilização (GU). VTNt = VTN × (Área total - Área não tributável). ITR = VTNt × Alíquota. Base: Lei 9.393/1996."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="ITR anual estimado"
                value={formatCurrency(result.itrAnnual)}
                prefix="R$" unit="R$/ano"
                highlight
                variant="danger"
              />
              <ResultCard
                label="ITR por hectare"
                value={formatCurrency(result.itrPerHa)}
                prefix="R$" unit="R$/ha"
                variant="warning"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="Grau de utilização (GU)"
                value={formatNumber(result.gu, 1)}
                unit="%"
                variant="default"
              />
              <ResultCard
                label="Classificação GU"
                value={result.guLabel}
                unit=""
                variant="default"
              />
              <ResultCard
                label="Alíquota aplicável"
                value={formatNumber(result.rate, 2)}
                unit="%"
                variant="warning"
              />
            </div>
            <AlertBanner
              variant="info"
              message="Valores estimados com base na Lei 9.393/1996 (alíquotas vigentes). O cálculo oficial depende de declaração DIAT/DITR na Receita Federal."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área total do imóvel"
          unit="ha"
          value={inputs.totalArea}
          onChange={(v) => updateInput('totalArea', v as never)}
          placeholder="ex: 1200"
          min="0"
          required
          hint="Área total registrada no imóvel rural"
        />
        <InputField
          label="Área efetivamente utilizada"
          unit="ha"
          value={inputs.usedArea}
          onChange={(v) => updateInput('usedArea', v as never)}
          placeholder="ex: 1000"
          hint="Lavoura + pastagem + reflorestamento"
          min="0"
          required
        />
      </div>

      <InputField
        label="Valor da Terra Nua (VTN)"
        prefix="R$" mask="currency" unit="R$/ha"
        value={inputs.vtnPerHa}
        onChange={(v) => updateInput('vtnPerHa', v as never)}
        placeholder="ex: 25000"
        hint="Conforme IBGE ou avaliação"
        min="0"
        required
      />

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.totalArea || !inputs.usedArea || !inputs.vtnPerHa} />
    </CalculatorLayout>
  )
}
