# 🚀 Plano de Implementação — Agro SAK

> Free tools for Brazilian agribusiness  
> Stack: React 18 + Vite + Tailwind CSS 3 + React Router  
> 100% client-side, no backend, mobile-first  
> **Language convention:** All file names, folder names, component names, variables, functions, comments, and code MUST be written in English. Only user-facing UI text (labels, descriptions, results) is in Portuguese (pt-BR).

---

## Visão Geral das Fases

| Fase | Foco | Ferramentas | Prioridade |
|------|------|-------------|------------|
| **0** | Setup do projeto + componentes base | — | Fundação |
| **1** | Quick Wins — tráfego rápido | 34, 9/38, 26, 27, 35, 36 | 🟢 Lançar primeiro |
| **2** | Core Agronômicas | 1, 2, 3, 4, 5, 6 | 🔥 Alta |
| **3** | Operacionais simples | 7, 8, 12, 13, 14 | 🔥 Alta |
| **4** | Financeiro Core | 17, 19, 20, 31 | 🔥 Alta |
| **5** | Financeiro Avançado | 18, 21, 22, 23, 24 | 🔥 Alta |
| **6** | Operacional Avançado + Grãos | 10, 11, 15, 28, 29 | Média-Alta |
| **7** | Tributário + Inteligente | 30, 32, 33, 16 | Média |
| **8** | Lead Magnets — conversão | 40, 41, 39 | ⭐ Ouro |
| **9** | Diferenciais Técnicos | 25, 42, 43, 44, 37 | ⭐ Diferencial |

**Total: 44 ferramentas únicas** (excluindo duplicatas 45–52 já cobertas)

---

## Fase 0 — Setup do Projeto + Componentes Base

### Objetivo
Criar a fundação técnica do projeto: scaffolding, componentes reutilizáveis, utilitários e navegação.

### Tasks

- [ ] Initialize project with Vite + React + TypeScript
- [ ] Configure Tailwind CSS 3 with agro colors (`#3B6D11`, `#639922`, `#EAF3DE`)
- [ ] Configure React Router (routes by category)
- [ ] Create main layout (header, sidebar/nav, footer)
- [ ] Create base components:
  - `InputField` — standard input with label, unit, placeholder, validation
  - `SelectField` — styled select with options
  - `ResultCard` — highlighted result card (green)
  - `CalculatorLayout` — standard wrapper for all calculators
  - `AlertBanner` — alerts and warnings (info, warning, error)
  - `ComparisonTable` — comparison table
  - `ActionButtons` — Calculate / Clear buttons
- [ ] Create utility modules:
  - `utils/formulas.ts` — pure formulas (testable)
  - `utils/conversions.ts` — unit conversion tables
  - `utils/reference-data.ts` — reference data (EMBRAPA, ZARC)
  - `utils/formatters.ts` — BR number formatting (R$, comma decimal)
  - `utils/validators.ts` — input validation
- [ ] Home page with tool index by category
- [ ] Basic SEO: title, meta descriptions per tool

### Folder Structure

```
/src
  /components/ui/         → Reusable base components
  /components/layout/     → Header, Footer, Sidebar, CalculatorLayout
  /pages/                 → Category pages and Home
  /tools/
    /agronomic/           → Seeding, liming, fertilization, spacing
    /operational/         → Sprayer, fuel, harvest losses, capacity
    /financial/           → Production cost, break-even, pricing, financing
    /grain/               → Moisture, discounts, storage viability
    /tax/                 → Funrural, ITR, tax reform
    /utilities/           → Unit converter, tank mix, spray mix
    /lead-magnets/        → Farm diagnosis, software ROI, crop simulator
  /utils/                 → Pure formulas, conversions, formatting
  /hooks/                 → Custom hooks (useCalculator, useLocalStorage)
  /data/                  → Static data (EMBRAPA tables, tax rates)
  /i18n/                  → Portuguese labels and strings (pt-BR)
```

---

## Fase 1 — Quick Wins (Utilitários Simples)

### Objetivo
Lançar ferramentas simples de alto tráfego para gerar visitas e validar a plataforma.

### Ferramentas

#### 1.1 — Conversor Universal de Medidas Agro (#34)
- **Complexidade:** Baixa
- **Abas:** Área / Peso / Produtividade
- **Diferencial:** Alqueires por estado (MT, SP, GO, BA, NE)
- **UX:** Resultado em tempo real (sem botão calcular)

