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
  seedRate: string
  seedPrice: string
  fertilizerRate: string
  fertilizerPrice: string
  herbicideRate: string
  herbicidePrice: string
  insecticideRate: string
  insecticidePrice: string
  fungicideRate: string
  fungicidePrice: string
  safetyMargin: string
}

interface InputItem {
  name: string
  qty: number
  unit: string
  cost: number
}

interface Result {
  items: InputItem[]
  subtotal: number
  marginValue: number
  grandTotal: number
  marginPercent: number
}

const INITIAL: Inputs = {
  area: '200',
  seedRate: '60',
  seedPrice: '6.50',
  fertilizerRate: '350',
  fertilizerPrice: '3200',
  herbicideRate: '2.5',
  herbicidePrice: '85',
  insecticideRate: '0.8',
  insecticidePrice: '120',
  fungicideRate: '0.5',
  fungicidePrice: '180',
  safetyMargin: '10',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const margin = parseFloat(inputs.safetyMargin) || 0

  const items: InputItem[] = []

  // Seeds (kg)
  const seedRate = parseFloat(inputs.seedRate) || 0
  const seedPrice = parseFloat(inputs.seedPrice) || 0
  if (seedRate > 0) {
    const qty = seedRate * area
    items.push({ name: 'Semente', qty, unit: 'kg', cost: qty * seedPrice })
  }

  // Fertilizer (kg, price per ton)
  const fertRate = parseFloat(inputs.fertilizerRate) || 0
  const fertPrice = parseFloat(inputs.fertilizerPrice) || 0
  if (fertRate > 0) {
    const qty = fertRate * area
    items.push({ name: 'Fertilizante', qty, unit: 'kg', cost: qty * (fertPrice / 1000) })
  }

  // Herbicide (L)
  const herbRate = parseFloat(inputs.herbicideRate) || 0
  const herbPrice = parseFloat(inputs.herbicidePrice) || 0
  if (herbRate > 0) {
    const qty = herbRate * area
    items.push({ name: 'Herbicida', qty, unit: 'L', cost: qty * herbPrice })
  }

  // Insecticide (L)
  const insRate = parseFloat(inputs.insecticideRate) || 0
  const insPrice = parseFloat(inputs.insecticidePrice) || 0
  if (insRate > 0) {
    const qty = insRate * area
    items.push({ name: 'Inseticida', qty, unit: 'L', cost: qty * insPrice })
  }

  // Fungicide (L)
  const funRate = parseFloat(inputs.fungicideRate) || 0
  const funPrice = parseFloat(inputs.fungicidePrice) || 0
  if (funRate > 0) {
    const qty = funRate * area
    items.push({ name: 'Fungicida', qty, unit: 'L', cost: qty * funPrice })
  }

  const subtotal = items.reduce((sum, i) => sum + i.cost, 0)
  const marginValue = subtotal * (margin / 100)
  const grandTotal = subtotal + marginValue

  return { items, subtotal, marginValue, grandTotal, marginPercent: margin }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area || parseFloat(inputs.area) <= 0) return 'Informe a área'
  const hasAny =
    (parseFloat(inputs.seedRate) || 0) > 0 ||
    (parseFloat(inputs.fertilizerRate) || 0) > 0 ||
    (parseFloat(inputs.herbicideRate) || 0) > 0 ||
    (parseFloat(inputs.insecticideRate) || 0) > 0 ||
    (parseFloat(inputs.fungicideRate) || 0) > 0
  if (!hasAny) return 'Informe ao menos um insumo'
  return null
}

// ── Component ──

