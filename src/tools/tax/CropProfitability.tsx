import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import AlertBanner from '../../components/ui/AlertBanner'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { CROP_LABELS } from '../../data/reference-data'

// ── Types ──

interface CropEntry {
  name: string
  productivity: string
  price: string
  cost: string
}

interface CropResult {
  name: string
  revenue: number
  cost: number
  funrural: number
  profit: number
  roi: number
  margin: number
}

const AVAILABLE_CROPS = Object.entries(CROP_LABELS)
  .filter(([key]) => !['pasture', 'brachiaria', 'millet'].includes(key))
  .map(([value, label]) => ({ value, label }))

function emptyCrop(name: string): CropEntry {
  return { name, productivity: '', price: '', cost: '' }
}

// ── Component ──

export default function CropProfitability() {
  const [producerType, setProducerType] = useState('pf')
  const [crops, setCrops] = useState<CropEntry[]>([
    { name: 'soybean', productivity: '65', price: '115', cost: '3200' },
    { name: 'corn', productivity: '120', price: '55', cost: '2800' },
  ])
  const [results, setResults] = useState<CropResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateCrop = (idx: number, key: keyof CropEntry, value: string) => {
    setCrops((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)))
  }

  const addCrop = () => {
    if (crops.length < 6) {
      const available = AVAILABLE_CROPS.find(
        (opt) => !crops.some((c) => c.name === opt.value),
      )
      if (available) setCrops((prev) => [...prev, emptyCrop(available.value)])
    }
  }

  const removeCrop = (idx: number) => {
    if (crops.length > 2) setCrops((prev) => prev.filter((_, i) => i !== idx))
  }

  const calculate = () => {
    setError(null)
    const valid = crops.filter((c) => c.productivity && c.price && c.cost)
    if (valid.length < 2) {
      setError('Preencha pelo menos 2 culturas para comparar')
      setResults(null)
      return
    }

    const funruralRate = producerType === 'pj' ? 0.0285 : 0.015

    const parsed: CropResult[] = valid.map((c) => {
      const prod = parseFloat(c.productivity)
      const price = parseFloat(c.price)
      const cost = parseFloat(c.cost)

      // For cotton, 1@ = 15kg; others 1 sc = 60kg; prices already in R$/sc or R$/@
      const revenue = prod * price
      const funrural = revenue * funruralRate
      const profit = revenue - cost - funrural
      const roi = cost > 0 ? (profit / cost) * 100 : 0
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0

      return {
        name: CROP_LABELS[c.name] || c.name,
        revenue,
        cost,
        funrural,
        profit,
        roi,
        margin,
      }
    })

    parsed.sort((a, b) => b.profit - a.profit)
    setResults(parsed)
  }

  const clear = () => {
    setCrops([emptyCrop('soybean'), emptyCrop('corn')])
    setResults(null)
    setError(null)
  }

  const cropOptions = AVAILABLE_CROPS

  return (
    <CalculatorLayout
      title="Rentabilidade por Cultura"
      description="Compare o lucro líquido de diferentes culturas na mesma área, incluindo impostos."
      about="Compare a rentabilidade líquida de até 6 culturas diferentes lado a lado, já com desconto de Funrural e custos. Identifique qual cultura remunera melhor na sua região."
      methodology="Receita bruta = Produtividade × Preço. Receita líquida = Receita bruta - Funrural. Lucro = Receita líquida - Custo. Margem = Lucro / Receita líquida × 100."
      result={
        results && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-agro-50 text-left">
                    <th className="p-2 border border-agro-200">#</th>
                    <th className="p-2 border border-agro-200">Cultura</th>
                    <th className="p-2 border border-agro-200">Receita</th>
                    <th className="p-2 border border-agro-200">Custo</th>
                    <th className="p-2 border border-agro-200">Funrural</th>
                    <th className="p-2 border border-agro-200">Lucro</th>
                    <th className="p-2 border border-agro-200">ROI</th>
                    <th className="p-2 border border-agro-200">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={r.name}
                      className={
                        r.profit < 0 ? 'bg-red-50' : i === 0 ? 'bg-agro-100 font-semibold' : ''
                      }
                    >
                      <td className="p-2 border border-agro-200">{i + 1}</td>
                      <td className="p-2 border border-agro-200">{r.name}</td>
                      <td className="p-2 border border-agro-200">{formatCurrency(r.revenue)}</td>
                      <td className="p-2 border border-agro-200">{formatCurrency(r.cost)}</td>
                      <td className="p-2 border border-agro-200">{formatCurrency(r.funrural)}</td>
                      <td className="p-2 border border-agro-200">{formatCurrency(r.profit)}</td>
                      <td className="p-2 border border-agro-200">{formatNumber(r.roi, 1)}%</td>
                      <td className="p-2 border border-agro-200">{formatNumber(r.margin, 1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual bars */}
            <div className="space-y-2">
              {results.map((r) => {
                const max = Math.max(...results.map((x) => Math.abs(x.profit)))
                const width = max > 0 ? (Math.abs(r.profit) / max) * 100 : 0
                return (
                  <div key={r.name} className="flex items-center gap-2 text-sm">
                    <span className="w-20 text-right">{r.name}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${r.profit >= 0 ? 'bg-agro-500' : 'bg-red-400'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className={`w-28 text-right ${r.profit < 0 ? 'text-red-600' : 'text-agro-700'}`}>
                      {formatCurrency(r.profit)}/ha
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    >
      <SelectField
        label="Tipo de produtor"
        options={[
          { value: 'pf', label: 'Pessoa Física (1,5%)' },
          { value: 'pj', label: 'Pessoa Jurídica (2,85%)' },
        ]}
        value={producerType}
        onChange={setProducerType}
      />

      {crops.map((crop, idx) => (
        <div key={idx} className="border border-agro-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-agro-700">Cultura {idx + 1}</span>
            {crops.length > 2 && (
              <button
                type="button"
                onClick={() => removeCrop(idx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>
          <SelectField
            label="Cultura"
            options={cropOptions}
            value={crop.name}
            onChange={(v) => updateCrop(idx, 'name', v)}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <InputField
              label="Produtividade"
              unit={crop.name === 'cotton' ? '@/ha' : 'sc/ha'}
              value={crop.productivity}
              onChange={(v) => updateCrop(idx, 'productivity', v)}
              placeholder="ex: 65"
              min="0"
            />
            <InputField
              label="Preço de venda"
              unit={crop.name === 'cotton' ? 'R$/@' : 'R$/sc'}
              value={crop.price}
              onChange={(v) => updateCrop(idx, 'price', v)}
              placeholder="ex: 115"
              min="0"
            />
            <InputField
              label="Custo de produção"
              prefix="R$" unit="R$/ha"
              value={crop.cost}
              onChange={(v) => updateCrop(idx, 'cost', v)}
              placeholder="ex: 3200"
              min="0"
            />
          </div>
        </div>
      ))}

      {crops.length < 6 && (
        <button
          type="button"
          onClick={addCrop}
          className="text-sm text-agro-600 hover:text-agro-800 font-medium"
        >
          + Adicionar cultura
        </button>
      )}

      {error && (
        <div className="mt-3">
          <AlertBanner variant="error" message={error} />
        </div>
      )}

      <ActionButtons onCalculate={calculate} onClear={clear} />
    </CalculatorLayout>
  )
}
