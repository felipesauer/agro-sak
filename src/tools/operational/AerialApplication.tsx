import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'

// ── Types ──

interface Inputs {
  area: string
  aerialCost: string
  groundCost: string
  numApplications: string
  daysSaved: string
  dailyCropLoss: string
  productCost: string
}

interface Result {
  aerialOperationTotal: number
  groundOperationTotal: number
  aerialProductTotal: number
  groundProductTotal: number
  aerialGrandTotal: number
  groundGrandTotal: number
  timeSavingsValue: number
  netSavings: number
  totalDaysSaved: number
}

const INITIAL: Inputs = {
  area: '500',
  aerialCost: '65',
  groundCost: '35',
  numApplications: '4',
  daysSaved: '3',
  dailyCropLoss: '15',
  productCost: '120',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const aerial = parseFloat(inputs.aerialCost)
  const ground = parseFloat(inputs.groundCost)
  const apps = parseFloat(inputs.numApplications)
  const days = parseFloat(inputs.daysSaved)
  const dailyLoss = parseFloat(inputs.dailyCropLoss)
  const product = parseFloat(inputs.productCost)

  const aerialOperationTotal = aerial * area * apps
  const groundOperationTotal = ground * area * apps

  // Product cost is the same for both methods
  const aerialProductTotal = product * area * apps
  const groundProductTotal = product * area * apps

  const aerialGrandTotal = aerialOperationTotal + aerialProductTotal
  const groundGrandTotal = groundOperationTotal + groundProductTotal

  const totalDaysSaved = days * apps
  const timeSavingsValue = dailyLoss * area * totalDaysSaved

  // Net savings = (ground cost - aerial cost) + time benefit
  const netSavings = (groundGrandTotal - aerialGrandTotal) + timeSavingsValue

  return {
    aerialOperationTotal,
    groundOperationTotal,
    aerialProductTotal,
    groundProductTotal,
    aerialGrandTotal,
    groundGrandTotal,
    timeSavingsValue,
    netSavings,
    totalDaysSaved,
  }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área'
  if (!inputs.aerialCost || parseFloat(inputs.aerialCost) <= 0) return 'Informe o custo da aplicação aérea'
  if (!inputs.groundCost || parseFloat(inputs.groundCost) <= 0) return 'Informe o custo da aplicação terrestre'
  if (!inputs.numApplications || parseFloat(inputs.numApplications) <= 0) return 'Informe o número de aplicações'
  return null
}

// ── Component ──

export default function AerialApplication() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Aplicação Aérea"
      description="Compare o custo da pulverização aérea versus terrestre, considerando o valor do tempo ganho."
      about="Avalie se a aplicação aérea compensa frente à terrestre. Além do custo direto, calcule o benefício econômico dos dias ganhos evitando perdas por atraso."
      methodology="Custo total = (Custo operação × Área × Aplicações) + (Custo produto × Área × Aplicações). Benefício do tempo = Dias economizados × Perda diária (R$/ha) × Área."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Total aéreo (operação)"
                value={formatCurrency(result.aerialOperationTotal)}
                unit=""
                highlight
                variant="warning"
              />
              <ResultCard
                label="Total terrestre (operação)"
                value={formatCurrency(result.groundOperationTotal)}
                unit=""
                variant="warning"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Total aéreo (com produto)"
                value={formatCurrency(result.aerialGrandTotal)}
                unit=""
                variant={result.aerialGrandTotal < result.groundGrandTotal ? 'success' : 'danger'}
              />
              <ResultCard
                label="Total terrestre (com produto)"
                value={formatCurrency(result.groundGrandTotal)}
                unit=""
                variant={result.groundGrandTotal < result.aerialGrandTotal ? 'success' : 'danger'}
              />
            </div>

            <ResultCard
              label="Dias economizados"
              value={formatNumber(result.totalDaysSaved, 0)}
              unit="dias"
            >
              <p className="text-xs text-gray-500 mt-1">
                Valor econômico do tempo: {formatCurrency(result.timeSavingsValue)}
              </p>
            </ResultCard>

            <ResultCard
              label="Resultado final (aéreo vs terrestre)"
              value={formatCurrency(Math.abs(result.netSavings))}
              unit=""
              highlight
              variant={result.netSavings > 0 ? 'success' : 'danger'}
            >
              <p className="text-xs text-gray-500 mt-1">
                {result.netSavings > 0
                  ? 'Vantagem para aplicação aérea (considerando tempo)'
                  : 'Vantagem para aplicação terrestre'}
              </p>
            </ResultCard>

            <AlertBanner
              variant={result.netSavings > 0 ? 'success' : 'info'}
              message={
                result.netSavings > 0
                  ? 'A aplicação aérea compensa quando consideramos o valor do tempo economizado.'
                  : 'A aplicação terrestre é mais econômica neste cenário. Considere aérea apenas em emergências.'
              }
            />
          </div>
        )
      }
    >
      <InputField
        label="Área total"
        unit="ha"
        value={inputs.area}
        onChange={(v) => updateInput('area', v)}
        placeholder="ex: 500"
        hint="Área total a ser pulverizada"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Custo aplicação aérea"
          prefix="R$" mask="currency" unit="R$/ha"
          value={inputs.aerialCost}
          onChange={(v) => updateInput('aerialCost', v)}
          placeholder="ex: 65"
          hint="Valor cobrado pelo aeroagrícola por hectare"
        />
        <InputField
          label="Custo aplicação terrestre"
          prefix="R$" mask="currency" unit="R$/ha"
          value={inputs.groundCost}
          onChange={(v) => updateInput('groundCost', v)}
          placeholder="ex: 35"
          hint="Custo operacional do pulverizador terrestre"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Número de aplicações"
          value={inputs.numApplications}
          onChange={(v) => updateInput('numApplications', v)}
          placeholder="ex: 4"
          hint="Quantas aplicações serão feitas na safra"
        />
        <InputField
          label="Dias economizados por aplicação"
          unit="dias"
          value={inputs.daysSaved}
          onChange={(v) => updateInput('daysSaved', v)}
          placeholder="ex: 3"
          hint="Dias ganhos com a rapidez da aplicação aérea"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Perda diária por atraso"
          prefix="R$" mask="currency" unit="R$/ha/dia"
          value={inputs.dailyCropLoss}
          onChange={(v) => updateInput('dailyCropLoss', v)}
          placeholder="ex: 15"
          hint="Valor perdido por dia de atraso na aplicação"
        />
        <InputField
          label="Custo do produto por aplicação"
          prefix="R$" mask="currency" unit="R$/ha"
          value={inputs.productCost}
          onChange={(v) => updateInput('productCost', v)}
          placeholder="ex: 120"
          hint="Custo dos defensivos/fertilizantes por hectare"
        />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
