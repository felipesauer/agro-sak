import { useState } from 'react'
import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber } from '../../utils/formatters'

// ── Types ──

type FormulationType = 'SC' | 'WG' | 'EC' | 'SL'

interface Product {
  id: string
  name: string
  formulation: FormulationType
  dosePerHa: string
  unit: 'L' | 'kg'
}

interface Inputs {
  tankVolume: string
  sprayVolume: string
  area: string
}

interface ProductResult {
  name: string
  formulation: FormulationType
  perTank: number
  total: number
  unit: string
}

interface Result {
  tanksNeeded: number
  products: ProductResult[]
  additionOrder: string[]
}

const INITIAL_INPUTS: Inputs = {
  tankVolume: '3000',
  sprayVolume: '120',
  area: '',
}

let _productId = 0
const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  formulation: 'SC',
  dosePerHa: '',
  unit: 'L',
}

const FORMULATION_OPTIONS = [
  { value: 'WG', label: 'WG (pó molhável)' },
  { value: 'SC', label: 'SC (suspensão concentrada)' },
  { value: 'EC', label: 'EC (emulsionável)' },
  { value: 'SL', label: 'SL (solúvel)' },
]

const UNIT_OPTIONS = [
  { value: 'L', label: 'Litros (L/ha)' },
  { value: 'kg', label: 'Quilos (kg/ha)' },
]

// Addition order priority (lower = add first)
const ADDITION_PRIORITY: Record<FormulationType, number> = {
  WG: 1,
  SC: 2,
  EC: 3,
  SL: 4,
}

// ── Component ──

