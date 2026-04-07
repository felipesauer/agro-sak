import { useMemo } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import DataFreshness from '../../components/ui/DataFreshness'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { useFreightRates } from '../../db/hooks'

// ── Types ──

interface Inputs {
  vehicleType: string
  distance: string
  freightPerKm: string
  loadTons: string
  sacPrice: string
  sacWeight: string
}

interface Result {
  totalFreight: number
  costPerTon: number
  costPerSac: number
  freightPercent: number
}

const VEHICLE_OPTIONS = [
  { value: 'truck', label: 'Truck (14 t)' },
  { value: 'carreta', label: 'Carreta (27 t)' },
  { value: 'bitrem', label: 'Bitrem (45 t)' },
  { value: 'rodotrem', label: 'Rodotrem (57 t)' },
]

const VEHICLE_LOAD: Record<string, string> = {
  truck: '14', carreta: '27', bitrem: '45', rodotrem: '57',
}

const INITIAL: Inputs = {
  vehicleType: 'carreta',
  distance: '320',
  freightPerKm: '8.50',
  loadTons: '27',
  sacPrice: '115',
  sacWeight: '60',
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const dist = parseFloat(inputs.distance)
  const fretKm = parseFloat(inputs.freightPerKm)
  const tons = parseFloat(inputs.loadTons)
  const sacPrice = parseFloat(inputs.sacPrice) || 115
  const sacWeight = parseFloat(inputs.sacWeight) || 60

  const totalFreight = dist * fretKm
  const costPerTon = tons > 0 ? totalFreight / tons : 0
  const sacsPerTon = 1000 / sacWeight
  const costPerSac = costPerTon / sacsPerTon
  const freightPercent = sacPrice > 0 ? (costPerSac / sacPrice) * 100 : 0

  return { totalFreight, costPerTon, costPerSac, freightPercent }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.distance || parseFloat(inputs.distance) <= 0) return 'Informe a distância'
  if (!inputs.freightPerKm || parseFloat(inputs.freightPerKm) <= 0)
    return 'Informe o valor do frete por km'
  if (!inputs.loadTons || parseFloat(inputs.loadTons) <= 0) return 'Informe a carga'
  return null
}

// ── Component ──

export default function GrainFreight() {
  const dbFreight = useFreightRates()
  const anttRefPerTonKm = useMemo(() => {
    if (!dbFreight?.length) return null
    return dbFreight.find(r => r.key === 'avgPerTonKm')?.value ?? null
  }, [dbFreight])
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({ initialInputs: INITIAL, calculate, validate })

  const handleVehicle = (v: string) => {
    updateInput('vehicleType', v)
    const load = VEHICLE_LOAD[v]
    if (load) updateInput('loadTons', load)
  }

  return (
    <CalculatorLayout
      title="Logística de Transporte de Grãos"
      description="Custo de frete por tonelada e por saca, e participação no preço da commodity."
      about="Simule o custo de frete para transportar grãos da fazenda até o armazém, porto ou cooperativa. Compare veículos e calcule o impacto no preço líquido."
      methodology="Custo total = (Distância × Custo por km) + Pedágios. Custo por saca = Custo total / (Capacidade do veículo / Peso da saca). Referência: tabela ANTT de fretes mínimos."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard label="Custo total do frete" value={formatCurrency(result.totalFreight, 0)} unit="" highlight variant="warning" />
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Custo por tonelada" value={formatCurrency(result.costPerTon)} unit="/t" variant="warning" />
              <ResultCard label="Custo por saca" value={formatCurrency(result.costPerSac)} unit="/sc" variant="warning" />
            </div>
            <ResultCard label="Frete como % do preço da saca" value={formatPercent(result.freightPercent)} unit="" variant="warning">
              <p className="text-xs text-gray-500 mt-1">
                Preço da saca: {formatCurrency(parseFloat(inputs.sacPrice))}
              </p>
            </ResultCard>

            {result.freightPercent > 15 && (
              <AlertBanner
                variant="warning"
                message={`Frete representa ${formatPercent(result.freightPercent)} do preço da saca — acima do limite de 15% (logística ineficiente).`}
              />
            )}

            {/* Vehicle comparison */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Comparativo por tipo de veículo
              </p>
              <ComparisonTable
                columns={[
                  { key: 'label', label: 'Veículo' },
                  { key: 'load', label: 'Carga' },
                  { key: 'perT', label: 'R$/t', align: 'right', format: (v) => formatCurrency(v as number) },
                  { key: 'perSc', label: 'R$/sc', align: 'right', format: (v) => formatCurrency(v as number) },
                ]}
                rows={VEHICLE_OPTIONS.map((v) => {
                  const t = parseFloat(VEHICLE_LOAD[v.value])
                  const dist = parseFloat(inputs.distance)
                  const fkm = parseFloat(inputs.freightPerKm)
                  const total = dist * fkm
                  const perT = total / t
                  const perSc = perT / (1000 / (parseFloat(inputs.sacWeight) || 60))
                  return { vehicle: v.value, label: v.label, load: `${VEHICLE_LOAD[v.value]} t`, perT, perSc }
                })}
                rowKey="vehicle"
                rowClassName={(row) => (row.vehicle as string) === inputs.vehicleType ? 'font-medium text-agro-700' : ''}
              />
            </div>
          </div>
        )
      }
    >
      <SelectField label="Tipo de veículo" options={VEHICLE_OPTIONS} value={inputs.vehicleType} onChange={handleVehicle} />

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Distância ida e volta" unit="km" value={inputs.distance} onChange={(v) => updateInput('distance', v)} required hint="Distância total ida + volta até o destino" />
        <InputField label="Valor do frete" prefix="R$" mask="currency" unit="R$/km" value={inputs.freightPerKm} onChange={(v) => updateInput('freightPerKm', v)} step="0.50" required hint={anttRefPerTonKm ? `Cobrado por km. Ref. ANTT: ${formatCurrency(anttRefPerTonKm)}/t·km` : 'Valor cobrado por km rodado pelo transportador'} />
        <InputField label="Carga" unit="toneladas" value={inputs.loadTons} onChange={(v) => updateInput('loadTons', v)} required hint="Peso total transportado por viagem" />
        <InputField label="Preço da saca (referência)" prefix="R$" mask="currency" unit="R$/sc" value={inputs.sacPrice} onChange={(v) => updateInput('sacPrice', v)} step="0.50" hint="Para calcular o impacto do frete no preço do grão" />
      </div>

      {error && <AlertBanner variant="error" message={error} />}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.distance || !inputs.freightPerKm || !inputs.loadTons} />
      <DataFreshness table="freightRates" />
    </CalculatorLayout>
  )
}
