// Script to add about/methodology props to all CalculatorLayout usages
const fs = require('fs')
const path = require('path')

const TOOL_ABOUT = {
  // ── Agronomic ──
  'SeedingRate.tsx': {
    about: 'A taxa de semeadura determina quantos quilos de semente são necessários por hectare para atingir a população de plantas desejada. Considera o peso de mil sementes (PMS), poder germinativo e vigor, garantindo que o estande final atenda as recomendações técnicas para cada cultura.',
    methodology: 'Fórmula: kg/ha = (População desejada × PMS) / (Germinação × Vigor × 10). Baseado nas recomendações da EMBRAPA e manuais de fitotecnia.',
  },
  'LimingCalculator.tsx': {
    about: 'A calagem é a prática de correção da acidez do solo com calcário, essencial para disponibilizar nutrientes e melhorar a CTC efetiva. O cálculo considera a análise de solo e a saturação por bases (V%) alvo da cultura.',
    methodology: 'Método da Saturação por Bases: NC (t/ha) = (V2 - V1) × CTC / (PRNT × 10). V2 = saturação alvo, V1 = saturação atual. Referência: Boletim IAC 100, EMBRAPA Cerrados.',
  },
  'NpkFertilization.tsx': {
    about: 'A adubação NPK calcula as quantidades de nitrogênio, fósforo e potássio necessárias para repor o que a cultura exporta e corrigir deficiências do solo. Ajusta as doses conforme teores de P e K na análise de solo.',
    methodology: 'Baseado nas tabelas de recomendação da EMBRAPA Cerrados e Boletim IAC 100. Considera classe textural do solo, teor de P (Mehlich-1) e K trocável para definir faixas de resposta.',
  },
  'NutrientRemoval.tsx': {
    about: 'Calcula os nutrientes exportados do solo a cada colheita (N, P₂O₅, K₂O, S), essencial para planejar a reposição via adubação e manter a fertilidade ao longo das safras.',
    methodology: 'Tabela de exportação por tonelada de grão colhido. Fontes: EMBRAPA, Boletim IAC 100, Vitti & Mazza (2002).',
  },
  'NpkFormulaComparer.tsx': {
    about: 'Compare diferentes formulações de adubo NPK pelo custo por ponto de nutriente (R$/kg de N, P₂O₅ ou K₂O). Identifique qual fornecedor ou formulação oferece o melhor custo-benefício.',
    methodology: 'Custo por ponto = Preço da tonelada / (% do nutriente na fórmula × 10). Compara até 4 formulações simultaneamente.',
  },
  'PlantSpacing.tsx': {
    about: 'Calcule a população de plantas por hectare a partir do espaçamento entre linhas e entre plantas. Essencial para ajustar a regulagem da plantadeira e otimizar o estande.',
    methodology: 'População (plantas/ha) = 10.000m² / (espaçamento entre linhas × espaçamento entre plantas, em metros). Distância entre plantas = 1 / (plantas por metro linear).',
  },
  'PlantingWindow.tsx': {
    about: 'Consulte as janelas ideais de plantio por região e cultura, considerando o zoneamento agroclimático e o risco climático. Planeje a semeadura para maximizar o potencial produtivo.',
    methodology: 'Baseado no Zoneamento Agrícola de Risco Climático (ZARC) do MAPA e nas recomendações regionais da EMBRAPA para cada UF.',
  },

  // ── Operational ──
  'PreHarvestYield.tsx': {
    about: 'Estime a produtividade da lavoura antes da colheita através de amostragem no campo. Colete dados de vagens/espigas, grãos por vagem e peso para projetar sc/ha.',
    methodology: 'Soja: Produtividade = (plantas/m² × vagens/planta × grãos/vagem × PMS) / (peso saca × 1000). Milho: (espigas/m² × grãos/espiga × PMS) / (peso saca × 1000).',
  },
  'HarvestLoss.tsx': {
    about: 'Quantifique as perdas de grãos durante a colheita mecânica. Cada grão no chão significa sacas a menos no silo. Identifique se as perdas estão na plataforma, nos mecanismos internos ou na distribuição.',
    methodology: 'Soja: 1 grão/m² ≈ 1 saca/ha de perda. Milho: 1 grão/m² ≈ 0.15 sc/ha. O tolerável é até 1 sc/ha para soja e 1.5 sc/ha para milho.',
  },
  'SprayerCalibration.tsx': {
    about: 'Calibre o pulverizador para garantir a dose correta de defensivos por hectare. Um pulverizador mal calibrado desperdiça produto, aumenta custo e pode comprometer a eficácia.',
    methodology: 'Volume de calda (L/ha) = (Vazão total × 600) / Velocidade × Largura efetiva. Área por tanque = Volume do tanque / Volume de calda por ha.',
  },
  'OperationalCapacity.tsx': {
    about: 'Calcule quantos hectares a máquina cobre por hora e quanto tempo levará para completar toda a área. Fundamental para dimensionar a frota e planejar as operações na janela disponível.',
    methodology: 'Capacidade operacional (ha/h) = (Largura × Velocidade × Eficiência) / 10. Tempo total = Área / Capacidade operacional.',
  },
  'FuelConsumption.tsx': {
    about: 'Calcule o consumo de diesel por hectare para cada operação mecanizada. Compare custos entre operações e identifique onde economizar combustível.',
    methodology: 'Consumo L/ha = Consumo horário (L/h) / Capacidade operacional (ha/h). Valores de referência por operação baseados em ensaios da EMBRAPA e CONAB.',
  },
  'MachineryCost.tsx': {
    about: 'Compare o custo total de possuir, alugar ou terceirizar máquinas agrícolas. Inclui depreciação, manutenção, juros, seguro, combustível e operador.',
    methodology: 'Custo de propriedade = Depreciação + Juros + Seguro + Manutenção + Combustível + Operador. Depreciação linear com valor residual. Juros sobre capital médio investido.',
  },
  'MachineDepreciation.tsx': {
    about: 'Calcule a depreciação anual de tratores, colhedoras, plantadeiras e pulverizadores. Acompanhe a perda de valor e o custo crescente de manutenção ao longo dos anos.',
    methodology: 'Linear: Depreciação = (Valor inicial - Valor residual) / Vida útil. Por horas: Depreciação = (Valor - Residual) / Horas totais de vida útil. Manutenção crescente por faixas etárias.',
  },
  'GrainFreight.tsx': {
    about: 'Simule o custo de frete para transportar grãos da fazenda até o armazém, porto ou cooperativa. Compare veículos e calcule o impacto no preço líquido.',
    methodology: 'Custo total = (Distância × Custo por km) + Pedágios. Custo por saca = Custo total / (Capacidade do veículo / Peso da saca). Referência: tabela ANTT de fretes mínimos.',
  },

  // ── Financial ──
  'ProductionCost.tsx': {
    about: 'Some todos os custos da safra — insumos, operações, custos fixos e pós-colheita — e descubra o custo por hectare e por saca. Identifique o ponto de equilíbrio da produtividade.',
    methodology: 'Custo total = Σ(Insumos + Operações + Custos fixos + Pós-colheita). Custo por saca = Custo total / Produtividade. Break-even = Custo total / Preço da saca.',
  },
  'BreakEven.tsx': {
    about: 'Descubra a produtividade mínima necessária para cobrir todos os custos, ou o preço mínimo de venda que evita prejuízo. Fundamental para tomada de decisão de venda.',
    methodology: 'Break-even por produtividade: sc/ha = Custo total (R$/ha) / Preço (R$/sc). Break-even por preço: R$/sc = Custo total / Produtividade esperada.',
  },
  'SalePricing.tsx': {
    about: 'Calcule o preço mínimo de venda que cobre todos os custos e impostos, e defina sua margem de lucro desejada. Considere Funrural, ICMS e comissões.',
    methodology: 'Preço mínimo = Custo por saca / (1 - Funrural% - ICMS% - Comissão%). Preço com margem = Preço mínimo / (1 - Margem desejada%).',
  },
  'CropProfitSimulator.tsx': {
    about: 'Simule 3 cenários de resultado da safra (pessimista, realista e otimista) variando produtividade e preço. Visualize o risco e potencial de lucro antes de plantar.',
    methodology: 'Lucro = (Produtividade × Preço - Funrural) - Custo. Cenários aplicam variação de ±15% (pessimista/otimista) sobre os valores base.',
  },
  'RuralFinancing.tsx': {
    about: 'Simule financiamentos rurais com as principais linhas de crédito (Pronaf, Pronamp, Moderfrota, ABC). Compare sistemas SAC e PRICE com carência e taxas subsidiadas.',
    methodology: 'SAC: Amortização constante, juros decrescentes. PRICE: Parcela fixa (PMT = PV × i / (1 - (1+i)^-n)). Taxas e prazos conforme Manual de Crédito Rural (MCR) do Banco Central.',
  },
  'FarmLease.tsx': {
    about: 'Calcule o custo do arrendamento rural em sacas por hectare ou valor fixo. Compare regiões e avalie se arrendar é mais vantajoso que investir na compra de terra.',
    methodology: 'Custo anual = Fator de arrendamento (sc/ha) × Preço da saca × Área. Custo equivalente mensal para comparação com financiamento. Referências regionais da CONAB.',
  },
  'CashFlow.tsx': {
    about: 'Projete o fluxo de caixa da fazenda para os próximos 3 meses. Visualize quando o saldo ficará negativo e planeje antecipadamente a necessidade de capital de giro.',
    methodology: 'Saldo mensal = Saldo anterior + Receitas - Despesas (operacionais + fixas + investimentos). Saldo acumulado progressivo.',
  },
  'FarmROI.tsx': {
    about: 'Calcule o retorno sobre o investimento (ROI) da safra e compare com aplicações financeiras como CDI. Descubra se a atividade agrícola está remunerando adequadamente o capital.',
    methodology: 'ROI = (Receita líquida - Custo total) / Custo total × 100. Comparação com CDI: Rendimento CDI = Capital × (1 + CDI%)^(meses/12) - Capital.',
  },
  'FieldCostRanking.tsx': {
    about: 'Compare a rentabilidade de diferentes talhões da fazenda. Identifique quais áreas são mais e menos lucrativas para direcionar investimentos e manejo diferenciado.',
    methodology: 'Lucro por talhão = (Produtividade × Preço - Custo) × Área. Ranking ordenado por lucro/ha, com indicadores visuais de desempenho relativo.',
  },

  // ── Grain ──
  'MoistureDiscount.tsx': {
    about: 'Calcule os descontos aplicados na balança por umidade e impureza acima do padrão. Saiba exatamente quanto peso líquido você receberá após os descontos.',
    methodology: 'Desconto por umidade = Peso × (Umidade real - Umidade padrão) / (100 - Umidade padrão). Desconto por impureza = Peso × (Impureza real - Impureza padrão) / 100. Padrões conforme IN MAPA.',
  },
  'DryingLoss.tsx': {
    about: 'Calcule a quebra de peso durante a secagem de grãos. Ao reduzir a umidade, parte do peso se perde em água evaporada — saiba exatamente quanto.',
    methodology: 'Peso seco = Peso úmido × (100 - Umidade inicial) / (100 - Umidade final). Perda = Peso úmido - Peso seco. Fórmula clássica de conservação de matéria seca.',
  },
  'StorageViability.tsx': {
    about: 'Decida entre vender o grão agora ou armazenar para vender mais tarde. Compare o ganho esperado com valorização contra os custos de armazenagem, quebra técnica e custo de oportunidade.',
    methodology: 'Ganho com espera = (Preço futuro - Preço atual) × Volume. Custo de espera = Armazenagem + Quebra técnica + Custo capital + Seguro. Viável se Ganho > Custo.',
  },
  'StorageCost.tsx': {
    about: 'Compare o custo de armazenar grãos em silo próprio versus silo de terceiros (cooperativa/armazém geral). Considere depreciação, manutenção e taxas.',
    methodology: 'Silo próprio: Custo = (Investimento / Vida útil + Manutenção + Energia) / Capacidade. Terceiros: Custo = Tarifa mensal × Meses. Ponto de equilíbrio em volume e tempo.',
  },

  // ── Tax ──
  'Funrural.tsx': {
    about: 'Calcule a contribuição do Funrural (INSS Rural) sobre a receita bruta da comercialização agropecuária. Inclui Funrural, RAT e SENAR, diferenciando pessoa física e jurídica.',
    methodology: 'PF: 1,2% Funrural + 0,1% RAT + 0,2% SENAR = 1,5% total. PJ: 2,5% Funrural + 0,1% RAT + 0,25% SENAR = 2,85% total. Base legal: Lei 13.606/2018.',
  },
  'TaxReform.tsx': {
    about: 'Simule o impacto da Reforma Tributária (EC 132/2023) no produtor rural. Compare a carga atual (PIS/COFINS/ICMS) com o novo IVA Dual (CBS + IBS) e o regime diferenciado para o agro.',
    methodology: 'CBS (federal): 8,8% padrão. IBS (estadual/municipal): 17,7% padrão. Insumos agropecuários: redução de 60% na alíquota (alíquota efetiva ≈ 10,6%). Transição: 2026-2032.',
  },
  'ItrCalculator.tsx': {
    about: 'Calcule o Imposto Territorial Rural (ITR) com base na área do imóvel, valor da terra nua (VTN) e grau de utilização. Quanto mais produtiva a terra, menor a alíquota.',
    methodology: 'Alíquota definida pelo cruzamento: faixa de área total × grau de utilização (GU). VTNt = VTN × (Área total - Área não tributável). ITR = VTNt × Alíquota. Base: Lei 9.393/1996.',
  },
  'CropProfitability.tsx': {
    about: 'Compare a rentabilidade líquida de até 4 culturas diferentes lado a lado, já com desconto de Funrural e custos. Identifique qual cultura remunera melhor na sua região.',
    methodology: 'Receita bruta = Produtividade × Preço. Receita líquida = Receita bruta - Funrural. Lucro = Receita líquida - Custo. Margem = Lucro / Receita líquida × 100.',
  },

  // ── Utilities ──
  'UnitConverter.tsx': {
    about: 'Converta entre as principais unidades usadas no agronegócio brasileiro: hectares, alqueires (paulista, mineiro, goiano), sacas, arrobas, bushels, e medidas de produtividade.',
    methodology: 'Conversões exatas: 1 alqueire paulista = 2,42 ha, 1 alqueire mineiro/goiano = 4,84 ha, 1 saca = 60 kg (grãos), 1 arroba = 15 kg, 1 bushel soja = 27,216 kg.',
  },
  'YieldConverter.tsx': {
    about: 'Converta produtividade entre sacas/ha, kg/ha, t/ha e bushels/acre. Inclui referências de produtividade média por estado para contextualizar seus números.',
    methodology: 'sc/ha = kg/ha / peso_saca. t/ha = kg/ha / 1000. bu/ac soja = kg/ha × 0.0148. bu/ac milho = kg/ha × 0.01593. Referências: CONAB safra 2023/24.',
  },
  'TankMix.tsx': {
    about: 'Calcule a quantidade exata de cada defensivo para o tanque do pulverizador. Respeite a ordem de mistura correta (WG → SC → EC → SL) para evitar incompatibilidades.',
    methodology: 'Quantidade por tanque = Dose (L ou kg/ha) × Volume do tanque (L) / Volume de calda (L/ha). Ordem de adição: pós molháveis → suspensões → emulsões → soluções.',
  },
  'SprayMix.tsx': {
    about: 'Calcule rapidamente a dose de produto por tanque para a pulverização. Informe a dose por hectare, o volume de calda e a capacidade do tanque.',
    methodology: 'Dose por tanque = Dose/ha × (Volume do tanque / Volume de calda por ha). Hectares por tanque = Volume do tanque / Volume de calda por ha.',
  },
  'WaterBalance.tsx': {
    about: 'Monitore o balanço hídrico da lavoura: compare a chuva recebida com a demanda da cultura (ETc). Identifique déficit ou excesso hídrico para tomar decisões de irrigação.',
    methodology: 'ETc = ETo × Kc (coeficiente da cultura por fase). ETo estimada por Hargreaves: 0,0023 × Ra × (Tmed + 17,8) × √(Tmax - Tmin). Balanço = Precipitação - ETc.',
  },

  // ── Lead Magnets ──
  'FarmDiagnostics.tsx': {
    about: 'Faça um diagnóstico rápido da maturidade de gestão da sua fazenda. Responda 12 perguntas em 6 dimensões (financeiro, insumos, planejamento, máquinas, fiscal e tecnologia) e receba uma pontuação.',
    methodology: 'Cada pergunta pontua de 0 a 3 (nunca, às vezes, quase sempre, sempre). Pontuação total: 0-36 pontos. Classificação: Iniciante (0-36%), Em desenvolvimento (36-72%), Avançado (72-100%).',
  },
  'SoftwareROI.tsx': {
    about: 'Descubra quanto você pode economizar adotando um software de gestão agrícola. Calcule o retorno sobre o investimento considerando redução de perdas, melhor timing de venda e economia de insumos.',
    methodology: 'Economia = Redução perdas (0,7 sc/ha) + Melhor timing (R$3/sc) + Economia insumos (1,5%) + Tempo economizado (R$100/h). ROI = (Economia anual - Custo software) / Custo software × 100.',
  },
  'CropSimulator.tsx': {
    about: 'Visualize todos os cenários de lucro em um heatmap que cruza preço de venda com produtividade. Identifique rapidamente quais combinações geram lucro e quais significam prejuízo.',
    methodology: 'Matriz 7×7 de preço × produtividade. Lucro = (Preço × Produtividade × Peso saca) - (Custo/ha × Área) - Funrural. Cores: verde (lucro) → vermelho (prejuízo).',
  },
  'Irrigation.tsx': {
    about: 'Calcule a lâmina de irrigação necessária (mm), o turno de rega e a estimativa de custo por hectare. Considere o tipo de solo, cultura, fase fenológica e sistema de irrigação.',
    methodology: 'Lâmina líquida = (CC - PMP) × profundidade × fator de disponibilidade. Lâmina bruta = Lâmina líquida / Eficiência do sistema. Turno de rega = Lâmina / ETc diário. ETo por Hargreaves.',
  },
  'GpsArea.tsx': {
    about: 'Calcule a área de um polígono definido por coordenadas GPS (latitude/longitude). Obtenha a área em hectares, alqueires e metros quadrados, além do perímetro.',
    methodology: 'Algoritmo do Shoelace (Gauss) adaptado para coordenadas esféricas. Perímetro calculado pela fórmula de Haversine. Precisão adequada para áreas rurais.',
  },
  'CropComparer.tsx': {
    about: 'Compare a rentabilidade de múltiplas culturas lado a lado. Insira produtividade esperada, preço de venda e custo de produção para cada cultura e veja qual oferece maior lucro por hectare.',
    methodology: 'Receita bruta = Produtividade × Preço × Peso da saca. Lucro = Receita bruta - Custo total. Margem = Lucro / Receita × 100. Visualização comparativa em barras.',
  },
}

