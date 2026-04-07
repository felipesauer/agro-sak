import { useState } from 'react'
import CalculatorLayout from '../../components/layout/CalculatorLayout'
import SelectField from '../../components/ui/SelectField'
import AlertBanner from '../../components/ui/AlertBanner'
import ComparisonTable from '../../components/ui/ComparisonTable'

// ── Planting window data (simplified ZARC reference) ──

interface WindowEntry {
  gm: string
  start: string
  end: string
  harvestEstimate: string
  risk: 'low' | 'medium' | 'high'
}

const PLANTING_WINDOWS: Record<string, Record<string, WindowEntry[]>> = {
  MT: {
    soybean: [
      { gm: '5.0–6.0 (Precoce)', start: '15/Set', end: '15/Nov', harvestEstimate: 'Jan–Fev', risk: 'low' },
      { gm: '6.5–7.0 (Médio)', start: '01/Out', end: '30/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
      { gm: '7.5–8.0 (Tardio)', start: '01/Out', end: '15/Nov', harvestEstimate: 'Mar–Abr', risk: 'medium' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '01/Out', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '01/Jan', end: '15/Fev', harvestEstimate: 'Jun–Jul', risk: 'medium' },
      { gm: 'Safrinha (tardio)', start: '16/Fev', end: '10/Mar', harvestEstimate: 'Jul–Ago', risk: 'high' },
    ],
  },
  GO: {
    soybean: [
      { gm: '5.0–6.0 (Precoce)', start: '01/Out', end: '30/Nov', harvestEstimate: 'Jan–Fev', risk: 'low' },
      { gm: '6.5–7.5 (Médio/Tardio)', start: '15/Out', end: '15/Dez', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '15/Out', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '15/Jan', end: '28/Fev', harvestEstimate: 'Jun–Jul', risk: 'medium' },
    ],
  },
  PR: {
    soybean: [
      { gm: '5.0–6.0 (Precoce)', start: '01/Out', end: '30/Nov', harvestEstimate: 'Jan–Fev', risk: 'low' },
      { gm: '6.5–7.5', start: '15/Out', end: '15/Dez', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '01/Set', end: '15/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '01/Fev', end: '15/Mar', harvestEstimate: 'Jul–Ago', risk: 'medium' },
    ],
  },
  MS: {
    soybean: [
      { gm: '5.0–6.0 (Precoce)', start: '15/Set', end: '15/Nov', harvestEstimate: 'Jan–Fev', risk: 'low' },
      { gm: '6.5–7.5', start: '01/Out', end: '30/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '15/Jan', end: '28/Fev', harvestEstimate: 'Jun–Jul', risk: 'medium' },
    ],
  },
  SP: {
    soybean: [
      { gm: '5.0–6.5', start: '01/Out', end: '15/Dez', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '01/Out', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '01/Fev', end: '15/Mar', harvestEstimate: 'Jul–Ago', risk: 'high' },
    ],
  },
  MG: {
    soybean: [
      { gm: '5.0–6.5 (Precoce)', start: '15/Out', end: '30/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
      { gm: '7.0–8.0 (Médio/Tardio)', start: '01/Nov', end: '15/Dez', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '15/Out', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '01/Fev', end: '10/Mar', harvestEstimate: 'Jul–Ago', risk: 'medium' },
    ],
  },
  RS: {
    soybean: [
      { gm: '5.0–6.0 (Precoce)', start: '15/Out', end: '15/Dez', harvestEstimate: 'Fev–Mar', risk: 'low' },
      { gm: '6.5–7.5 (Médio)', start: '01/Nov', end: '31/Dez', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '01/Set', end: '15/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
  },
  BA: {
    soybean: [
      { gm: '7.0–8.5 (Oeste BA)', start: '01/Nov', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
      { gm: '8.5+ (Tardio)', start: '15/Nov', end: '15/Dez', harvestEstimate: 'Abr–Mai', risk: 'medium' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '15/Nov', end: '31/Dez', harvestEstimate: 'Abr–Mai', risk: 'medium' },
    ],
  },
  TO: {
    soybean: [
      { gm: '7.0–8.0 (Médio)', start: '01/Nov', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
      { gm: '8.5+ (Tardio)', start: '15/Nov', end: '15/Dez', harvestEstimate: 'Abr–Mai', risk: 'medium' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '15/Jan', end: '20/Fev', harvestEstimate: 'Jun–Jul', risk: 'high' },
    ],
  },
  PI: {
    soybean: [
      { gm: '7.5–8.5 (Cerrado PI)', start: '01/Nov', end: '10/Dez', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
  },
  MA: {
    soybean: [
      { gm: '8.0–9.0 (Sul MA)', start: '01/Nov', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '15/Jan', end: '15/Fev', harvestEstimate: 'Jun–Jul', risk: 'high' },
    ],
  },
  SC: {
    soybean: [
      { gm: '5.0–6.5', start: '15/Out', end: '15/Dez', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '01/Set', end: '30/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
  },
  DF: {
    soybean: [
      { gm: '6.0–7.5', start: '15/Out', end: '30/Nov', harvestEstimate: 'Fev–Mar', risk: 'low' },
    ],
    corn_1: [
      { gm: '1ª Safra', start: '15/Out', end: '30/Nov', harvestEstimate: 'Mar–Abr', risk: 'low' },
    ],
    corn_2: [
      { gm: 'Safrinha', start: '15/Jan', end: '28/Fev', harvestEstimate: 'Jun–Jul', risk: 'medium' },
    ],
  },
}

const STATE_OPTIONS = [
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'GO', label: 'Goiás' },
  { value: 'PR', label: 'Paraná' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'BA', label: 'Bahia (Oeste)' },
  { value: 'TO', label: 'Tocantins' },
  { value: 'PI', label: 'Piauí (Cerrado)' },
  { value: 'MA', label: 'Maranhão (Sul)' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'DF', label: 'Distrito Federal' },
]

const CROP_OPTIONS = [
  { value: 'soybean', label: 'Soja' },
  { value: 'corn_1', label: 'Milho 1ª Safra' },
  { value: 'corn_2', label: 'Milho Safrinha' },
]

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const RISK_LABELS: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
}

// ── Component ──

export default function PlantingWindow() {
  const [state, setState] = useState('MT')
  const [crop, setCrop] = useState('soybean')

  const windows = PLANTING_WINDOWS[state]?.[crop] || []

  return (
    <CalculatorLayout
      title="Janela de Plantio"
      description="Consulte as datas ideais de plantio por cultura, região e grupo de maturação, baseado no Zoneamento Agrícola (ZARC)."
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
        message="Dados de referência simplificados. Consulte sempre o ZARC vigente no site do MAPA para datas oficiais do seu município."
      />
    </CalculatorLayout>
  )
}