export default function TankMix() {
  const [products, setProducts] = useState<Product[]>([
    { id: `p-${++_productId}`, ...EMPTY_PRODUCT },
    { id: `p-${++_productId}`, ...EMPTY_PRODUCT },
  ])

  const addProduct = () => {
    if (products.length < 6) {
      setProducts([...products, { id: `p-${++_productId}`, ...EMPTY_PRODUCT }])
    }
  }

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index))
    }
  }

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    setProducts(
      products.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    )
  }

  const calculateFn = (inputs: Inputs): Result | null => {
    const tankVol = parseFloat(inputs.tankVolume)
    const sprayVol = parseFloat(inputs.sprayVolume)
    const area = parseFloat(inputs.area)

    const tanksNeeded = (area * sprayVol) / tankVol

    const validProducts = products.filter((p) => p.name && p.dosePerHa)

    const productResults: ProductResult[] = validProducts.map((p) => {
      const dose = parseFloat(p.dosePerHa)
      const perTank = dose * (tankVol / sprayVol)
      const total = dose * area
      return {
        name: p.name,
        formulation: p.formulation,
        perTank,
        total,
        unit: p.unit === 'L' ? 'L' : 'kg',
      }
    })

    // Sort by addition order
    const additionOrder = [...validProducts]
      .sort(
        (a, b) =>
          ADDITION_PRIORITY[a.formulation] - ADDITION_PRIORITY[b.formulation],
      )
      .map((p) => `${p.name} (${p.formulation})`)

    return { tanksNeeded, products: productResults, additionOrder }
  }

  const validateFn = (inputs: Inputs): string | null => {
    if (!inputs.tankVolume) return 'Informe o volume do tanque'
    if (!inputs.sprayVolume) return 'Informe o volume de calda por hectare'
    if (!inputs.area) return 'Informe a área a ser aplicada'
    const validProducts = products.filter((p) => p.name && p.dosePerHa)
    if (validProducts.length === 0)
      return 'Adicione pelo menos um produto com nome e dose'
    return null
  }

  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL_INPUTS,
      calculate: calculateFn,
      validate: validateFn,
    })

  return (
    <CalculatorLayout
      title="Calculadora de Tank Mix"
      description="Calcule as quantidades de cada defensivo por tanque do pulverizador e a ordem correta de adição dos produtos."
      about="Calcule a quantidade exata de cada defensivo para o tanque do pulverizador. Respeite a ordem de mistura correta (WG → SC → EC → SL) para evitar incompatibilidades."
      methodology="Quantidade por tanque = Dose (L ou kg/ha) × Volume do tanque (L) / Volume de calda (L/ha). Ordem de adição: pós molháveis → suspensões → emulsões → soluções."
      result={
        result && (
          <div className="space-y-4">
            <ResultCard
              label="Tanques necessários"
              value={formatNumber(result.tanksNeeded, 1)}
              unit="tanques"
              highlight
              variant="default"
            />

            {result.products.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Quantidade por produto
                </p>
                <ComparisonTable
                  columns={[
                    {
                      key: 'name' as const,
                      label: 'Produto',
                      format: (_v, row) => (
                        <>{row!.name} <span className="text-xs text-gray-400">({row!.formulation})</span></>
                      ),
                    },
                    {
                      key: 'perTank' as const,
                      label: 'Por tanque',
                      align: 'right' as const,
                      cellClassName: () => 'font-medium',
                      format: (_v, row) => `${formatNumber(row!.perTank as number, 2)} ${row!.unit}`,
                    },
                    {
                      key: 'total' as const,
                      label: 'Total',
                      align: 'right' as const,
                      cellClassName: () => 'font-medium',
                      format: (_v, row) => `${formatNumber(row!.total as number, 2)} ${row!.unit}`,
                    },
                  ]}
                  rows={result.products}
                  rowKey="name"
                />
              </div>
            )}

            {result.additionOrder.length > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Ordem de adição no tanque
                </p>
                <ol className="text-sm space-y-1">
                  {result.additionOrder.map((name, i) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className="bg-agro-100 text-agro-800 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      {name}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <AlertBanner
              variant="warning"
              message="Verifique a compatibilidade química dos produtos nas bulas antes de misturar."
            />
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Volume do tanque"
          unit="L"
          value={inputs.tankVolume}
          onChange={(v) => updateInput('tankVolume', v)}
          placeholder="ex: 3000"
          min="0"
          required
          hint="Capacidade total do tanque do pulverizador"
        />
        <InputField
          label="Volume de calda"
          unit="L/ha"
          value={inputs.sprayVolume}
          onChange={(v) => updateInput('sprayVolume', v)}
          placeholder="ex: 120"
          min="0"
          required
          hint="Volume recomendado para a aplicação"
        />
        <InputField
          label="Área a aplicar"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v)}
          placeholder="ex: 25"
          min="0"
          required
          hint="Área total do talhão a ser pulverizado"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Produtos</h3>
          {products.length < 6 && (
            <button
              type="button"
              onClick={addProduct}
              className="text-xs text-agro-700 hover:text-agro-800 font-medium cursor-pointer"
            >
              + Adicionar produto
            </button>
          )}
        </div>

        {products.map((product, index) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">
                Produto {index + 1}
              </span>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <InputField
                label="Nome"
                type="text"
                value={product.name}
                onChange={(v) => updateProduct(index, 'name', v)}
                placeholder="ex: Priori Xtra"
                hint="Nome comercial do produto"
              />
              <SelectField
                label="Formulação"
                value={product.formulation}
                onChange={(v) => updateProduct(index, 'formulation', v)}
                options={FORMULATION_OPTIONS}
              />
              <InputField
                label="Dose"
                unit={product.unit === 'L' ? 'L/ha' : 'kg/ha'}
                value={product.dosePerHa}
                onChange={(v) => updateProduct(index, 'dosePerHa', v)}
                placeholder="ex: 0.30"
                step="0.01"
                hint="Dose recomendada na bula"
              />
              <SelectField
                label="Unidade"
                value={product.unit}
                onChange={(v) => updateProduct(index, 'unit', v)}
                options={UNIT_OPTIONS}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.tankVolume || !inputs.sprayVolume} />
    </CalculatorLayout>
  )
}
