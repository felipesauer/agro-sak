import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import SelectField from '../../components/ui/SelectField'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'
import {
  lookupPlantingWindows,
  STATE_OPTIONS,
  CROP_OPTIONS,
  RISK_LABELS,
} from '../../core/agronomic/planting-window'

// ── Planting window UI ──

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

// ── Component ──

export default function PlantingWindow() {
  const [state, setState] = useState('MT')
  const [crop, setCrop] = useState('soybean')

  const windows = lookupPlantingWindows(state, crop)

  return (
    <CalculatorLayout
      title="Janela de Plantio"
      description="Consulte as datas ideais de plantio por cultura, região e grupo de maturação, baseado no Zoneamento Agrícola (ZARC)."
      about="A janela de plantio define o período em que a semeadura tem menor risco climático para cada cultura. Plantar dentro da janela é requisito para acesso ao crédito rural e seguro agrícola do governo (PROAGRO/PROAGRO Mais)."
      methodology="Datas de referência simplificadas a partir do Zoneamento Agrícola de Risco Climático (ZARC) publicado pelo MAPA. O ZARC considera solo, clima e ciclo da cultivar para definir janelas com até 20% de risco. Consulte sempre o ZARC vigente para dados oficiais do seu município."
      result={null}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Estado"
          options={STATE_OPTIONS}
          value={state}
          onChange={setState}
        />
        <SelectField
          label="Cultura"
          options={CROP_OPTIONS}
          value={crop}
          onChange={setCrop}
        />
      </div>

      {windows.length > 0 ? (
        <ComparisonTable
          columns={[
            { key: 'gm', label: 'GM / Tipo' },
            { key: 'start', label: 'Início' },
            { key: 'end', label: 'Fim' },
            { key: 'harvestEstimate', label: 'Colheita est.' },
            {
              key: 'risk',
              label: 'Risco',
              format: (v) => {
                const risk = v as 'low' | 'medium' | 'high'
                return (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_COLORS[risk]}`}>
                    {RISK_LABELS[risk]}
                  </span>
                )
              },
            },
          ]}
          rows={windows as unknown as Record<string, unknown>[]}
          rowKey={'gm' as never}
        />
      ) : (
        <div className="mt-4">
          <AlertBanner
            variant="info"
            message="Sem dados de janela de plantio para esta combinação de estado e cultura."
          />
        </div>
      )}

      <AlertBanner
        variant="warning"
        message="Dados de referência simplificados. Consulte sempre o ZARC vigente no site do MAPA (zarc.agricultura.gov.br) para datas oficiais do seu município."
      />
    </CalculatorLayout>
  )
}
