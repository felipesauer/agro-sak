// ── Common / Shared reference data ──

// ── Brazilian States (27 UFs) ──

interface BrazilianState {
  code: string
  name: string
  region: string
}

const BRAZILIAN_STATES: BrazilianState[] = [
  { code: 'AC', name: 'Acre', region: 'Norte' },
  { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { code: 'AP', name: 'Amapá', region: 'Norte' },
  { code: 'AM', name: 'Amazonas', region: 'Norte' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
  { code: 'CE', name: 'Ceará', region: 'Nordeste' },
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'PA', name: 'Pará', region: 'Norte' },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { code: 'PR', name: 'Paraná', region: 'Sul' },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI', name: 'Piauí', region: 'Nordeste' },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'RO', name: 'Rondônia', region: 'Norte' },
  { code: 'RR', name: 'Roraima', region: 'Norte' },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
  { code: 'TO', name: 'Tocantins', region: 'Norte' },
]

// Helper: state options for SelectField
export const STATE_OPTIONS = BRAZILIAN_STATES.map(s => ({
  value: s.code,
  label: `${s.code} - ${s.name}`,
}))

// ── Crop labels (pt-BR) ──

export const CROP_LABELS: Record<string, string> = {
  soybean: 'Soja',
  corn: 'Milho',
  cotton: 'Algodão',
  cotton_lint: 'Algodão (pluma)',
  sorghum: 'Sorgo',
  bean: 'Feijão',
  wheat: 'Trigo',
  rice: 'Arroz',
  coffee: 'Café',
  sugarcane: 'Cana-de-açúcar',
  sunflower: 'Girassol',
  oat: 'Aveia',
  barley: 'Cevada',
  peanut: 'Amendoim',
  millet: 'Milheto',
  brachiaria: 'Braquiária',
  pasture: 'Pastagem',
}

/** Derive crop options from a data object, using CROP_LABELS for display names */
export function cropOptionsFrom(data: Record<string, unknown>): { value: string; label: string }[] {
  return Object.keys(data)
    .filter(key => key in CROP_LABELS)
    .map(key => ({ value: key, label: CROP_LABELS[key] }))
}


