import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import {
  SEED_TREATMENT_PRODUCTS,
  SEED_TREATMENT_TYPE_LABELS,
  SEEDING_DEFAULTS,
  cropOptionsFrom,
} from '../../data/reference-data'

// ── Types ──

interface ProductSlot {
  productIndex: string
  customDose: string
  customPrice: string
}

interface Inputs {
  crop: string
  area: string
  seedRate: string
  slots: ProductSlot[]
}

interface ProductResult {
  name: string
  type: string
  dosePerKg: number
  totalMl: number
  totalLiters: number
  cost: number
}

interface Result {
  totalSeedKg: number
  products: ProductResult[]
  totalCostPerHa: number
  totalCostTotal: number
  totalVolumePerHa: number
}

// ── Constants ──

const PRODUCT_OPTIONS = SEED_TREATMENT_PRODUCTS.map((p, i) => ({
  value: String(i),
  label: `${p.name} (${SEED_TREATMENT_TYPE_LABELS[p.type]})`,
}))

const CROP_OPTIONS = [
  ...cropOptionsFrom(SEEDING_DEFAULTS),
  { value: 'custom', label: '✦ Personalizado' },
]

const EMPTY_SLOT: ProductSlot = { productIndex: '', customDose: '', customPrice: '' }

const INITIAL: Inputs = {
  crop: 'soybean',
  area: '',
  seedRate: '',
  slots: [{ ...EMPTY_SLOT }, { ...EMPTY_SLOT }],
}

// ── Calculation ──

function calculate(inputs: Inputs): Result | null {
  const area = parseFloat(inputs.area)
  const seedRate = parseFloat(inputs.seedRate)
  const totalSeedKg = seedRate * area

  const products: ProductResult[] = inputs.slots
    .filter(s => s.productIndex !== '')
    .map(s => {
      const idx = parseInt(s.productIndex, 10)
      const product = SEED_TREATMENT_PRODUCTS[idx]
      const dose = s.customDose ? parseFloat(s.customDose) : product.dosePerKg
      const price = s.customPrice ? parseFloat(s.customPrice) : product.pricePerLiter

      const totalMl = (dose / 100) * totalSeedKg
      const totalLiters = totalMl / 1000
      const cost = totalLiters * price

      return {
        name: product.name,
        type: SEED_TREATMENT_TYPE_LABELS[product.type],
        dosePerKg: dose,
        totalMl,
        totalLiters,
        cost,
      }
    })

  const totalCostTotal = products.reduce((sum, p) => sum + p.cost, 0)
  const totalCostPerHa = area > 0 ? totalCostTotal / area : 0
  const totalVolumePerHa = area > 0
    ? products.reduce((sum, p) => sum + p.totalMl, 0) / area
    : 0

  return { totalSeedKg, products, totalCostPerHa, totalCostTotal, totalVolumePerHa }
}

function validate(inputs: Inputs): string | null {
  if (!inputs.area) return 'Informe a área em hectares'
  if (!inputs.seedRate) return 'Informe a taxa de semeadura (kg/ha)'
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'A área deve ser maior que zero'
  if (area > 100_000) return 'Área muito grande — verifique o valor'
  const rate = parseFloat(inputs.seedRate)
  if (isNaN(rate) || rate <= 0) return 'A taxa de semeadura deve ser maior que zero'
  const activeSlots = inputs.slots.filter(s => s.productIndex !== '')
  if (activeSlots.length === 0) return 'Selecione pelo menos um produto para o tratamento'
  return null
}

// ── Component ──