export default function InputInventory() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Estoque de Insumos"
      description="Calcule a quantidade e o custo total de insumos necessários para a safra."
      about="Planeje a compra de todos os insumos da safra de uma vez. Calcule quantidades totais de semente, fertilizante e defensivos, com margem de segurança para imprevistos."
      methodology="Quantidade total = Dose (kg ou L/ha) × Área (ha). Custo = Quantidade × Preço unitário. Margem de segurança aplicada sobre o total."
      result={
        result && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Insumo</th>
                    <th className="text-center py-2 px-2">Quantidade</th>
                    <th className="text-right py-2 px-2">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.name} className="border-b border-gray-100">
                      <td className="py-2 px-2 font-medium">{item.name}</td>
                      <td className="text-center py-2 px-2">
                        {formatNumber(item.qty, 0)} {item.unit}
                      </td>
                      <td className="text-right py-2 px-2">{formatCurrency(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ResultCard
              label="Subtotal"
              value={formatCurrency(result.subtotal)}
              unit=""
            />

            <ResultCard
              label={`Margem de segurança (${formatNumber(result.marginPercent, 0)}%)`}
              value={formatCurrency(result.marginValue)}
              unit=""
            />

            <ResultCard
              label="Total com margem"
              value={formatCurrency(result.grandTotal)}
              unit=""
              highlight
              variant="warning"
            >
              <p className="text-xs text-gray-500 mt-1">
                Investimento total estimado para {inputs.area} ha
              </p>
            </ResultCard>

            <AlertBanner
              variant="info"
              message="Considere negociar compras antecipadas e em volume para obter melhores preços."
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
        placeholder="ex: 200"
        hint="Área total de plantio na safra"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Taxa de semeadura"
          unit="kg/ha"
          value={inputs.seedRate}
          onChange={(v) => updateInput('seedRate', v)}
          placeholder="ex: 60"
          hint="Quantidade de semente por hectare"
        />
        <InputField
          label="Preço da semente"
          prefix="R$" mask="currency" unit="R$/kg"
          value={inputs.seedPrice}
          onChange={(v) => updateInput('seedPrice', v)}
          placeholder="ex: 6.50"
          hint="Preço por kg de semente"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Dose de fertilizante"
          unit="kg/ha"
          value={inputs.fertilizerRate}
          onChange={(v) => updateInput('fertilizerRate', v)}
          placeholder="ex: 350"
          hint="Quantidade de adubo por hectare"
        />
        <InputField
          label="Preço do fertilizante"
          prefix="R$" mask="currency" unit="R$/t"
          value={inputs.fertilizerPrice}
          onChange={(v) => updateInput('fertilizerPrice', v)}
          placeholder="ex: 3200"
          hint="Preço por tonelada de fertilizante"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Dose de herbicida"
          unit="L/ha"
          value={inputs.herbicideRate}
          onChange={(v) => updateInput('herbicideRate', v)}
          placeholder="ex: 2.5"
          hint="Volume de herbicida por hectare"
        />
        <InputField
          label="Preço do herbicida"
          prefix="R$" mask="currency" unit="R$/L"
          value={inputs.herbicidePrice}
          onChange={(v) => updateInput('herbicidePrice', v)}
          placeholder="ex: 85"
          hint="Preço por litro de herbicida"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Dose de inseticida"
          unit="L/ha"
          value={inputs.insecticideRate}
          onChange={(v) => updateInput('insecticideRate', v)}
          placeholder="ex: 0.8"
          hint="Volume de inseticida por hectare"
        />
        <InputField
          label="Preço do inseticida"
          prefix="R$" mask="currency" unit="R$/L"
          value={inputs.insecticidePrice}
          onChange={(v) => updateInput('insecticidePrice', v)}
          placeholder="ex: 120"
          hint="Preço por litro de inseticida"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Dose de fungicida"
          unit="L/ha"
          value={inputs.fungicideRate}
          onChange={(v) => updateInput('fungicideRate', v)}
          placeholder="ex: 0.5"
          hint="Volume de fungicida por hectare"
        />
        <InputField
          label="Preço do fungicida"
          prefix="R$" mask="currency" unit="R$/L"
          value={inputs.fungicidePrice}
          onChange={(v) => updateInput('fungicidePrice', v)}
          placeholder="ex: 180"
          hint="Preço por litro de fungicida"
        />
      </div>

      <InputField
        label="Margem de segurança"
        unit="%"
        value={inputs.safetyMargin}
        onChange={(v) => updateInput('safetyMargin', v)}
        placeholder="ex: 10"
        hint="Percentual extra para imprevistos e perdas"
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