#### 1.2 — Produtividade por Hectare / Conversor Sc↔Kg↔Bushel (#9 + #38)
- **Complexidade:** Muito Baixa
- **Consolida** as ferramentas 9 e 38 numa única
- **Extra:** Médias de produtividade por estado como referência

#### 1.3 — Desconto por Umidade e Impureza (#26)
- **Complexidade:** Média
- **Inputs:** Peso bruto, umidade, impureza, ardidos, preço
- **Destaque:** Mostrar quanto perdeu em R$ nos descontos

#### 1.4 — Umidade de Grãos & Perda por Secagem (#27)
- **Complexidade:** Baixa
- **Fórmula:** `Peso_final = Peso_inicial × (100 - Ui) / (100 - Uf)`

#### 1.5 — Calculadora de Tank Mix (#35)
- **Complexidade:** Média
- **Até 6 produtos** simultâneos
- **Ordem de adição** sugerida por formulação

#### 1.6 — Mistura de Calda - Dose por Tanque (#36)
- **Complexidade:** Baixa
- **Versão simplificada** do Tank Mix (1 produto)

---

## Fase 2 — Core Agronômicas

### Objetivo
As calculadoras que agrônomos e técnicos usam diariamente no campo.

### Ferramentas

#### 2.1 — Taxa de Semeadura & População de Plantas (#1)
- Seletor de cultura muda defaults automaticamente
- PMG por cultivar (hint na interface)
- Resultado principal: **kg/ha de semente**

#### 2.2 — Calagem / Correção de Solo (#2)
- Dois métodos: Saturação por Bases e SMP
- Alerta se NC > 5 t/ha (parcelamento)
- V% desejada varia por cultura (auto-fill)

#### 2.3 — Adubação NPK (#3)
- Tabelas EMBRAPA/Cerrado como base
- Classificação do teor (Baixo/Médio/Alto) ao lado do input
- Sugestão de 3 formulações comerciais

#### 2.4 — Exportação / Remoção de Nutrientes (#4)
- Tabela de kg removidos por tonelada de grão
- Converter sc/ha → t/ha antes do cálculo
- Custo de reposição opcional

#### 2.5 — Conversor de Formulação NPK (#5)
- Até 4 formulações simultâneas para comparar
- Custo por ponto de nutriente
- Destaque visual na formulação vencedora

#### 2.6 — Espaçamento de Plantio (#6)
- Dois modos: calcular população ↔ calcular espaçamento
- Fórmula: `Plantas/ha = 10.000 / (esp_linhas × esp_plantas)`

---

## Fase 3 — Operacionais Simples

### Objetivo
Ferramentas de campo e pós-colheita que complementam o kit agronômico.

### Ferramentas

#### 3.1 — Estimativa de Produtividade Pré-Colheita (#7)
- Inputs por cultura (soja vs milho)
- Range de confiança (±10%)
- Mínimo 5 pontos de amostragem

#### 3.2 — Perdas na Colheita (#8)
- Perda por etapa: pré-colheita, plataforma, trilha
- Indicador: verde ≤ 1 sc/ha, amarelo 1–2, vermelho > 2
- Recomendações de regulagem

#### 3.3 — Calibração de Pulverizador (#12)
- `Volume calda (L/ha) = (Vazão_bico × 600) / (Velocidade × Espaçamento)`
- Alerta se < 50 L/ha ou > 400 L/ha
- Tabela de vazão × velocidade

#### 3.4 — Capacidade Operacional (#13)
- `Cap = (Largura × Velocidade × Eficiência) / 10`
- Tabela de eficiências de referência por operação
- Horas/dias para cobrir X hectares

#### 3.5 — Consumo de Combustível por Hectare (#14)
- Referências de consumo típico por operação
- Custo total para a área

---

## Fase 4 — Financeiro Core

### Objetivo
As calculadoras financeiras essenciais — maior impacto em lead generation.

### Ferramentas

#### 4.1 — Custo de Produção R$/ha e R$/saca (#17) ⭐
- **Maior lead magnet da lista**
- 4 grupos de custos: Insumos, Operações, Fixos, Pós-colheita
- Gráfico pizza com participação % de cada grupo
- Template pré-preenchido por cultura/região
- Exportar PDF/CSV
- CTA para o software após calcular

