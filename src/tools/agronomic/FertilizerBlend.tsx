import useCalculator from '../../hooks/useCalculator'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import InputField from '../../components/ui/InputField'
import SelectField from '../../components/ui/SelectField'
import ActionButtons from '../../components/ui/ActionButtons'
import ResultCard from '../../components/ui/ResultCard'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import { FERTILIZER_SOURCES } from '../../data/reference-data'
import type { FertilizerSource } from '../../data/reference-data'

// ── Types ──

interface SourceSlot {
  sourceIndex: string
  customPrice: string
}

interface Inputs {
  targetN: string
  targetP: string
  targetK: string
  area: string
  sources: SourceSlot[]
}

interface SourceResult {
  [key: string]: unknown
  name: string
  kgPerHa: number
  kgTotal: number
  costPerHa: number
  costTotal: number
  nDelivered: number
  pDelivered: number
  kDelivered: number
  sDelivered: number
}

interface Result {
  sources: SourceResult[]
  totalCostPerHa: number
  totalCostTotal: number
  totalKgPerHa: number
  nTotal: number
  pTotal: number
  kTotal: number
  sTotal: number
  nExcess: number
  pExcess: number
  kExcess: number
}

// ── Constants ──

const SOURCE_OPTIONS = FERTILIZER_SOURCES.map((s, i) => ({
  value: String(i),
  label: `${s.name} (${s.n}-${s.p2o5}-${s.k2o})`,
}))

const EMPTY_SLOT: SourceSlot = { sourceIndex: '', customPrice: '' }

const INITIAL: Inputs = {
  targetN: '',
  targetP: '',
  targetK: '',
  area: '',
  sources: [{ ...EMPTY_SLOT }, { ...EMPTY_SLOT }],
}

// ── Calculation ──

function solveBlend(
  targets: { n: number; p: number; k: number },
  selectedSources: { source: FertilizerSource; price: number }[],
): SourceResult[] | null {
  // Greedy approach: prioritize P source, then K source, then N source
  // This is a simplified solver — for 2-3 sources it works well in practice
  let remainN = targets.n
  let remainP = targets.p
  let remainK = targets.k

  const results: SourceResult[] = []

  // Sort: P-rich sources first, then K-rich, then N-rich
  const sorted = [...selectedSources].sort((a, b) => {
    const aMax = Math.max(a.source.p2o5, a.source.k2o, a.source.n)
    const bMax = Math.max(b.source.p2o5, b.source.k2o, b.source.n)
    // Prioritize sources that have the most of the nutrient with highest remaining demand
    const aPriority = (a.source.p2o5 > 0 ? remainP : 0) + (a.source.k2o > 0 ? remainK : 0) + (a.source.n > 0 ? remainN : 0)
    const bPriority = (b.source.p2o5 > 0 ? remainP : 0) + (b.source.k2o > 0 ? remainK : 0) + (b.source.n > 0 ? remainN : 0)
    return bPriority - aPriority || bMax - aMax
  })

  for (const { source, price } of sorted) {
    // Determine kg/ha needed based on the nutrient with highest gap that this source provides
    let kgPerHa = 0

    if (source.p2o5 > 0 && remainP > 0) {
      kgPerHa = Math.max(kgPerHa, (remainP / source.p2o5) * 100)
    }
    if (source.k2o > 0 && remainK > 0) {
      kgPerHa = Math.max(kgPerHa, (remainK / source.k2o) * 100)
    }
    if (source.n > 0 && remainN > 0 && kgPerHa === 0) {
      // Only use N as primary if no P or K needed from this source
      kgPerHa = (remainN / source.n) * 100
    }

    if (kgPerHa <= 0) continue

    const nDel = (kgPerHa * source.n) / 100
    const pDel = (kgPerHa * source.p2o5) / 100
    const kDel = (kgPerHa * source.k2o) / 100
    const sDel = (kgPerHa * source.s) / 100

    remainN = Math.max(0, remainN - nDel)
    remainP = Math.max(0, remainP - pDel)
    remainK = Math.max(0, remainK - kDel)

    const costPerHa = (kgPerHa / 1000) * price

    results.push({
      name: source.name,
      kgPerHa,
      kgTotal: 0, // filled later with area
      costPerHa,
      costTotal: 0,
      nDelivered: nDel,
      pDelivered: pDel,
      kDelivered: kDel,
      sDelivered: sDel,
    })
  }

  return results
}

