import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { calculateHarvestCost, validateHarvestCost, type HarvestCostResult } from '../../core/operational/harvest-cost'

// ── Types ──

interface Inputs {
  area: string
  purchasePrice: string
  usefulLife: string
  hoursPerYear: string
  fuelConsumption: string
  dieselPrice: string
  operatorSalary: string
  maintenancePercent: string
  thirdPartyPrice: string
  productivity: string
}

const INITIAL: Inputs = {
  area: '500',
  purchasePrice: '850000',
  usefulLife: '10',
  hoursPerYear: '600',
  fuelConsumption: '25',
  dieselPrice: '6.50',
  operatorSalary: '4500',
  maintenancePercent: '5',
  thirdPartyPrice: '250',
  productivity: '60',
}

// ── Calculation ──

function calculate(inputs: Inputs): HarvestCostResult | null {
  return calculateHarvestCost({
    areaHa: parseFloat(inputs.area),
    purchasePrice: parseFloat(inputs.purchasePrice),
    usefulLifeYears: parseFloat(inputs.usefulLife),
    hoursPerYear: parseFloat(inputs.hoursPerYear),
    fuelConsumptionLPerH: parseFloat(inputs.fuelConsumption),
    dieselPricePerL: parseFloat(inputs.dieselPrice),
    operatorMonthlySalary: parseFloat(inputs.operatorSalary),
    maintenancePercent: parseFloat(inputs.maintenancePercent),
    thirdPartyPricePerHa: parseFloat(inputs.thirdPartyPrice),
    productivityScHa: parseFloat(inputs.productivity),
  })
}

function validate(inputs: Inputs): string | null {
  return validateHarvestCost({
    areaHa: parseFloat(inputs.area),
    purchasePrice: parseFloat(inputs.purchasePrice),
    usefulLifeYears: parseFloat(inputs.usefulLife),
    hoursPerYear: parseFloat(inputs.hoursPerYear),
    fuelConsumptionLPerH: parseFloat(inputs.fuelConsumption),
    dieselPricePerL: parseFloat(inputs.dieselPrice),
    operatorMonthlySalary: parseFloat(inputs.operatorSalary),
    maintenancePercent: parseFloat(inputs.maintenancePercent),
    thirdPartyPricePerHa: parseFloat(inputs.thirdPartyPrice),
    productivityScHa: parseFloat(inputs.productivity),
  })
}

// ── Component ──