#### 4.2 — Ponto de Equilíbrio / Break-even (#19)
- Dois modos: por produtividade e por preço
- Margem de segurança (%)
- Gráfico: custo × receita com ponto de cruzamento

#### 4.3 — Precificação de Venda (#20)
- Preço mínimo (cobre custos) vs preço com margem
- Funrural automático (PF/PJ)
- Comparativo com preço atual da bolsa

#### 4.4 — Calculadora de Funrural (#31)
- Alíquotas vigentes: PF 1,5% / PJ 2,85%
- Decomposição: Funrural + RAT + SENAR
- Exportação é imune

---

## Fase 5 — Financeiro Avançado

### Objetivo
Simuladores financeiros para decisões estratégicas de safra.

### Ferramentas

#### 5.1 — Simulador de Lucro da Safra (#18)
- 3 cenários: pessimista, realista, otimista
- Gráfico de barras com cenários lado a lado
- Slider "E se?" para ajustar preço em tempo real

#### 5.2 — Simulador de Financiamento Rural (#21)
- Linhas: Pronaf, Pronamp, Moderfrota, ABC, FCO
- Sistemas SAC, PRICE e Bullet
- Tabela de amortização exportável
- Comparativo SAC vs PRICE

#### 5.3 — Calculadora de Arrendamento Rural (#22)
- Modalidades: sacas/ha × preço ou R$/ha fixo
- Comparativo: vale mais comprar terra?
- Referências regionais (MT, GO)

#### 5.4 — Fluxo de Caixa Rural 3 meses (#23)
- Projeção de entradas vs saídas por mês
- Saldo acumulado
- Alerta de déficit

#### 5.5 — ROI Agrícola (#24)
- ROI da safra e ROI anualizado
- Comparativo: CDB, Tesouro IPCA+, Poupança

---

## Fase 6 — Operacional Avançado + Grãos

### Objetivo
Ferramentas de decisão sobre investimento em máquinas e armazenagem.

### Ferramentas

#### 6.1 — Custo de Máquinas: Compra × Aluguel × Terceirização (#10)
- Comparativo detalhado com decomposição de custos
- Break-even: horas/ano para compra ser viável
- Gráfico de barras com componentes do custo

#### 6.2 — Depreciação + Manutenção de Máquinas (#11)
- Métodos: linear e por horas
- Custo de manutenção crescente com idade
- Tabela ano a ano com valor de mercado

#### 6.3 — Logística de Transporte de Grãos (#15)
- R$/tonelada, R$/saca, frete como % do preço
- Comparativo entre veículos (truck, carreta, bitrem, rodotrem)
- Referência ANTT

#### 6.4 — Viabilidade de Armazenagem: Vender × Guardar (#28)
- Custo de oportunidade (capital)
- Recomendação automática
- Preço futuro mínimo (break-even da armazenagem)

#### 6.5 — Custo de Armazenagem: Silo Próprio vs Terceiro (#29)
- Break-even do investimento em silo próprio
- Economia anual após break-even

---

## Fase 7 — Tributário + Inteligente

### Objetivo
Ferramentas tributárias (urgência pela Reforma Tributária) e planejamento temporal.

### Ferramentas

#### 7.1 — Reforma Tributária para Produtor Rural (#30)
- Simulação do impacto da EC 132/2023
- Regime atual vs regime novo (CBS + IBS)
- Créditos aproveitáveis
- Disclaimer obrigatório + premissas

#### 7.2 — Calculadora de ITR (#32)
- Tabela de alíquotas por área e GU
- Cálculo do grau de utilização
- Imposto por hectare

#### 7.3 — Rentabilidade por Cultura com Impostos (#33)
- Comparativo de lucro líquido entre culturas
- Funrural + ICMS por estado
- Gráfico de barras comparativo

#### 7.4 — Janela de Plantio (#16)
- Zoneamento MAPA (ZARC) por município
- Indicador de risco por data
- Data de colheita estimada

---

## Fase 8 — Lead Magnets

### Objetivo
Ferramentas de alta conversão em leads e clientes.

### Ferramentas

#### 8.1 — Diagnóstico de Gestão da Fazenda (#40) ⭐⭐
- Quiz 12 perguntas, 6 dimensões
- Gráfico radar com score
- Gate de e-mail para relatório completo
- CTA personalizado baseado nas fraquezas
- Compartilhável

#### 8.2 — Simulador de ROI do Software (#41)
- 3 perguntas simples → economia estimada
- ROI e payback do software
- Gate de contato (nome + e-mail + telefone)