// Process all tool files
const toolDirs = [
  'src/tools/agronomic',
  'src/tools/operational',
  'src/tools/financial',
  'src/tools/grain',
  'src/tools/tax',
  'src/tools/utilities',
  'src/tools/lead-magnets',
]

const root = '/home/felipe/Documents/Personal/Me/.projects/agro-sak'
let modified = 0
let skipped = 0

for (const dir of toolDirs) {
  const fullDir = path.join(root, dir)
  if (!fs.existsSync(fullDir)) continue
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.tsx'))
  for (const file of files) {
    const data = TOOL_ABOUT[file]
    if (!data) {
      console.log(`SKIP (no data): ${dir}/${file}`)
      skipped++
      continue
    }
    const filePath = path.join(fullDir, file)
    let content = fs.readFileSync(filePath, 'utf-8')
    
    // Check if already has about prop
    if (content.includes('about=')) {
      console.log(`SKIP (already has about): ${dir}/${file}`)
      skipped++
      continue
    }
    
    // Find the CalculatorLayout opening and add about/methodology after description
    const pattern = /(      description="[^"]*")\n(      result=)/
    const match = content.match(pattern)
    if (!match) {
      console.log(`WARN (pattern not found): ${dir}/${file}`)
      skipped++
      continue
    }
    
    const aboutStr = `      about="${data.about}"`
    const methodStr = `      methodology="${data.methodology}"`
    content = content.replace(pattern, `$1\n${aboutStr}\n${methodStr}\n$2`)
    
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`OK: ${dir}/${file}`)
    modified++
  }
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`)
