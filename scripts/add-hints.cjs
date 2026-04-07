/**
 * Script to add hint= props to InputField components across all tools.
 * Maps label text -> hint text, then inserts hint= before the closing />
 * of each InputField that doesn't already have a hint.
 */
const fs = require('fs');
const path = require('path');

// ── Hint mappings by label text (exact or partial match) ──
const HINT_MAP = {
  // ── Common labels across many tools ──
  'Área': 'Área total a ser trabalhada em hectares',
  'Área plantada': 'Área cultivada na safra atual',
  'Área total': 'Área total da propriedade ou talhão em hectares',
  'Área arrendada': 'Área total sob contrato de arrendamento',
  'Área da fazenda': 'Área total da propriedade rural',
  'Área total do imóvel': 'Área total registrada no CCIR/INCRA',
  'Área efetivamente utilizada': 'Área com lavoura, pastagem ou exploração extrativa',
  'Área atendida': 'Área total irrigada ou atendida pelo equipamento',
  'Área a aplicar': 'Área total que receberá a aplicação',

  'Produtividade': 'Produtividade média esperada em sacas por hectare',
  'Produtividade esperada': 'Média de sacas por hectare para a safra',
  'Produtividade média': 'Média de produção em sacas por hectare',

  'Preço da saca': 'Preço de venda na região em R$ por saca',
  'Preço de venda': 'Preço esperado de venda no mercado',
  'Preço de venda da saca': 'Preço de venda praticado no mercado local',
  'Preço por saca': 'Valor da saca de referência no mercado',
  'Preço de referência': 'Preço referência da saca na praça local',
  'Preço médio da saca': 'Média do preço na safra',
  'Preço da saca (referência)': 'Preço da saca para cálculo da receita',
  'Preço atual no mercado': 'Cotação atual da saca na região',
  'Preço atual (colheita)': 'Preço na data de colheita',
  'Preço futuro esperado': 'Preço projetado para o momento da venda futura',

  'Custo de produção': 'Custo total por hectare com insumos, operações e fixos',
  'Custo total de produção': 'Soma de todos os custos na safra por hectare',
  'Custo total': 'Custo operacional mais custos fixos',
  'Custo (sem arrendamento)': 'Custo de produção excluindo o arrendamento',

  'Peso da saca': 'Peso padrão da saca para a cultura selecionada',

  // ── Agronomic: Liming ──
  'CTC a pH 7': 'Capacidade de troca catiônica do laudo de solo',
  'Saturação por bases atual (V%)': 'V% informado no laudo de análise de solo',
  'Saturação por bases desejada (V%)': 'V% alvo: 50% para grãos, 60-70% para hortaliças',
  'PRNT do calcário': 'Poder relativo de neutralização total (informado pelo fabricante)',
  'Preço do calcário por tonelada (opcional)': 'Preço FOB ou CIF por tonelada do calcário',

  // ── Agronomic: NPK ──
  'N alvo': 'Dose total de nitrogênio recomendada para a cultura (kg/ha)',
  'P₂O₅ alvo': 'Dose de fósforo recomendada conforme análise de solo (kg/ha)',
  'K₂O alvo': 'Dose de potássio recomendada conforme análise de solo (kg/ha)',
  'Fósforo no solo (P Mehlich)': 'Teor de fósforo disponível no laudo (mg/dm³)',
  'Potássio no solo (K)': 'Teor de potássio trocável no laudo (cmolc/dm³)',
  'Matéria orgânica (opcional)': 'Valor do laudo; influencia a disponibilidade de N',

  // ── Agronomic: NPK Comparer ──
  'N': 'Teor de nitrogênio do formulado (%)',
  'P₂O₅': 'Teor de fósforo do formulado (%)',
  'K₂O': 'Teor de potássio do formulado (%)',
  'Preço por saco 50kg': 'Preço de compra do formulado por saco de 50 kg',
  'Fornecedor (opcional)': 'Nome do fornecedor para identificação',

  // ── Agronomic: Nutrient Removal ──
  'N exportado': 'Coeficiente de extração de N por tonelada de grãos (kg/t)',
  'P₂O₅ exportado': 'Coeficiente de extração de P₂O₅ por tonelada (kg/t)',
  'K₂O exportado': 'Coeficiente de extração de K₂O por tonelada (kg/t)',
  'S exportado': 'Coeficiente de extração de enxofre por tonelada (kg/t)',
  'Área total (opcional)': 'Para cálculo do total de nutrientes exportados',

  // ── Agronomic: Seeding Rate ──
  'População desejada': 'População final de plantas por hectare',
  'Espaçamento entre linhas': 'Distância entre linhas de plantio em centímetros',
  'Germinação': 'Taxa de germinação do lote de sementes (%)',
  'Vigor / Fator de campo': 'Fator de sobrevivência a campo (reduz a emergência efetiva)',
  'PMG (Peso de mil sementes)': 'Peso de 1.000 sementes em gramas (informado no lote)',
  'Preço da saca de semente (opcional)': 'Preço da saca de 40 kg de sementes',
  'Espaçamento entre plantas': 'Distância entre plantas na linha de plantio (cm)',

  // ── Agronomic: Seed Treatment ──
  'Taxa de semeadura': 'Quantidade de sementes utilizadas por hectare (kg/ha)',
  'Dose personalizada': 'Dose do produto conforme recomendação técnica',
  'Preço personalizado': 'Preço do produto por litro ou kg',

  // ── Agronomic: Soil Analysis ──
  'pH (CaCl₂)': 'Valor de pH medido em cloreto de cálcio',
  'Matéria Orgânica': 'Teor de matéria orgânica do solo (g/dm³)',
  'Fósforo (P resina)': 'Fósforo disponível por resina trocadora (mg/dm³)',
  'Potássio (K)': 'Potássio trocável do laudo (mmolc/dm³)',
  'Cálcio (Ca)': 'Cálcio trocável (mmolc/dm³)',
  'Magnésio (Mg)': 'Magnésio trocável (mmolc/dm³)',
  'H+Al (Acidez)': 'Acidez potencial do solo (mmolc/dm³)',
  'Enxofre (S)': 'Enxofre disponível (mg/dm³)',
  'Boro (B)': 'Micronutriente para floração e granação (mg/dm³)',
  'Cobre (Cu)': 'Micronutriente para defesa da planta (mg/dm³)',
  'Manganês (Mn)': 'Micronutriente para fotossíntese (mg/dm³)',
  'Zinco (Zn)': 'Micronutriente para crescimento inicial (mg/dm³)',

  // ── Agronomic: Soil Sampling ──
  'Área total': 'Área total da propriedade ou talhão em hectares',
  'Zonas de manejo': 'Número de zonas homogêneas de manejo',
  'Custo por amostra': 'Valor cobrado pelo laboratório por amostra',

  // ── Agronomic: Gypsum ──
  'Ca subsuperficial': 'Cálcio na camada 20-40 cm do laudo (cmolc/dm³)',
  'Mg': 'Magnésio na camada 20-40 cm (cmolc/dm³)',
  'Al trocável': 'Alumínio trocável na camada 20-40 cm (cmolc/dm³)',
  'CTC': 'Capacidade de troca catiônica da camada 20-40 cm',
  'Argila': 'Teor de argila do solo para cálculo da dose (%)',
  'Preço do gesso': 'Preço do gesso agrícola por tonelada na região',

  // ── Agronomic: Fertilizer Blend ──
  'Nitrogênio (N)': 'Teor de N recomendado para a mistura (%)',
  'Fósforo (P₂O₅)': 'Teor de P₂O₅ recomendado para a mistura (%)',
  'Potássio (K₂O)': 'Teor de K₂O recomendado para a mistura (%)',

  // ── Financial: BreakEven ──
  // Common labels already mapped above

  // ── Financial: CashFlow ──
  'Saldo inicial em caixa': 'Saldo disponível no início do período',

  // ── Financial: CropInsurance ──
  'Taxa personalizada': 'Taxa do seguro conforme cotação da seguradora (%)',
  'Valor financiado': 'Valor total do financiamento rural contratado',

  // ── Financial: FarmLease ──
  'Valor do arrendamento': 'Valor total pago pelo arrendamento (R$ ou sacas)',

  // ── Financial: FarmROI ──
  'Investimento total': 'Capital total investido na operação ou ativo',
  'Receita bruta projetada': 'Receita esperada no período da operação',
  'Prazo da operação': 'Duração do investimento ou da safra em meses',
  'Taxa CDI anual (referência)': 'Taxa CDI para comparação com o custo de oportunidade',

  // ── Financial: FieldCostRanking ──
  'Preço de venda': 'Preço esperado de venda no mercado',
  'Nome do talhão': 'Identificação do talhão na propriedade',
  'Custo insumos': 'Custo total com sementes, fertilizantes e defensivos',
  'Custo operações': 'Custo com máquinas, combustível e mão de obra',
  'Arrendamento': 'Valor do arrendamento alocado ao talhão',
  'Outros custos': 'Custos diversos não contemplados acima',

  // ── Financial: PaybackPeriod ──
  'Valor do investimento': 'Capital total investido no ativo ou projeto',
  'Ganho líquido anual': 'Receita menos custos operacionais anuais',
  'Vida útil': 'Anos de utilização esperada do ativo',
  'Valor residual': 'Valor estimado do ativo ao final da vida útil',
  'Taxa de desconto (TMA)': 'Taxa mínima de atratividade para o investimento (% a.a.)',

  // ── Financial: ProductionCost ──
  // Dynamic labels via item.label — skip

  // ── Financial: RuralFinancing ──
  'Prazo total': 'Prazo total do financiamento em meses',
  'Carência': 'Período de carência antes do início das parcelas (meses)',
  'Taxa de juros': 'Taxa de juros anual do financiamento (%)',

  // ── Financial: SalePricing ──
  'ICMS sobre venda': 'Alíquota de ICMS do estado para produtos agrícolas (%)',
  'Margem de lucro desejada': 'Percentual de lucro sobre o custo (%)',
  'Comissão (corretor/trading)': 'Comissão percentual do intermediário (%)',

  // ── Financial: CropProfitSimulator ──
  'Custo de produção': 'Custo total por hectare com insumos, operações e fixos',

  // ── Grain: DryingCost ──
  'Quantidade de grãos': 'Volume total de grãos a secar em toneladas',
  'Umidade inicial': 'Umidade do grão na colheita (%)',
  'Umidade final': 'Umidade alvo para armazenagem (13-14%)',
  'Preço da energia': 'Custo do combustível para secagem (R$/kg ou R$/L)',
  'Custo de secagem terceirizado': 'Valor cobrado por armazém terceiro (R$/sc ou R$/t)',

  // ── Grain: DryingLoss ──
  'Peso inicial': 'Peso bruto do lote antes da secagem (kg)',
  'Umidade final desejada': 'Umidade alvo para comercialização (13-14%)',
  'Custo de secagem': 'Custo por ponto percentual de umidade removido',

  // ── Grain: Classification ──
  'Umidade': 'Umidade medida na recepção do grão (%)',
  'Impurezas': 'Material estranho e fragmentos (%)',
  'Quebrados/Amassados': 'Grãos danificados mecanicamente (%)',
  'Avariados/Verdes': 'Grãos imaturos ou avariados (%)',
  'Ardidos/Queimados': 'Grãos fermentados, mofados ou queimados (%)',

  // ── Grain: Moisture Discount ──
  'Peso bruto da carga': 'Peso total da carga na balança (kg)',
  'Umidade medida': 'Umidade aferida no classificador (%)',
  'Impureza medida': 'Impurezas aferidas na classificação (%)',
  'Grãos ardidos': 'Percentual de grãos ardidos na classificação (%)',

  // ── Grain: Silo Dimensioning ──
  'Diâmetro': 'Diâmetro interno do silo cilíndrico (metros)',
  'Altura útil': 'Altura útil de armazenagem do silo (metros)',
  'Comprimento': 'Comprimento interno da estrutura (metros)',
  'Largura': 'Largura interna da estrutura (metros)',
  'Comprimento da bolsa': 'Comprimento total do silo-bolsa (metros)',

  // ── Grain: Storage Cost ──
  'Taxa cobrada': 'Tarifa de armazenagem cobrada por saca/mês (%)',
  'Volume anual': 'Volume total armazenado por ano em sacas',
  'Prazo médio': 'Tempo médio de permanência no armazém (meses)',
  'Capacidade do silo': 'Capacidade do silo próprio em sacas',
  'Custo de construção': 'Investimento total na construção do silo (R$)',
  'Custo operacional anual': 'Custos anuais de operação e manutenção (R$)',

  // ── Grain: Storage Viability ──
  'Quantidade': 'Volume de grãos a armazenar em sacas',
  'Prazo de armazenagem': 'Meses de armazenagem até a venda',
  'Taxa de armazenagem': 'Custo mensal de armazenagem por saca',
  'Quebra técnica': 'Perda esperada durante armazenagem (% por mês)',
  'Custo de capital': 'Taxa de juros do capital empatado (% ao mês)',
  'Custo de seguro': 'Seguro do grão armazenado (% sobre valor)',

  // ── Lead Magnets: Carbon Credit ──
  'Prazo de projeção': 'Horizontes de geração de créditos em anos',
  'Preço do crédito': 'Preço por tonelada de CO₂ equivalente (US$)',

  // ── Lead Magnets: Crop Simulator ──
  'Custo de produção': 'Custo total por hectare com insumos, operações e fixos',
  'Preço mínimo': 'Menor preço da saca para simulação',
  'Preço máximo': 'Maior preço da saca para simulação',
  'Produtividade mínima': 'Menor produtividade para simulação (sc/ha)',
  'Produtividade máxima': 'Maior produtividade para simulação (sc/ha)',

  // ── Lead Magnets: Irrigation ──
  'Kc (coef. da cultura)': 'Coeficiente de cultura para estimativa de ETc',
  'Capacidade de campo': 'Teor de água no solo na capacidade de campo (%)',
  'Ponto de murcha': 'Teor de água no ponto de murcha permanente (%)',
  'Prof. radicular': 'Profundidade efetiva do sistema radicular (cm)',
  'Temp. máxima': 'Temperatura máxima do dia (°C)',
  'Temp. mínima': 'Temperatura mínima do dia (°C)',
  'Temp. média': 'Temperatura média do dia (°C)',
  'Precipitação última semana': 'Chuva acumulada nos últimos 7 dias (mm)',
  'Precipitação da semana': 'Chuva efetiva acumulada na semana (mm)',

  // ── Lead Magnets: Software ROI ──
  'Custo de insumos': 'Gasto total anual com insumos agropecuários',
  'Custo mensal do software': 'Mensalidade do software de gestão agrícola',

  // ── Operational: ElectricityCost ──
  'Potência': 'Potência do equipamento em kW ou CV',
  'Horas por dia': 'Horas de funcionamento diário do equipamento',
  'Dias por mês': 'Dias de operação do equipamento por mês',
  'Meses de uso': 'Meses de uso do equipamento por ano',
  'Tarifa de energia': 'Tarifa da concessionária em R$/kWh',
  'Demanda contratada': 'Demanda contratada para cálculo de ultrapassagem (kW)',

  // ── Operational: Fuel Consumption ──
  'Consumo do motor': 'Consumo específico do motor (L/h)',
  'Capacidade operacional': 'Rendimento de trabalho (ha/h)',
  'Preço do diesel': 'Preço do diesel na propriedade (R$/L)',

  // ── Operational: Freight ──
  'Distância ida e volta': 'Distância total do trecho ida + volta (km)',
  'Valor do frete': 'Preço do frete por tonelada ou por km',
  'Carga': 'Peso da carga transportada por viagem (toneladas)',

  // ── Operational: Harvest Loss ──
  'Grãos/m² por sc/ha': 'Fator de conversão: grãos por m² equivalentes a 1 sc/ha',
  'Grãos — Pré-colheita': 'Grãos caídos antes da colhedora passar (un/m²)',
  'Grãos — Plataforma': 'Grãos perdidos na plataforma de corte (un/m²)',
  'Grãos — Trilha': 'Grãos perdidos nos mecanismos internos (un/m²)',

  // ── Operational: Machine Depreciation ──
  'Valor de aquisição': 'Preço de compra da máquina ou implemento (R$)',
  'Valor residual estimado': 'Valor estimado de revenda ao final da vida útil',
  'Vida útil total': 'Vida útil total estimada em horas de trabalho',
  'Horas trabalhadas por ano': 'Média de horas de uso por safra',

  // ── Operational: Machinery Cost ──
  'Valor de compra': 'Preço de aquisição da máquina (R$)',
  'Horas de uso por ano': 'Estimativa de horas de trabalho por safra',
  'Custo de capital': 'Taxa de juros do capital empatado (% ao mês)',
  'Seguro': 'Custo anual do seguro da máquina (R$)',
  'Manutenção': 'Custo anual com manutenção e reparos (R$)',
  'Consumo de combustível': 'Consumo médio do motor (L/h)',
  'Salário do operador': 'Custo mensal com o operador (com encargos)',
  'Valor cobrado': 'Valor cobrado por hora de serviço prestado',

  // ── Operational: Operational Capacity ──
  'Largura de trabalho': 'Largura efetiva da faixa de trabalho (metros)',
  'Velocidade de trabalho': 'Velocidade média de deslocamento (km/h)',
  'Eficiência operacional': 'Fator de aproveitamento do tempo (ex: 75%)',
  'Horas de trabalho por dia': 'Jornada diária de operação no campo',

  // ── Operational: PreHarvest Yield ──
  'Plantas por metro': 'Plantas contadas em 1 metro linear',
  'Vagens por planta': 'Média de vagens em 10 plantas amostradas',
  'Grãos por vagem': 'Média de grãos por vagem (normalmente 2-3)',
  'Espigas por metro': 'Espigas por metro linear de milho',
  'Fileiras por espiga': 'Número de fileiras de grãos na espiga',
  'Grãos por fileira': 'Número de grãos por fileira na espiga',
  'Peso de mil grãos (PMG)': 'Peso de 1.000 grãos secos em gramas',

  // ── Operational: Sprayer Calibration ──
  'Número de bicos': 'Bicos ativos na barra do pulverizador',
  'Vazão por bico': 'Vazão medida de cada bico (L/min)',
  'Velocidade de aplicação': 'Velocidade de deslocamento do pulverizador (km/h)',
  'Espaçamento entre bicos': 'Distância entre bicos na barra (cm)',
  'Capacidade do tanque': 'Volume total do tanque do pulverizador (L)',
  'Dose do produto por hectare': 'Dose recomendada na bula do defensivo (L/ha ou kg/ha)',

  // ── Tax: CropProfitability ──
  // Common labels already mapped

  // ── Tax: Funrural ──
  'Receita bruta': 'Receita bruta total da venda de produção agropecuária',

  // ── Tax: ITR ──
  'Valor da Terra Nua (VTN)': 'Valor venal do imóvel sem benfeitorias, uso DITR',

  // ── Tax: TaxReform ──
  'Faturamento anual bruto': 'Receita total anual da atividade agropecuária',
  'Mercado interno': 'Percentual da produção vendida no mercado nacional (%)',
  'Exportação': 'Percentual da produção exportada (%)',
  'Compra de insumos anual (para calcular créditos)': 'Total anual gasto com insumos para apuração de créditos',

  // ── Utility: RainVolume ──
  'Precipitação': 'Lâmina de chuva ou irrigação em milímetros',
  'Custo da água irrigada': 'Custo estimado por m³ de água de irrigação',

  // ── Utility: SprayMix ──
  'Volume do tanque': 'Capacidade total do tanque do pulverizador (L)',
  'Volume de calda desejado': 'Volume de calda a preparar nesta carga (L)',
  'Dose do produto (conforme bula)': 'Dose recomendada na bula (mL/ha ou g/ha)',
  'Volume de calda': 'Volume de calda por hectare ou por carga (L)',

  // ── Utility: TankMix ──
  'Nome': 'Nome comercial do produto',
  'Dose': 'Dose recomendada por hectare (L/ha ou kg/ha)',

  // ── Utility: Water Balance ──
  'Precipitação acumulada no mês': 'Soma da chuva no mês corrente (mm)',

  // ── Utility: YieldConverter ──
  'Valor de produtividade': 'Valor a converter entre as unidades',

  // ── Latitude / Longitude ──
  'Latitude': 'Coordenada em graus decimais (ex: -15.7801)',
  'Longitude': 'Coordenada em graus decimais (ex: -47.9292)',
};