#### 8.3 — Simulador de Safra com Heatmap (#39)
- Heatmap: preço × produtividade → lucro/prejuízo
- Slider interativo em tempo real
- Chart.js ou D3.js
- Exportar como imagem para WhatsApp

---

## Fase 9 — Diferenciais Técnicos

### Objetivo
Ferramentas avançadas que posicionam autoridade no mercado.

### Ferramentas

#### 9.1 — Custo por Talhão com Ranking (#25)
- Até 20 talhões simultâneos
- Ranking visual do mais ao menos rentável
- Demonstração do que o software pago faz

#### 9.2 — Calculadora de Irrigação (#42)
- ETo Penman-Monteith simplificado
- Kc por fase da cultura
- Turno de rega e custo estimado

#### 9.3 — Calculadora de Área por GPS (#43)
- Leaflet.js com mapa interativo
- Modo desktop (clique) e mobile (GPS)
- Algoritmo de Shoelace para área de polígono
- Import/export KML

#### 9.4 — Comparador de Culturas (#44)
- Até 4 culturas simultâneas
- Ranking com gráfico de barras
- Análise de risco (variação de preço)

#### 9.5 — Balanço Hídrico & Pluviometria (#37)
- Evapotranspiração (Hargreaves simplificado)
- Alerta por fase crítica
- Condição: Adequado / Déficit / Excesso

---

## Dependências entre Fases

```
Fase 0 ─────► Fase 1 (Quick Wins)
   │              │
   │              ▼
   ├─────► Fase 2 (Agronômicas) ──► Fase 3 (Operacionais)
   │                                     │
   │                                     ▼
   ├─────► Fase 4 (Financeiro Core) ──► Fase 5 (Financeiro Avançado)
   │              │
   │              ▼
   ├─────► Fase 6 (Operacional Avançado + Grãos)
   │
   ├─────► Fase 7 (Tributário)
   │
   ├─────► Fase 8 (Lead Magnets) — depende de Fase 4 (usa dados de custo)
   │
   └─────► Fase 9 (Diferenciais) — independente
```

**Fase 0 é bloqueante** — tudo depende dela.  
Fases 1–7 podem ser paralelizadas após Fase 0.  
Fase 8 usa conceitos da Fase 4 (custo de produção).  
Fase 9 é independente.

---

## Technical Conventions

### Language Rules

| Scope | Language | Example |
|-------|----------|---------|
| File names | English | `SeedingRate.tsx`, `liming-calculator.ts` |
| Folder names | English | `tools/agronomic/`, `utils/` |
| Components | English PascalCase | `SeedingRateCalculator`, `MoistureDiscount` |
| Functions/variables | English camelCase | `calculateLimingRate()`, `baseSaturation` |
| Comments | English | `// Calculate nutrient removal per ton` |
| Types/interfaces | English PascalCase | `SoilAnalysis`, `FertilizerFormula` |
| UI text (labels, descriptions, results) | **Portuguese (pt-BR)** | `"Saturação por Bases (V%)"` |
| Route slugs | English kebab-case | `/tools/seeding-rate`, `/tools/liming` |

### File Naming Map (PLAN.md # → English file name)

