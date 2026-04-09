import { useState, useMemo } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import { formatNumber } from '../../utils/formatters'
import { convert, AREA_UNITS, WEIGHT_UNITS, YIELD_UNITS, type UnitDef } from '../../core/utilities/unit-converter'

type TabKey = 'area' | 'weight' | 'yield'

const TABS: { key: TabKey; label: string; units: UnitDef[] }[] = [
  { key: 'area', label: 'Área', units: AREA_UNITS },
  { key: 'weight', label: 'Peso', units: WEIGHT_UNITS },
  { key: 'yield', label: 'Produtividade', units: YIELD_UNITS },
]

// ── Component ──

export default function UnitConverter() {
  const [activeTab, setActiveTab] = useState<TabKey>('area')
  const [inputValue, setInputValue] = useState('')
  const [fromUnit, setFromUnit] = useState<Record<TabKey, string>>({
    area: 'hectare',
    weight: 'kg',
    yield: 'sc_ha',
  })
  const [toUnit, setToUnit] = useState<Record<TabKey, string>>({
    area: 'alqueire_sp',
    weight: 'ton',
    yield: 'kg_ha',
  })

  const currentUnits = TABS.find((t) => t.key === activeTab)!.units

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setInputValue('')
  }

  const handleSwap = () => {
    const currentFrom = fromUnit[activeTab]
    const currentTo = toUnit[activeTab]
    setFromUnit((prev) => ({ ...prev, [activeTab]: currentTo }))
    setToUnit((prev) => ({ ...prev, [activeTab]: currentFrom }))
  }

  const result = useMemo(() => {
    const parsed = parseFloat(inputValue)
    if (!inputValue || isNaN(parsed)) return null

    const from = currentUnits.find((u) => u.value === fromUnit[activeTab])
    const to = currentUnits.find((u) => u.value === toUnit[activeTab])
    if (!from || !to) return null

    return convert(parsed, from.toBase, to.toBase)
  }, [inputValue, fromUnit, toUnit, activeTab, currentUnits])

  const fromLabel = currentUnits.find((u) => u.value === fromUnit[activeTab])?.label ?? ''
  const toLabel = currentUnits.find((u) => u.value === toUnit[activeTab])?.label ?? ''

  return (
    <CalculatorLayout
      title="Conversor Universal de Unidades"
      description="Converta unidades de área, peso e produtividade usadas no agronegócio brasileiro."
      about="Converta entre as principais unidades usadas no agronegócio brasileiro: hectares, alqueires (paulista, mineiro, goiano), sacas, arrobas, bushels, e medidas de produtividade."
      methodology="Conversões exatas: 1 alqueire paulista = 2,42 ha, 1 alqueire mineiro/goiano = 4,84 ha, 1 saca = 60 kg (grãos), 1 arroba = 15 kg, 1 bushel soja = 27,216 kg."
      result={
        result !== null ? (
          <div className="text-center">
            <p className="text-sm text-agro-700 mb-1">Resultado</p>
            <p className="text-3xl font-bold text-agro-800">
              {formatNumber(result, 4)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {inputValue} {fromLabel} = {formatNumber(result, 4)} {toLabel}
            </p>
          </div>
        ) : undefined
      }
    >
      {/* Tab pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-agro-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input value */}
      <InputField
        label="Valor"
        value={inputValue}
        onChange={setInputValue}
        placeholder="Digite o valor..."
        min="0"
        step="any"
        hint="Informe o valor numérico a converter"
      />

      {/* From / Swap / To row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        {/* From unit */}
        <SelectField
          label="De"
          options={currentUnits.map((u) => ({ value: u.value, label: u.label }))}
          value={fromUnit[activeTab]}
          onChange={(v) =>
            setFromUnit((prev) => ({ ...prev, [activeTab]: v }))
          }
        />

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="mb-0.5 p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-agro-50 hover:border-agro-400 transition-colors text-agro-600"
          title="Inverter unidades"
          aria-label="Inverter unidades"
        >
          ↔
        </button>

        {/* To unit */}
        <SelectField
          label="Para"
          options={currentUnits.map((u) => ({ value: u.value, label: u.label }))}
          value={toUnit[activeTab]}
          onChange={(v) =>
            setToUnit((prev) => ({ ...prev, [activeTab]: v }))
          }
        />
      </div>
    </CalculatorLayout>
  )
}