export default function HarvestCost() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, HarvestCostResult>({ initialInputs: INITIAL, calculate, validate })

  return (
    <CalculatorLayout
      title="Custo de Colheita"
      description="Compare o custo de colheita própria versus terceirizada e descubra a área mínima para viabilizar máquina própria."
      about="Compare colheita própria versus terceirizada considerando depreciação, combustível, mão de obra e manutenção. Descubra a área mínima para justificar a compra da colhedora."
      methodology="Custo próprio/ha = (Depreciação anual + Manutenção + Mão de obra) / Área + Combustível/ha. Break-even = Custos fixos anuais / (Preço terceiro − Custo variável/ha)."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo próprio"
                value={formatCurrency(result.ownCostPerHa)}
                unit="/ha"
                highlight
                variant={result.ownCostPerHa < result.thirdPartyCostPerHa ? 'success' : 'danger'}
              />
              <ResultCard
                label="Custo terceirizado"
                value={formatCurrency(result.thirdPartyCostPerHa)}
                unit="/ha"
                variant={result.thirdPartyCostPerHa < result.ownCostPerHa ? 'success' : 'danger'}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Custo próprio por saca"
                value={formatCurrency(result.ownCostPerSac)}
                unit="/sc"
              />
              <ResultCard
                label="Custo terceiro por saca"
                value={formatCurrency(result.thirdPartyCostPerSac)}
                unit="/sc"
              />
            </div>

            <ResultCard
              label="Composição do custo próprio"
              value={formatCurrency(result.ownCostPerHa)}
              unit="/ha"
            >
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                <p>Depreciação: {formatCurrency(result.depreciation)}/ha</p>
                <p>Combustível: {formatCurrency(result.fuelCostPerHa)}/ha</p>
                <p>Mão de obra: {formatCurrency(result.laborCostPerHa)}/ha</p>
                <p>Manutenção: {formatCurrency(result.maintenanceCostPerHa)}/ha</p>
              </div>
            </ResultCard>

            <ResultCard
              label="Economia por hectare"
              value={formatCurrency(Math.abs(result.savingsPerHa))}
              unit="/ha"
              variant={result.savingsPerHa > 0 ? 'success' : 'danger'}
            >
              <p className="text-xs text-gray-500 mt-1">
                {result.savingsPerHa > 0
                  ? `Economia total: ${formatCurrency(result.savingsTotal)} com colheita própria`
                  : `Prejuízo total: ${formatCurrency(Math.abs(result.savingsTotal))} com colheita própria`}
              </p>
            </ResultCard>

            {result.breakEvenArea > 0 && (
              <ResultCard
                label="Área mínima para viabilizar (break-even)"
                value={formatNumber(result.breakEvenArea, 0)}
                unit="ha"
                variant="warning"
              >
                <p className="text-xs text-gray-500 mt-1">
                  A partir de {formatNumber(result.breakEvenArea, 0)} ha, a colheita própria se paga
                </p>
              </ResultCard>
            )}

            <AlertBanner
              variant={result.savingsPerHa > 0 ? 'success' : 'warning'}
              message={
                result.savingsPerHa > 0
                  ? 'Colheita própria é mais vantajosa para essa área.'
                  : 'Terceirizar é mais econômico para essa área. Considere prestar serviço para diluir custos fixos.'
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
        hint="Área total colhida na safra"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Valor da colhedora"
          prefix="R$" mask="currency"
          value={inputs.purchasePrice}
          onChange={(v) => updateInput('purchasePrice', v)}
          placeholder="ex: 850000"
          hint="Preço de compra da máquina nova ou usada"
        />
        <InputField
          label="Vida útil"
          unit="anos"
          value={inputs.usefulLife}
          onChange={(v) => updateInput('usefulLife', v)}
          placeholder="ex: 10"
          hint="Vida útil estimada da colhedora"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Horas trabalhadas por ano"
          unit="h/ano"
          value={inputs.hoursPerYear}
          onChange={(v) => updateInput('hoursPerYear', v)}
          placeholder="ex: 600"
          hint="Total de horas de colheita por safra"
        />
        <InputField
          label="Consumo de combustível"
          unit="L/h"
          value={inputs.fuelConsumption}
          onChange={(v) => updateInput('fuelConsumption', v)}
          placeholder="ex: 25"
          hint="Consumo médio de diesel da colhedora"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Preço do diesel"
          prefix="R$" mask="currency" unit="R$/L"
          value={inputs.dieselPrice}
          onChange={(v) => updateInput('dieselPrice', v)}
          placeholder="ex: 6.50"
          hint="Preço atual do litro de diesel"
        />
        <InputField
          label="Salário do operador"
          prefix="R$" mask="currency" unit="R$/mês"
          value={inputs.operatorSalary}
          onChange={(v) => updateInput('operatorSalary', v)}
          placeholder="ex: 4500"
          hint="Salário mensal com encargos"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Manutenção"
          unit="% ao ano"
          value={inputs.maintenancePercent}
          onChange={(v) => updateInput('maintenancePercent', v)}
          placeholder="ex: 5"
          hint="Percentual do valor da máquina gasto em manutenção/ano"
        />
        <InputField
          label="Preço da colheita terceirizada"
          prefix="R$" mask="currency" unit="R$/ha"
          value={inputs.thirdPartyPrice}
          onChange={(v) => updateInput('thirdPartyPrice', v)}
          placeholder="ex: 250"
          hint="Valor cobrado por hectare pelo prestador"
        />
      </div>

      <InputField
        label="Produtividade"
        unit="sc/ha"
        value={inputs.productivity}
        onChange={(v) => updateInput('productivity', v)}
        placeholder="ex: 60"
        hint="Produtividade esperada da lavoura"
      />

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
