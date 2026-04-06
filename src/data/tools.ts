// ── Tool categories and navigation data ──

export interface ToolInfo {
  id: number
  slug: string
  name: string
  description: string
  category: ToolCategory
  priority: 'high' | 'medium' | 'low' | 'gold'
  phase: number
  ready: boolean
}

export type ToolCategory =
  | 'agronomic'
  | 'operational'
  | 'financial'
  | 'grain'
  | 'tax'
  | 'utility'
  | 'lead-magnet'

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  agronomic: '🌱 Agronômicas',
  operational: '🚜 Operacional',
  financial: '💰 Financeiro',
  grain: '📦 Grãos e Armazenagem',
  tax: '📋 Tributário',
  utility: '🧰 Utilitários',
  'lead-magnet': '🧠 Inteligente',
}

export const TOOLS: ToolInfo[] = [
  // ── Phase 1: Quick Wins ──
  { id: 34, slug: 'unit-converter', name: 'Conversor de Medidas Agro', description: 'Converta hectares, alqueires, sacas, bushels e mais', category: 'utility', priority: 'high', phase: 1, ready: true },
  { id: 9, slug: 'yield-converter', name: 'Conversor de Produtividade', description: 'sc/ha ↔ kg/ha ↔ t/ha ↔ bushel/acre', category: 'utility', priority: 'low', phase: 1, ready: true },
  { id: 26, slug: 'moisture-discount', name: 'Desconto por Umidade e Impureza', description: 'Calcule os descontos da balança de grãos', category: 'grain', priority: 'high', phase: 1, ready: true },
  { id: 27, slug: 'drying-loss', name: 'Perda por Secagem', description: 'Quebra de peso na secagem de grãos', category: 'grain', priority: 'high', phase: 1, ready: true },
  { id: 35, slug: 'tank-mix', name: 'Calculadora de Tank Mix', description: 'Quantidades de defensivos por tanque', category: 'utility', priority: 'high', phase: 1, ready: true },
  { id: 36, slug: 'spray-mix', name: 'Mistura de Calda', description: 'Dose de produto por tanque simplificada', category: 'utility', priority: 'high', phase: 1, ready: true },

  // ── Phase 2: Core Agronomic ──
  { id: 1, slug: 'seeding-rate', name: 'Taxa de Semeadura', description: 'kg/ha de semente e sementes por metro linear', category: 'agronomic', priority: 'high', phase: 2, ready: true },
  { id: 2, slug: 'liming', name: 'Calagem / Correção de Solo', description: 'Necessidade de calcário (t/ha)', category: 'agronomic', priority: 'high', phase: 2, ready: true },
  { id: 3, slug: 'npk-fertilization', name: 'Adubação NPK', description: 'Recomendação de N, P₂O₅ e K₂O por hectare', category: 'agronomic', priority: 'high', phase: 2, ready: true },
  { id: 4, slug: 'nutrient-removal', name: 'Exportação de Nutrientes', description: 'Nutrientes removidos pela colheita', category: 'agronomic', priority: 'medium', phase: 2, ready: true },
  { id: 5, slug: 'npk-formula-comparer', name: 'Conversor de Formulação NPK', description: 'Compare custo por ponto de nutriente', category: 'agronomic', priority: 'medium', phase: 2, ready: true },
  { id: 6, slug: 'plant-spacing', name: 'Espaçamento de Plantio', description: 'População de plantas e espaçamento', category: 'agronomic', priority: 'medium', phase: 2, ready: true },

  // ── Phase 3: Simple Operational ──
  { id: 7, slug: 'pre-harvest-yield', name: 'Estimativa de Produtividade', description: 'Produtividade pré-colheita por amostragem', category: 'operational', priority: 'medium', phase: 3, ready: true },
  { id: 8, slug: 'harvest-loss', name: 'Perdas na Colheita', description: 'Quantifique perdas por etapa da colheita', category: 'operational', priority: 'medium', phase: 3, ready: true },
  { id: 12, slug: 'sprayer-calibration', name: 'Calibração de Pulverizador', description: 'Volume de calda (L/ha) e área por tanque', category: 'operational', priority: 'high', phase: 3, ready: true },
  { id: 13, slug: 'operational-capacity', name: 'Capacidade Operacional', description: 'ha/hora e tempo para cobrir a área', category: 'operational', priority: 'medium', phase: 3, ready: true },
  { id: 14, slug: 'fuel-consumption', name: 'Consumo de Combustível', description: 'Litros e custo de diesel por hectare', category: 'operational', priority: 'medium', phase: 3, ready: true },

  // ── Phase 4: Core Financial ──
  { id: 17, slug: 'production-cost', name: 'Custo de Produção', description: 'R$/ha, R$/saca e ponto de equilíbrio', category: 'financial', priority: 'high', phase: 4, ready: true },
  { id: 19, slug: 'break-even', name: 'Ponto de Equilíbrio', description: 'Produtividade ou preço mínimo para não ter prejuízo', category: 'financial', priority: 'high', phase: 4, ready: true },
  { id: 20, slug: 'sale-pricing', name: 'Precificação de Venda', description: 'Preço mínimo e com margem de lucro', category: 'financial', priority: 'high', phase: 4, ready: true },
  { id: 31, slug: 'funrural', name: 'Calculadora de Funrural', description: 'Contribuição previdenciária rural', category: 'tax', priority: 'high', phase: 4, ready: true },

  // ── Phase 5: Advanced Financial ──
  { id: 18, slug: 'crop-profit-simulator', name: 'Simulador de Lucro da Safra', description: 'Cenários pessimista, realista e otimista', category: 'financial', priority: 'high', phase: 5, ready: true },
  { id: 21, slug: 'rural-financing', name: 'Financiamento Rural', description: 'Simule Pronaf, Pronamp, Moderfrota e mais', category: 'financial', priority: 'high', phase: 5, ready: true },
  { id: 22, slug: 'farm-lease', name: 'Arrendamento Rural', description: 'Custo do arrendamento e comparativo com compra', category: 'financial', priority: 'medium', phase: 5, ready: true },
  { id: 23, slug: 'cash-flow', name: 'Fluxo de Caixa Rural', description: 'Projeção de 3 meses de entradas e saídas', category: 'financial', priority: 'medium', phase: 5, ready: true },
  { id: 24, slug: 'farm-roi', name: 'ROI Agrícola', description: 'Retorno sobre investimento da safra', category: 'financial', priority: 'high', phase: 5, ready: true },

  // ── Phase 6: Advanced Operational + Grain ──
  { id: 10, slug: 'machinery-cost', name: 'Custo de Máquinas', description: 'Compra × Aluguel × Terceirização', category: 'operational', priority: 'high', phase: 6, ready: true },
  { id: 11, slug: 'machine-depreciation', name: 'Depreciação de Máquinas', description: 'Depreciação e custo de manutenção', category: 'operational', priority: 'high', phase: 6, ready: true },
  { id: 15, slug: 'grain-freight', name: 'Logística de Transporte', description: 'Frete por tonelada e por saca', category: 'operational', priority: 'high', phase: 6, ready: true },
  { id: 28, slug: 'storage-viability', name: 'Viabilidade de Armazenagem', description: 'Vender agora ou guardar?', category: 'grain', priority: 'gold', phase: 6, ready: true },
  { id: 29, slug: 'storage-cost', name: 'Custo de Armazenagem', description: 'Silo próprio vs terceiro', category: 'grain', priority: 'medium', phase: 6, ready: true },

  // ── Phase 7: Tax + Smart ──
  { id: 30, slug: 'tax-reform', name: 'Reforma Tributária Rural', description: 'Impacto da EC 132/2023 no produtor', category: 'tax', priority: 'high', phase: 7, ready: true },
  { id: 32, slug: 'itr', name: 'Calculadora de ITR', description: 'Imposto territorial rural', category: 'tax', priority: 'medium', phase: 7, ready: true },
  { id: 33, slug: 'crop-profitability', name: 'Rentabilidade por Cultura', description: 'Comparativo de lucro líquido entre culturas', category: 'tax', priority: 'medium', phase: 7, ready: true },
  { id: 16, slug: 'planting-window', name: 'Janela de Plantio', description: 'Datas ideais por cultura e região', category: 'agronomic', priority: 'medium', phase: 7, ready: true },

  // ── Phase 8: Lead Magnets ──
  { id: 38, slug: 'farm-diagnostics', name: 'Diagnóstico de Gestão', description: 'Quiz de maturidade da gestão da fazenda', category: 'lead-magnet', priority: 'gold', phase: 8, ready: true },
  { id: 39, slug: 'software-roi', name: 'ROI do Software', description: 'Quanto você economiza com gestão digital', category: 'lead-magnet', priority: 'gold', phase: 8, ready: true },
  { id: 40, slug: 'crop-simulator', name: 'Simulador de Safra', description: 'Heatmap: preço × produtividade → lucro', category: 'lead-magnet', priority: 'gold', phase: 8, ready: true },

  // ── Phase 9: Technical Differentiators ──
  { id: 25, slug: 'field-cost-ranking', name: 'Custo por Talhão', description: 'Ranking de rentabilidade por talhão', category: 'financial', priority: 'gold', phase: 9, ready: true },
  { id: 41, slug: 'irrigation', name: 'Calculadora de Irrigação', description: 'Lâmina, turno de rega e custo', category: 'lead-magnet', priority: 'gold', phase: 9, ready: true },
  { id: 42, slug: 'gps-area', name: 'Calculadora de Área por GPS', description: 'Desenhe no mapa e calcule a área', category: 'lead-magnet', priority: 'gold', phase: 9, ready: true },
  { id: 43, slug: 'crop-comparer', name: 'Comparador de Culturas', description: 'Soja × Milho × Algodão — qual rende mais?', category: 'lead-magnet', priority: 'gold', phase: 9, ready: true },
  { id: 37, slug: 'water-balance', name: 'Balanço Hídrico', description: 'Monitoramento de chuva e déficit hídrico', category: 'utility', priority: 'medium', phase: 9, ready: true },
]