export default function SeedTreatment() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  const handleCropChange = (value: string) => {
    updateInput('crop', value as never)
    if (value !== 'custom') {
      const d = SEEDING_DEFAULTS[value]
      if (d) {
        // Estimate kg/ha from default population and TSW
        const kgHa = (d.populationDefault * d.tswDefault) / 1_000_000
        updateInput('seedRate', String(Math.round(kgHa)) as never)
      }
    }
  }

  const updateSlot = (index: number, field: keyof ProductSlot, value: string) => {
    const newSlots = inputs.slots.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    updateInput('slots', newSlots as never)
  }

  const addSlot = () => {
    if (inputs.slots.length < 5) {
      updateInput('slots', [...inputs.slots, { ...EMPTY_SLOT }] as never)
    }
  }

  const removeSlot = (index: number) => {
    if (inputs.slots.length > 1) {
      updateInput('slots', inputs.slots.filter((_, i) => i !== index) as never)
    }
  }

  return (
    <CalculatorLayout
      title="Tratamento de Sementes"
      description="Calcule a dose de fungicida, inseticida e inoculante por kg de semente e o custo total por hectare."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo do tratamento por hectare"
                value={formatCurrency(result.totalCostPerHa)}
                unit="R$/ha"
                highlight
              />
              <ResultCard
                label="Volume de calda por hectare"
                value={formatNumber(result.totalVolumePerHa, 0)}
                unit="mL/ha"
                highlight
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Total de sementes"
                value={formatNumber(result.totalSeedKg, 0)}
                unit="kg"
                variant="default"
              />
              <ResultCard
                label="Custo total do tratamento"
                value={formatCurrency(result.totalCostTotal)}
                variant="default"
              />
            </div>

            {result.products.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">Detalhes por produto</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.products.map((p) => (
                    <div key={p.name} className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.type} — {formatNumber(p.dosePerKg, 0)} mL/100 kg</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600">
                        <span>Total: {formatNumber(p.totalLiters, 2)} L</span>
                        <span>Custo: {formatCurrency(p.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.totalVolumePerHa > 600 && (
              <AlertBanner
                variant="warning"
                title="Volume de calda elevado"
                message={`O volume total de ${formatNumber(result.totalVolumePerHa, 0)} mL por hectare de semente pode dificultar a cobertura uniforme. Considere ajustar as doses.`}
              />
            )}
          </div>
        )
      }
      about="O tratamento de sementes (TS) é a aplicação de fungicidas, inseticidas, inoculantes e outros produtos diretamente nas sementes antes do plantio, protegendo contra pragas e doenças iniciais. É uma das práticas com melhor relação custo-benefício na lavoura."
      methodology="Cálculo: dose (mL/100 kg) × total de sementes (kg) / 100 = volume total (mL). Custo = volume (L) × preço (R$/L). Fontes: bulas dos produtos registrados no MAPA/AGROFIT. Preços são referência e podem variar conforme região e fornecedor."
    >
      <SelectField
        label="Cultura"
        options={CROP_OPTIONS}
        value={inputs.crop}
        onChange={handleCropChange}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          min="0"
          max="100000"
          required
          hint="Área total de plantio"
        />
        <InputField
          label="Taxa de semeadura"
          unit="kg/ha"
          value={inputs.seedRate}
          onChange={(v) => updateInput('seedRate', v as never)}
          placeholder="ex: 60"
          hint="Use a ferramenta Taxa de Semeadura para calcular"
          min="0"
          max="500"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Produtos do tratamento</h3>
          {inputs.slots.length < 5 && (
            <button
              type="button"
              onClick={addSlot}
              className="text-xs font-medium text-agro-600 hover:text-agro-700 transition-colors"
            >
              + Adicionar produto
            </button>
          )}
        </div>

        {inputs.slots.map((slot, index) => (
          <div key={`slot-${index}`} className="p-3 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Produto {index + 1}</span>
              {inputs.slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
            <SelectField
              label="Produto"
              options={PRODUCT_OPTIONS}
              value={slot.productIndex}
              onChange={(v) => updateSlot(index, 'productIndex', v)}
              placeholder="Selecione o produto..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                label="Dose personalizada"
                unit="mL/100 kg"
                value={slot.customDose}
                onChange={(v) => updateSlot(index, 'customDose', v)}
                placeholder={slot.productIndex ? `Padrão: ${SEED_TREATMENT_PRODUCTS[parseInt(slot.productIndex, 10)]?.dosePerKg}` : 'Selecione produto'}
                hint="Deixe vazio para usar dose padrão"
                min="0"
                max="2000"
              />
              <InputField
                label="Preço personalizado"
                unit="R$/L"
                value={slot.customPrice}
                onChange={(v) => updateSlot(index, 'customPrice', v)}
                placeholder={slot.productIndex ? `Ref: ${SEED_TREATMENT_PRODUCTS[parseInt(slot.productIndex, 10)]?.pricePerLiter}` : 'Selecione produto'}
                hint="Deixe vazio para usar preço referência"
                min="0"
                max="5000"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area || !inputs.seedRate} />
    </CalculatorLayout>
  )
}
