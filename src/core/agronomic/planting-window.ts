// ── Planting Window Data Module (ZARC reference) ──

export interface WindowEntry {
    gm: string
    start: string
    end: string
    harvestEstimate: string
    risk: 'low' | 'medium' | 'high'
}

export const RISK_LABELS: Record<string, string> = {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',
}

export const STATE_OPTIONS = [
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
] as const

export const CROP_OPTIONS = [
    { value: 'soybean', label: 'Soja' },
    { value: 'corn_1', label: 'Milho 1ª Safra' },
    { value: 'corn_2', label: 'Milho Safrinha' },
    { value: 'wheat', label: 'Trigo' },
    { value: 'cotton', label: 'Algodão' },
    { value: 'bean', label: 'Feijão' },
] as const

export const PLANTING_WINDOWS: Record<string, Record<string, WindowEntry[]>> = {
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
        cotton: [
            { gm: '2ª Safra (algodão adensado)', start: '15/Jan', end: '15/Fev', harvestEstimate: 'Jul–Ago', risk: 'medium' },
        ],
        bean: [
            { gm: '3ª Safra (irrigado)', start: '15/Mai', end: '30/Jun', harvestEstimate: 'Set–Out', risk: 'medium' },
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
        wheat: [
            { gm: 'Precoce', start: '01/Abr', end: '31/Mai', harvestEstimate: 'Ago–Set', risk: 'low' },
            { gm: 'Médio', start: '15/Abr', end: '15/Jun', harvestEstimate: 'Set–Out', risk: 'low' },
            { gm: 'Tardio', start: '01/Mai', end: '30/Jun', harvestEstimate: 'Out–Nov', risk: 'medium' },
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
        wheat: [
            { gm: 'Precoce', start: '15/Mar', end: '30/Abr', harvestEstimate: 'Jul–Ago', risk: 'low' },
            { gm: 'Médio', start: '01/Abr', end: '31/Mai', harvestEstimate: 'Ago–Set', risk: 'medium' },
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
        wheat: [
            { gm: 'Precoce', start: '15/Mai', end: '30/Jun', harvestEstimate: 'Set–Out', risk: 'low' },
            { gm: 'Médio', start: '01/Jun', end: '15/Jul', harvestEstimate: 'Out–Nov', risk: 'low' },
            { gm: 'Tardio', start: '15/Jun', end: '31/Jul', harvestEstimate: 'Nov–Dez', risk: 'medium' },
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
        wheat: [
            { gm: 'Precoce', start: '01/Mai', end: '15/Jun', harvestEstimate: 'Set–Out', risk: 'low' },
            { gm: 'Médio', start: '15/Mai', end: '30/Jun', harvestEstimate: 'Out–Nov', risk: 'low' },
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

export function lookupPlantingWindows(state: string, crop: string): WindowEntry[] {
    return PLANTING_WINDOWS[state]?.[crop] ?? []
}

export function validatePlantingWindowQuery(state: string, crop: string): string | null {
    if (!state) return 'Selecione um estado'
    if (!crop) return 'Selecione uma cultura'
    if (!PLANTING_WINDOWS[state]) return 'Estado não encontrado'
    return null
}

export function getAvailableCrops(state: string): string[] {
    const stateData = PLANTING_WINDOWS[state]
    if (!stateData) return []
    return Object.keys(stateData)
}

export function getAvailableStates(): string[] {
    return Object.keys(PLANTING_WINDOWS)
}