function calculate(inputs: Inputs): Result | null {
  const targetN = parseFloat(inputs.targetN) || 0
  const targetP = parseFloat(inputs.targetP) || 0
  const targetK = parseFloat(inputs.targetK) || 0
  const area = parseFloat(inputs.area)

  const selectedSources = inputs.sources
    .filter(s => s.sourceIndex !== '')
    .map(s => {
      const idx = parseInt(s.sourceIndex, 10)
      const source = FERTILIZER_SOURCES[idx]
      const customPrice = parseFloat(s.customPrice)
      const price = isNaN(customPrice) || customPrice <= 0 ? source.pricePerTon : customPrice
      return { source, price }
    })

  const blend = solveBlend({ n: targetN, p: targetP, k: targetK }, selectedSources)
  if (!blend || blend.length === 0) return null

  // Fill in area-dependent values
  const sources = blend.map(s => ({
    ...s,
    kgTotal: s.kgPerHa * area,
    costTotal: s.costPerHa * area,
  }))

  const nTotal = sources.reduce((sum, s) => sum + s.nDelivered, 0)
  const pTotal = sources.reduce((sum, s) => sum + s.pDelivered, 0)
  const kTotal = sources.reduce((sum, s) => sum + s.kDelivered, 0)
  const sTotal = sources.reduce((sum, s) => sum + s.sDelivered, 0)

  const totalCostPerHa = sources.reduce((sum, s) => sum + s.costPerHa, 0)
  const totalCostTotal = totalCostPerHa * area
  const totalKgPerHa = sources.reduce((sum, s) => sum + s.kgPerHa, 0)

  return {
    sources,
    totalCostPerHa,
    totalCostTotal,
    totalKgPerHa,
    nTotal,
    pTotal,
    kTotal,
    sTotal,
    nExcess: Math.max(0, nTotal - targetN),
    pExcess: Math.max(0, pTotal - targetP),
    kExcess: Math.max(0, kTotal - targetK),
  }
}

function validate(inputs: Inputs): string | null {
  const n = parseFloat(inputs.targetN) || 0
  const p = parseFloat(inputs.targetP) || 0
  const k = parseFloat(inputs.targetK) || 0
  if (n <= 0 && p <= 0 && k <= 0) return 'Informe a necessidade de pelo menos um nutriente (N, P₂O₅ ou K₂O)'
  if (!inputs.area) return 'Informe a área em hectares'
  const area = parseFloat(inputs.area)
  if (isNaN(area) || area <= 0) return 'A área deve ser maior que zero'
  if (area > 100_000) return 'Área muito grande — verifique o valor'
  const activeSources = inputs.sources.filter(s => s.sourceIndex !== '')
  if (activeSources.length === 0) return 'Selecione pelo menos uma fonte de adubo'
  // Check for duplicate sources
  const indices = activeSources.map(s => s.sourceIndex)
  if (new Set(indices).size !== indices.length) return 'Remova fontes duplicadas'
  return null
}

// ── Component ──

