// ── Unit Converter ──

export interface UnitDef {
    value: string
    label: string
    toBase: number
}

export const AREA_UNITS: UnitDef[] = [
    { value: 'hectare', label: 'Hectare (ha)', toBase: 1 },
    { value: 'alqueire_mt', label: 'Alqueire MT (4,84 ha)', toBase: 4.84 },
    { value: 'alqueire_sp', label: 'Alqueire Paulista (2,42 ha)', toBase: 2.42 },
    { value: 'alqueire_mg', label: 'Alqueire Mineiro (4,84 ha)', toBase: 4.84 },
    { value: 'alqueire_ba', label: 'Alqueire Baiano (9,68 ha)', toBase: 9.68 },
    { value: 'alqueire_go', label: 'Alqueire Goiano (4,84 ha)', toBase: 4.84 },
    { value: 'tarefa_ne', label: 'Tarefa Nordestina (0,4356 ha)', toBase: 0.4356 },
    { value: 'acre', label: 'Acre (0,4047 ha)', toBase: 0.4047 },
    { value: 'm2', label: 'Metro quadrado (m²)', toBase: 0.0001 },
]

export const WEIGHT_UNITS: UnitDef[] = [
    { value: 'kg', label: 'Quilograma (kg)', toBase: 1 },
    { value: 'ton', label: 'Tonelada (t)', toBase: 1000 },
    { value: 'saca_60', label: 'Saca 60 kg', toBase: 60 },
    { value: 'saca_50', label: 'Saca 50 kg (arroz)', toBase: 50 },
    { value: 'arroba', label: 'Arroba (15 kg)', toBase: 15 },
    { value: 'bushel_soja', label: 'Bushel Soja (27,216 kg)', toBase: 27.216 },
    { value: 'bushel_milho', label: 'Bushel Milho (25,401 kg)', toBase: 25.401 },
]

export const YIELD_UNITS: UnitDef[] = [
    { value: 'sc_ha', label: 'sc/ha (soja 60 kg)', toBase: 60 },
    { value: 'kg_ha', label: 'kg/ha', toBase: 1 },
    { value: 't_ha', label: 't/ha', toBase: 1000 },
    { value: 'bu_ac_soja', label: 'bu/ac (soja)', toBase: 60 / 0.6726 },
    { value: 'bu_ac_milho', label: 'bu/ac (milho)', toBase: 60 / 0.6274 },
]

export function convert(value: number, fromToBase: number, toToBase: number): number {
    return (value * fromToBase) / toToBase
}

export function validateConversion(value: number): string | null {
    if (isNaN(value)) return 'Informe um valor numérico válido'
    if (value < 0) return 'O valor deve ser positivo'
    return null
}