// ── Process files ──
const toolsDir = path.join(__dirname, '..', 'src', 'tools');
console.log('Looking in:', toolsDir, 'exists:', fs.existsSync(toolsDir));
const files = [];

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
}

walkDir(toolsDir);

let totalAdded = 0;
let totalFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let fileAdded = 0;

  // Find InputField blocks without hint=
  // Pattern: <InputField ... /> where there's no hint= inside
  const inputFieldRegex = /<InputField\b([\s\S]*?)\/>/g;
  let match;
  const replacements = [];

  while ((match = inputFieldRegex.exec(content)) !== null) {
    const block = match[1];
    if (block.includes('hint=')) continue;

    // Extract label
    const labelMatch = block.match(/label=["']([^"']+)["']/);
    const labelExprMatch = block.match(/label=\{([^}]+)\}/);
    
    let label = null;
    if (labelMatch) {
      label = labelMatch[1];
    } else if (labelExprMatch) {
      // Dynamic label - try to resolve common patterns
      const expr = labelExprMatch[1];
      // Skip dynamic labels like f.label, item.label, etc.
      continue;
    }

    if (!label) continue;

    // Find the best matching hint
    let hint = HINT_MAP[label];
    if (!hint) {
      // Try partial match
      for (const [key, value] of Object.entries(HINT_MAP)) {
        if (label.includes(key) || key.includes(label)) {
          hint = value;
          break;
        }
      }
    }

    if (!hint) {
      console.log(`  NO HINT for: "${label}" in ${path.basename(file)}`);
      continue;
    }

    // Store replacement: add hint= before />
    replacements.push({
      original: match[0],
      label,
      hint,
    });
  }

  // Apply replacements in reverse order to preserve positions
  for (const rep of replacements.reverse()) {
    const idx = content.indexOf(rep.original);
    if (idx === -1) continue;

    // Find the last newline before /> to get indentation
    const closingIdx = rep.original.lastIndexOf('/>');
    const beforeClosing = rep.original.substring(0, closingIdx);
    
    // Get the indentation from the line above />
    const lines = beforeClosing.split('\n');
    const lastLine = lines[lines.length - 1];
    const indent = lastLine.match(/^(\s*)/)?.[1] || '          ';
    
    // Check if the last prop is on the same line as />
    const trimmedLast = lastLine.trim();
    if (trimmedLast === '') {
      // /> is on its own line, add hint before it
      const newBlock = rep.original.replace(
        '/>',
        `hint="${rep.hint}"\n${indent}/>`
      );
      content = content.substring(0, idx) + newBlock + content.substring(idx + rep.original.length);
    } else {
      // Add hint on a new line before />
      const newBlock = rep.original.replace(
        '/>',
        `\n${indent}hint="${rep.hint}"\n${indent}/>`
      );
      content = content.substring(0, idx) + newBlock + content.substring(idx + rep.original.length);
    }
    fileAdded++;
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalFiles++;
    totalAdded += fileAdded;
    console.log(`✓ ${path.basename(file)}: +${fileAdded} hints`);
  }
}

console.log(`\nDone: added ${totalAdded} hints across ${totalFiles} files`);