export default function FertilizerBlend() {
  const { inputs, result, error, updateInput, run, clear } =
    useCalculator<Inputs, Result>({
      initialInputs: INITIAL,
      calculate,
      validate,
    })

  const updateSlot = (index: number, field: keyof SourceSlot, value: string) => {
    const newSources = inputs.sources.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    updateInput('sources', newSources as never)
  }

  const addSlot = () => {
    if (inputs.sources.length < 5) {
      updateInput('sources', [...inputs.sources, { ...EMPTY_SLOT }] as never)
    }
  }

  const removeSlot = (index: number) => {
    if (inputs.sources.length > 1) {
      updateInput('sources', inputs.sources.filter((_, i) => i !== index) as never)
    }
  }

  return (
    <CalculatorLayout
      title="Formulação de Adubo Personalizado"
      description="Monte sua própria mistura de fertilizantes a partir de fontes individuais e compare com fórmulas comerciais."
      result={
        result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo total por hectare"
                value={formatCurrency(result.totalCostPerHa)}
                unit="R$/ha"
                highlight
              />
              <ResultCard
                label="Total de adubo por hectare"
                value={formatNumber(result.totalKgPerHa, 0)}
                unit="kg/ha"
                highlight
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="Custo total para a área"
                value={formatCurrency(result.totalCostTotal)}
                variant="default"
              />
              <ResultCard
                label="Enxofre fornecido (bônus)"
                value={formatNumber(result.sTotal, 1)}
                unit="kg S/ha"
                variant={result.sTotal > 0 ? 'success' : 'default'}
              />
            </div>

            {/* Nutrient delivery vs target */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700">Nutrientes fornecidos vs. necessário</h4>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {[
                  { label: 'N', delivered: result.nTotal, target: parseFloat(inputs.targetN) || 0, excess: result.nExcess },
                  { label: 'P₂O₅', delivered: result.pTotal, target: parseFloat(inputs.targetP) || 0, excess: result.pExcess },
                  { label: 'K₂O', delivered: result.kTotal, target: parseFloat(inputs.targetK) || 0, excess: result.kExcess },
                ].map(n => (
                  <div key={n.label} className="px-4 py-3 text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">{n.label}</p>
                    <p className="text-lg font-bold text-agro-800 mt-1">{formatNumber(n.delivered, 1)}</p>
                    <p className="text-xs text-gray-500">de {formatNumber(n.target, 0)} kg/ha</p>
                    {n.excess > 1 && (
                      <p className="text-xs text-amber-600 mt-1">+{formatNumber(n.excess, 1)} excesso</p>
                    )}
                    {n.target > 0 && n.delivered < n.target * 0.95 && (
                      <p className="text-xs text-red-600 mt-1">Déficit: {formatNumber(n.target - n.delivered, 1)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Source details */}
            <ComparisonTable
              columns={[
                { key: 'name', label: 'Fonte' },
                { key: 'kgPerHa', label: 'kg/ha', format: (v) => formatNumber(v as number, 0) },
                { key: 'kgTotal', label: 'Total (kg)', format: (v) => formatNumber(v as number, 0) },
                { key: 'costPerHa', label: 'R$/ha', format: (v) => formatCurrency(v as number) },
              ]}
              rows={result.sources}
            />

            {(result.nExcess > 20 || result.pExcess > 20 || result.kExcess > 20) && (
              <AlertBanner
                variant="warning"
                title="Excesso de nutrientes"
                message="A combinação de fontes gera excesso significativo de algum nutriente. Considere trocar uma fonte para reduzir o excesso e o custo."
              />
            )}
          </div>
        )
      }
      about="A formulação personalizada permite montar sua própria mistura de adubos a partir de fontes individuais (ureia, MAP, KCl etc.) em vez de comprar fórmulas prontas. É comum em operações maiores que compram insumos a granel, buscando economia e precisão na nutrição."
      methodology="Para cada fonte selecionada, calcula-se a quantidade (kg/ha) necessária para atender as demandas de N, P₂O₅ e K₂O informadas. O algoritmo prioriza fontes com maior concentração do nutriente mais deficitário. Fontes: ANDA, EMBRAPA. Preços são referência — consulte seu fornecedor."
    >
      <h3 className="text-sm font-semibold text-gray-700 mt-2">Necessidade de nutrientes (kg/ha)</h3>
      <p className="text-xs text-gray-500 -mt-1">Use a ferramenta Adubação NPK para calcular esses valores</p>

      <div className="grid gap-4 sm:grid-cols-4">
        <InputField
          label="Nitrogênio (N)"
          unit="kg/ha"
          value={inputs.targetN}
          onChange={(v) => updateInput('targetN', v as never)}
          placeholder="ex: 20"
          min="0"
          max="500"
          hint="Necessidade conforme laudo e cultura"
        />
        <InputField
          label="Fósforo (P₂O₅)"
          unit="kg/ha"
          value={inputs.targetP}
          onChange={(v) => updateInput('targetP', v as never)}
          placeholder="ex: 90"
          min="0"
          max="500"
          hint="Necessidade conforme laudo e cultura"
        />
        <InputField
          label="Potássio (K₂O)"
          unit="kg/ha"
          value={inputs.targetK}
          onChange={(v) => updateInput('targetK', v as never)}
          placeholder="ex: 60"
          min="0"
          max="500"
          hint="Necessidade conforme laudo e cultura"
        />
        <InputField
          label="Área"
          unit="ha"
          value={inputs.area}
          onChange={(v) => updateInput('area', v as never)}
          placeholder="ex: 500"
          min="0"
          max="100000"
          required
          hint="Área total para cálculo de quantidade"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Fontes de adubo disponíveis</h3>
          {inputs.sources.length < 5 && (
            <button
              type="button"
              onClick={addSlot}
              className="text-xs font-medium text-agro-600 hover:text-agro-700 transition-colors"
            >
              + Adicionar fonte
            </button>
          )}
        </div>

        {inputs.sources.map((slot, index) => (
          <div key={`src-${index}`} className="p-3 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Fonte {index + 1}</span>
              {inputs.sources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Fonte"
                options={SOURCE_OPTIONS}
                value={slot.sourceIndex}
                onChange={(v) => updateSlot(index, 'sourceIndex', v)}
                placeholder="Selecione..."
              />
              <InputField
                label="Preço personalizado"
                unit="R$/t"
                value={slot.customPrice}
                onChange={(v) => updateSlot(index, 'customPrice', v)}
                placeholder={slot.sourceIndex ? `Ref: ${FERTILIZER_SOURCES[parseInt(slot.sourceIndex, 10)]?.pricePerTon}` : 'Selecione fonte'}
                hint="Deixe vazio para usar preço referência"
                min="0"
                max="20000"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mt-3"><AlertBanner variant="error" message={error} /></div>}
      <ActionButtons onCalculate={run} onClear={clear} disabled={!inputs.area} />
    </CalculatorLayout>
  )
}