| # | PT-BR Name | English File | Route |
|---|-----------|-------------|-------|
| 1 | Taxa de Semeadura | `SeedingRate.tsx` | `/tools/seeding-rate` |
| 2 | Calagem | `LimingCalculator.tsx` | `/tools/liming` |
| 3 | Adubação NPK | `NpkFertilization.tsx` | `/tools/npk-fertilization` |
| 4 | Exportação de Nutrientes | `NutrientRemoval.tsx` | `/tools/nutrient-removal` |
| 5 | Conversor de Formulação NPK | `NpkFormulaComparer.tsx` | `/tools/npk-formula-comparer` |
| 6 | Espaçamento de Plantio | `PlantSpacing.tsx` | `/tools/plant-spacing` |
| 7 | Estimativa de Produtividade | `PreHarvestYield.tsx` | `/tools/pre-harvest-yield` |
| 8 | Perdas na Colheita | `HarvestLoss.tsx` | `/tools/harvest-loss` |
| 9 | Produtividade por Hectare | `YieldConverter.tsx` | `/tools/yield-converter` |
| 10 | Custo de Máquinas | `MachineryCost.tsx` | `/tools/machinery-cost` |
| 11 | Depreciação de Máquinas | `MachineDepreciation.tsx` | `/tools/machine-depreciation` |
| 12 | Calibração de Pulverizador | `SprayerCalibration.tsx` | `/tools/sprayer-calibration` |
| 13 | Capacidade Operacional | `OperationalCapacity.tsx` | `/tools/operational-capacity` |
| 14 | Consumo de Combustível | `FuelConsumption.tsx` | `/tools/fuel-consumption` |
| 15 | Logística de Transporte | `GrainFreight.tsx` | `/tools/grain-freight` |
| 16 | Janela de Plantio | `PlantingWindow.tsx` | `/tools/planting-window` |
| 17 | Custo de Produção | `ProductionCost.tsx` | `/tools/production-cost` |
| 18 | Simulador de Lucro | `CropProfitSimulator.tsx` | `/tools/crop-profit-simulator` |
| 19 | Ponto de Equilíbrio | `BreakEvenCalculator.tsx` | `/tools/break-even` |
| 20 | Precificação de Venda | `SalePricing.tsx` | `/tools/sale-pricing` |
| 21 | Financiamento Rural | `RuralFinancing.tsx` | `/tools/rural-financing` |
| 22 | Arrendamento Rural | `FarmLease.tsx` | `/tools/farm-lease` |
| 23 | Fluxo de Caixa | `CashFlow.tsx` | `/tools/cash-flow` |
| 24 | ROI Agrícola | `FarmRoi.tsx` | `/tools/farm-roi` |
| 25 | Custo por Talhão | `FieldCostRanking.tsx` | `/tools/field-cost-ranking` |
| 26 | Desconto Umidade/Impureza | `MoistureDiscount.tsx` | `/tools/moisture-discount` |
| 27 | Perda por Secagem | `DryingLoss.tsx` | `/tools/drying-loss` |
| 28 | Viabilidade de Armazenagem | `StorageViability.tsx` | `/tools/storage-viability` |
| 29 | Custo de Armazenagem | `StorageCost.tsx` | `/tools/storage-cost` |
| 30 | Reforma Tributária | `TaxReform.tsx` | `/tools/tax-reform` |
| 31 | Funrural | `FunruralCalculator.tsx` | `/tools/funrural` |
| 32 | ITR | `ItrCalculator.tsx` | `/tools/itr` |
| 33 | Rentabilidade por Cultura | `CropProfitability.tsx` | `/tools/crop-profitability` |
| 34 | Conversor de Medidas | `UnitConverter.tsx` | `/tools/unit-converter` |
| 35 | Tank Mix | `TankMix.tsx` | `/tools/tank-mix` |
| 36 | Mistura de Calda | `SprayMix.tsx` | `/tools/spray-mix` |
| 37 | Balanço Hídrico | `WaterBalance.tsx` | `/tools/water-balance` |
| 38 | Conversor Sc/Kg/Bushel | *(merged into #9)* | — |
| 39 | Simulador de Safra | `CropSimulator.tsx` | `/tools/crop-simulator` |
| 40 | Diagnóstico de Gestão | `FarmDiagnostics.tsx` | `/tools/farm-diagnostics` |
| 41 | ROI do Software | `SoftwareRoi.tsx` | `/tools/software-roi` |
| 42 | Irrigação | `IrrigationCalculator.tsx` | `/tools/irrigation` |
| 43 | Área por GPS | `GpsAreaCalculator.tsx` | `/tools/gps-area` |
| 44 | Comparador de Culturas | `CropComparer.tsx` | `/tools/crop-comparer` |

### Component Pattern (every calculator)

```tsx
// SeedingRate.tsx
export default function SeedingRate() {
  // 1. State for inputs
  // 2. State for results (null until calculated)
  // 3. calculate() function with validation
  // 4. clear() function
  // 5. Render: CalculatorLayout > inputs > ActionButtons > ResultCard
}
```

### Validation
- Required fields checked before calculating
- Negative values blocked
- Specific ranges per field (as defined in PLAN.md)

### Formatting
- BR numbers: `1.234,56` (dot thousands, comma decimal)
- Currency: `R$ 1.234,56`
- Percentage: `35,2%`

### Responsiveness
- Mobile-first (single column inputs)
- Desktop: 2-column inputs when applicable
- Result always full-width

---

*Plan created on 2026-04-06 — based on PLAN.md v1.0*
