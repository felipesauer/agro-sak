# 🌾 Blueprint Completo — Ferramentas Gratuitas para Software House do Agronegócio

> **Como usar este arquivo com o GitHub Copilot / Cursor / IA:**
> Abra este arquivo no VSCode, selecione o blueprint da ferramenta desejada e use o prompt:
> _"Com base neste blueprint, gere o código completo desta ferramenta como um componente React com Tailwind CSS"_
> ou _"Implemente esta ferramenta como uma página HTML + JS vanilla seguindo todas as regras do blueprint."_

---

## 📋 Convenções Gerais do Projeto

### Stack recomendada
- **Frontend:** React + Tailwind CSS (ou HTML + JS vanilla para ferramentas simples)
- **Sem backend:** todas as ferramentas calculam no client-side (JavaScript puro)
- **Responsivo:** mobile-first, funcionar bem em celular no campo
- **Sem autenticação:** acesso público, sem login

### Padrão visual
- Cores primárias: verde agro (`#3B6D11`, `#639922`, `#EAF3DE`)
- Tipografia limpa, inputs grandes (fácil de usar com luvas ou sol no olho)
- Resultados destacados em card com fundo colorido
- Sempre mostrar unidades explícitas nos inputs e outputs
- Botão "Calcular" explícito (não calcular em tempo real em ferramentas complexas)
- Botão "Limpar / Recalcular" sempre presente

### Padrão de inputs
- Labels descritivos com unidade entre parênteses: `Área (hectares)`
- Valores numéricos com `step` adequado (ex: step="0.01" para preços)
- Campos com `placeholder` mostrando exemplo real: `ex: 58.5`
- Validação: não permitir calcular com campos vazios ou valores negativos
- Mensagem de erro amigável: "Por favor, preencha todos os campos com valores válidos."

### Padrão de outputs
- Resultado principal: fonte grande, destaque visual
- Resultados secundários: tabela ou lista de cards menores
- Sempre explicar o que o número significa (ex: "Você precisa de **38,4 sc/ha** para pagar todos os custos")
- Opção de copiar ou imprimir o resultado

---

## 🗂️ Índice de Ferramentas

### 🌱 Agronômicas
1. [Taxa de Semeadura & População de Plantas](#1-taxa-de-semeadura--população-de-plantas)
2. [Calagem / Correção de Solo](#2-calagem--correção-de-solo)
3. [Adubação NPK](#3-adubação-npk)
4. [Exportação / Remoção de Nutrientes](#4-exportação--remoção-de-nutrientes)
5. [Conversor de Formulação NPK](#5-conversor-de-formulação-npk)
6. [Espaçamento de Plantio](#6-espaçamento-de-plantio)
7. [Estimativa de Produtividade Pré-Colheita](#7-estimativa-de-produtividade-pré-colheita)
8. [Perdas na Colheita](#8-perdas-na-colheita)
9. [Produtividade por Hectare (Conversor)](#9-produtividade-por-hectare-conversor)

### 🚜 Operacional
10. [Custo de Máquinas: Compra × Aluguel × Terceirização](#10-custo-de-máquinas-compra--aluguel--terceirização)
11. [Depreciação + Custo de Manutenção de Máquinas](#11-depreciação--custo-de-manutenção-de-máquinas)
12. [Calibração de Pulverizador](#12-calibração-de-pulverizador)
13. [Capacidade Operacional (ha/hora)](#13-capacidade-operacional-hahora)
14. [Consumo de Combustível por Hectare](#14-consumo-de-combustível-por-hectare)
15. [Logística de Transporte de Grãos](#15-logística-de-transporte-de-grãos)
16. [Janela de Plantio](#16-janela-de-plantio)

### 💰 Financeiro
17. [Custo de Produção (R$/ha e R$/saca)](#17-custo-de-produção-rha-e-rsaca)
18. [Simulador de Lucro da Safra (Viabilidade)](#18-simulador-de-lucro-da-safra-viabilidade)
19. [Ponto de Equilíbrio (Break-even)](#19-ponto-de-equilíbrio-break-even)
20. [Precificação de Venda do Produto](#20-precificação-de-venda-do-produto)
21. [Simulador de Financiamento Rural](#21-simulador-de-financiamento-rural)
22. [Calculadora de Arrendamento Rural](#22-calculadora-de-arrendamento-rural)
23. [Fluxo de Caixa Rural (3 meses)](#23-fluxo-de-caixa-rural-3-meses)
24. [ROI Agrícola](#24-roi-agrícola)
25. [Custo por Talhão com Ranking](#25-custo-por-talhão-com-ranking)

### 📦 Grãos e Armazenagem
26. [Desconto por Umidade e Impureza](#26-desconto-por-umidade-e-impureza)
27. [Umidade de Grãos & Perda por Secagem](#27-umidade-de-grãos--perda-por-secagem)
28. [Viabilidade de Armazenagem (Vender × Guardar)](#28-viabilidade-de-armazenagem-vender--guardar)
29. [Custo de Armazenagem (Silo Próprio vs Terceiro)](#29-custo-de-armazenagem-silo-próprio-vs-terceiro)

### 📋 Tributário
30. [Reforma Tributária para Produtor Rural](#30-reforma-tributária-para-produtor-rural)
31. [Calculadora de Funrural](#31-calculadora-de-funrural)
32. [Calculadora de ITR](#32-calculadora-de-itr)
33. [Rentabilidade por Cultura (com Impostos)](#33-rentabilidade-por-cultura-com-impostos)

### 🧰 Utilitários
34. [Conversor Universal de Medidas Agro](#34-conversor-universal-de-medidas-agro)
35. [Calculadora de Tank Mix](#35-calculadora-de-tank-mix)
36. [Mistura de Calda (Dose por Tanque)](#36-mistura-de-calda-dose-por-tanque)
37. [Balanço Hídrico & Pluviometria](#37-balanço-hídrico--pluviometria)
38. [Conversor Sc/Ha ↔ Kg/Ha ↔ Bushel](#38-conversor-scha--kgha--bushel)

### 🧠 Oportunidades Únicas
39. [Simulador de Safra (Preço × Produtividade × Custo)](#39-simulador-de-safra-preço--produtividade--custo)
40. [Diagnóstico de Gestão da Fazenda](#40-diagnóstico-de-gestão-da-fazenda)
41. [Simulador de ROI do Software](#41-simulador-de-roi-do-software)
42. [Calculadora de Irrigação](#42-calculadora-de-irrigação)
43. [Calculadora de Área por GPS (Mapa)](#43-calculadora-de-área-por-gps-mapa)
44. [Comparador de Culturas (Soja × Milho × Algodão)](#44-comparador-de-culturas-soja--milho--algodão)

### 🎯 Ferramentas Extras
45. [Calculadora de Custo de Hora-Máquina](#45-calculadora-de-custo-de-hora-máquina)
46. [Estimativa de Perda por Secagem](#46-estimativa-de-perda-por-secagem)
47. [Calculadora de Umidade de Grãos Simples](#47-calculadora-de-umidade-de-grãos-simples)
48. [Simulador de Plantio Soja / Milho / Algodão](#48-simulador-de-plantio-soja--milho--algodão)
49. [Calculadora de Pulverização](#49-calculadora-de-pulverização)
50. [Simulador de Viabilidade de Armazenagem Avançado](#50-simulador-de-viabilidade-de-armazenagem-avançado)
51. [Calculadora de Conversão de Adubo (Custo por Ponto)](#51-calculadora-de-conversão-de-adubo-custo-por-ponto)
52. [Calculadora de Balanço Hídrico e Monitoramento Pluviométrico](#52-calculadora-de-balanço-hídrico-e-monitoramento-pluviométrico)

---

# 🌱 AGRONÔMICAS

---

## 1. Taxa de Semeadura & População de Plantas

**Categoria:** Agronômica  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Média  
**Público-alvo:** Produtores rurais, agrônomos, técnicos agrícolas

### O que é
Ferramenta que calcula a quantidade de sementes necessária por hectare com base na população de plantas desejada, no espaçamento entre linhas e entre plantas, e no poder germinativo/vigor da semente.

### Para que serve
Evitar desperdício de sementes (custo alto) ou estande falho (perda de produtividade). Responde à pergunta: "Quantos kg de semente preciso comprar para plantar 1.000 ha de soja?"

### Inputs

| Campo | Tipo | Unidade | Exemplo | Regra de validação |
|---|---|---|---|---|
| Cultura | Select | — | Soja / Milho / Algodão / Sorgo / Feijão | Obrigatório |
| População desejada | Número | plantas/ha | 320.000 | Entre 50.000 e 600.000 |
| Espaçamento entre linhas | Número | cm | 45 | Entre 25 e 90 |
| Germinação da semente | Número | % | 85 | Entre 50 e 100 |
| Vigor / Fator de campo | Número | % | 90 | Entre 50 e 100 |
| Peso de mil sementes (PMG) | Número | gramas | 145 | Entre 50 e 500 |

### Outputs

| Resultado | Fórmula | Unidade |
|---|---|---|
| Sementes por metro linear | `(População × Espaçamento) / 10.000` | sementes/m |
| Sementes por hectare ajustadas | `População / (Germinação/100 × Vigor/100)` | sementes/ha |
| Kg de semente por hectare | `(Sementes_ha × PMG) / 1.000.000` | kg/ha |
| Sacas de 40kg por hectare | `kg_ha / 40` | sc/ha |

### Regras de negócio
- O fator de campo (vigor) reduz a população final esperada. Germination × Vigor = eficiência total.
- Populações de referência: Soja = 250.000–350.000; Milho = 60.000–80.000; Algodão = 80.000–120.000.
- PMG varia por cultivar — sempre pedir ao produtor que confira na embalagem.
- Resultado deve mostrar "Sementes por metro linear" em destaque pois é o que o operador da plantadeira configura na máquina.

### UX / Interface
- Seletor de cultura muda os valores padrão dos campos automaticamente
- Mostrar referência de PMG típico para a cultura selecionada como hint
- Resultado principal: **kg/ha de semente** em card verde destacado
- Resultado secundário: sementes por metro linear (configuração da plantadeira)
- Mostrar custo estimado se o usuário informar o preço da saca de semente (campo opcional)

---

## 2. Calagem / Correção de Solo

**Categoria:** Agronômica  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Média-Alta  
**Público-alvo:** Agrônomos, técnicos, produtores que fazem análise de solo

### O que é
Calculadora da quantidade de calcário necessária para corrigir a acidez do solo, com base nos dados do laudo de análise de solo e nas características do calcário disponível.

### Para que serve
O calcário é um dos maiores custos fixos da produção. Calcular errado gera supercalagem (toxicidade) ou subcalagem (acidez residual, perda de produtividade). Esta ferramenta traduz o laudo de solo em toneladas de calcário por hectare.

### Inputs

| Campo | Tipo | Unidade | Exemplo | Regra |
|---|---|---|---|---|
| Método de cálculo | Select | — | Saturação por Bases / SMP | Obrigatório |
| pH atual (CaCl₂) | Número | — | 4,8 | Entre 3,5 e 7,5 |
| CTC a pH 7 | Número | cmolc/dm³ | 8,5 | Entre 1 e 40 |
| Saturação por bases atual (V%) | Número | % | 35 | Entre 5 e 100 |
| Saturação por bases desejada (V%) | Número | % | 60 | Entre 40 e 80 |
| PRNT do calcário | Número | % | 80 | Entre 50 e 100 |
| Profundidade de incorporação | Select | cm | 0–20 / 0–40 | Obrigatório |

### Outputs

| Resultado | Fórmula (Método Saturação por Bases) | Unidade |
|---|---|---|
| NC (Necessidade de Calcário) | `NC = (V2 - V1) × CTC / (10 × PRNT/100)` | t/ha |
| NC para incorporação de 40cm | `NC × 2` | t/ha |
| Custo estimado | `NC × preço_t` (se informado) | R$/ha |

### Fórmulas detalhadas

**Método Saturação por Bases:**
```
NC (t/ha) = [(V2 - V1) × CTC] / (10 × PRNT/100)
```
Onde:
- V2 = saturação desejada (%)
- V1 = saturação atual (%)
- CTC = capacidade de troca de cátions (cmolc/dm³)
- PRNT = poder relativo de neutralização total (%)

**Método SMP (Embrapa):**
```
NC (t/ha) = [(pH_SMP_desejado - pH_SMP_atual) × fator_cultura]
```
Referência tabelada por cultura.

### Regras de negócio
- Máximo recomendado: 5 t/ha por aplicação. Se NC > 5, recomendar parcelamento em 2 anos.
- PRNT < 70%: alertar que o calcário é de baixa qualidade, necessidade maior.
- V% desejada varia por cultura: Soja = 60–70%; Milho = 60–65%; Algodão = 65–75%; Pastagem = 50–60%.
- Incorporação em 40cm duplica a necessidade (calcário para subsolo).
- Sempre recomendar aguardar 60–90 dias após aplicação antes do plantio.

### UX / Interface
- Tabs para alternar entre os dois métodos de cálculo
- Ao selecionar cultura, preencher automaticamente V% desejada
- Hint explicativo ao lado de cada campo técnico (ex: "PRNT: encontre na embalagem do calcário")
- Resultado em destaque: **X,X t/ha de calcário**
- Alerta visual se NC > 5 t/ha (parcelamento recomendado)

---

## 3. Adubação NPK

**Categoria:** Agronômica  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Alta  
**Público-alvo:** Agrônomos, técnicos agrícolas

### O que é
Calculadora de recomendação de adubação com nitrogênio (N), fósforo (P₂O₅) e potássio (K₂O) baseada nos dados do laudo de análise de solo e na produtividade esperada da cultura.

### Para que serve
Traduzir o laudo de solo em uma recomendação prática de quanto fertilizante aplicar, evitando tanto a deficiência nutricional quanto o desperdício de insumo caro.

### Inputs

| Campo | Tipo | Unidade | Exemplo |
|---|---|---|---|
| Cultura | Select | — | Soja / Milho / Algodão / Arroz / Feijão |
| Produtividade esperada | Número | sc/ha | 65 |
| Fósforo no solo (P Mehlich) | Número | mg/dm³ | 12 |
| Potássio no solo (K) | Número | mg/dm³ | 90 |
| Matéria orgânica | Número | % | 2,5 |
| Textura do solo | Select | — | Arenoso / Médio / Argiloso |
| Tipo de adubação | Select | — | Plantio / Cobertura / Total |

### Outputs

| Nutriente | Output | Unidade |
|---|---|---|
| Nitrogênio (N) | kg/ha necessário | kg/ha |
| Fósforo (P₂O₅) | kg/ha necessário | kg/ha |
| Potássio (K₂O) | kg/ha necessário | kg/ha |
| Formulação sugerida | Fórmula NPK aproximada | ex: 08-28-16 |
| Quantidade de adubo | kg/ha do fertilizante | kg/ha |
| Sacos de 50kg por ha | — | sacos/ha |

### Regras de negócio
- Usar tabelas de recomendação EMBRAPA / Cerrado como base de cálculo.
- Classificar teores de P e K no solo: Muito baixo / Baixo / Médio / Alto / Muito alto.
- N para soja: inoculação com Bradyrhizobium reduz ou elimina necessidade de N. Perguntar se vai inocular.
- N para milho safrinha: demanda maior; considerar parcelamento (plantio + cobertura V4-V6).
- Output deve sugerir 3 opções de formulação comercial que atendam à recomendação.
- Alertar se o solo tiver K muito alto (risco de desequilíbrio Ca/Mg).

### UX / Interface
- Mostrar classificação do teor (Baixo/Médio/Alto) ao lado do valor inserido pelo usuário
- Exibir tabela com as 3 formulações sugeridas e preço estimado por saca (campo opcional)
- Gráfico de barras mostrando N, P, K necessários vs fornecidos pela formulação escolhida

---

## 4. Exportação / Remoção de Nutrientes

**Categoria:** Agronômica  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa  
**Público-alvo:** Agrônomos, consultores de solo

### O que é
Calcula a quantidade de macronutrientes (N, P, K, S, Ca, Mg) que é removida do solo junto com os grãos colhidos, por hectare.

### Para que serve
Entender quanto de fertilizante precisa ser reposto para manter a fertilidade do solo ao longo dos anos. Fundamental para adubação de manutenção.

### Inputs

| Campo | Tipo | Exemplo |
|---|---|---|
| Cultura | Select | Soja / Milho / Algodão / Arroz |
| Produtividade | Número (sc/ha) | 65 |
| Parte exportada | Select | Apenas grão / Grão + palhada |
| Área (opcional) | Número (ha) | 500 |

### Outputs
Tabela com kg/ha removido de cada nutriente: N, P₂O₅, K₂O, S, Ca, Mg.  
Se área informada: total em kg e toneladas para a fazenda.

### Tabela de referência (kg removidos por tonelada de grão)

| Cultura | N | P₂O₅ | K₂O | S |
|---|---|---|---|---|
| Soja | 65 | 15 | 19 | 4 |
| Milho | 15 | 8 | 5 | 2 |
| Algodão (pluma) | 25 | 8 | 12 | 4 |

### Regras de negócio
- Converter sc/ha para t/ha antes de calcular (soja: 1 sc = 60kg; milho: 1 sc = 60kg).
- Mostrar custo de reposição estimado (opcional: usuário informa preço de N, P, K).
- Exportação de palhada aumenta K removido significativamente.

---

## 5. Conversor de Formulação NPK

**Categoria:** Agronômica / Utilitário  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa  
**Público-alvo:** Produtores, compradores de insumos

### O que é
Compara diferentes formulações de adubo NPK e calcula o custo por ponto de nutriente, facilitando a decisão de compra.

### Para que serve
Um adubo mais barato por saco pode ser mais caro por ponto de nutriente. Esta ferramenta desvenda esse cálculo.

### Inputs (por formulação, até 4 comparações simultâneas)

| Campo | Exemplo |
|---|---|
| Formulação (N-P-K) | 08-28-16 |
| Preço por saco 50kg | R$ 145,00 |
| Fornecedor (opcional) | Cooperativa X |

### Outputs

| Resultado | Fórmula |
|---|---|
| Custo por kg de N | `(preço / 50) / (N/100)` |
| Custo por kg de P₂O₅ | `(preço / 50) / (P/100)` |
| Custo por kg de K₂O | `(preço / 50) / (K/100)` |
| Custo por "ponto total" | `preço / (50 × soma_NPK/100)` |
| Melhor custo-benefício | Destaca a formulação mais barata por ponto |

### Regras de negócio
- Alertar quando uma formulação tem N+P+K < 20 (muita "carga", pouco nutriente).
- Destacar visualmente a formulação vencedora por menor custo/ponto.

---

## 6. Espaçamento de Plantio

**Categoria:** Agronômica  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa

### O que é
Calcula a população final de plantas com base no espaçamento entre linhas e entre plantas, ou calcula o espaçamento necessário para atingir uma população-alvo.

### Inputs (dois modos)

**Modo 1 — Calcular população:**
- Espaçamento entre linhas (cm)
- Espaçamento entre plantas (cm)

**Modo 2 — Calcular espaçamento:**
- Espaçamento entre linhas (cm) — fixo da máquina
- População desejada (plantas/ha)

### Outputs
- Plantas por metro linear
- Plantas por hectare
- Área por planta (m²)

### Fórmula
```
Plantas/ha = 10.000 / (espaçamento_linhas_m × espaçamento_plantas_m)
```

---

## 7. Estimativa de Produtividade Pré-Colheita

**Categoria:** Agronômica  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula a estimativa de produtividade da lavoura antes da colheita, com base em amostragens feitas no campo.

### Para que serve
Antecipar decisões de venda (fixar preço antes da colheita), logística e planejamento financeiro.

### Inputs por cultura

**Soja:**
| Campo | Exemplo |
|---|---|
| Plantas por metro | 14 |
| Vagens por planta | 32 |
| Grãos por vagem | 2,4 |
| Peso de mil grãos (g) | 145 |

**Milho:**
| Campo | Exemplo |
|---|---|
| Espigas por metro | 3,5 |
| Fileiras por espiga | 16 |
| Grãos por fileira | 34 |
| Peso de mil grãos (g) | 290 |

### Fórmula (Soja)
```
Prod (kg/ha) = (plantas/m × vagens/planta × grãos/vagem × PMG) / (espaçamento_m × 1000)
Prod (sc/ha) = Prod_kg / 60
```

### Regras de negócio
- Mínimo de 5 pontos de amostragem por talhão para representatividade.
- Mostrar range de confiança (±10% da estimativa).
- Alertar: resultado é estimativa, variações climáticas até colheita podem alterar.

---

## 8. Perdas na Colheita

**Categoria:** Agronômica  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula as perdas de grãos durante a colheita mecanizada, nas diferentes etapas: pré-colheita (debulha natural), plataforma de corte e sistema de trilha/separação.

### Para que serve
Quantificar o prejuízo financeiro das perdas e ajudar o operador a regular a colheitadeira.

### Inputs

| Campo | Exemplo |
|---|---|
| Cultura | Soja / Milho |
| Produtividade esperada (sc/ha) | 65 |
| Grãos encontrados no chão (grãos/m²) — pré-colheita | 4 |
| Grãos encontrados no chão (grãos/m²) — plataforma | 8 |
| Grãos encontrados no chão (grãos/m²) — trilha | 6 |
| Preço da saca (R$) | 115 |

### Fórmula (Soja)
```
Perda (sc/ha) = grãos/m² / 16  (cada 16 grãos/m² = 1 sc/ha)
Perda financeira = sc/ha × preço
```

### Outputs
- Perda por etapa (sc/ha e R$/ha)
- Perda total (sc/ha e R$/ha)
- Perda total na área (R$) se informar hectares
- Indicador: verde ≤ 1 sc/ha, amarelo 1–2, vermelho > 2

### Regras de negócio
- Tolerância máxima recomendada: 1 sc/ha total para soja.
- Mostrar recomendações de regulagem por tipo de perda identificada.

---

## 9. Produtividade por Hectare (Conversor)

**Categoria:** Agronômica / Utilitário  
**Prioridade:** Baixa  
**Complexidade de desenvolvimento:** Muito Baixa

### O que é
Conversor simples de unidades de produtividade agrícola.

### Inputs
- Valor de produtividade
- Unidade de entrada (sc/ha, kg/ha, t/ha, bushel/acre)
- Cultura (para saber o peso da saca: soja=60kg, milho=60kg, trigo=60kg, café=60kg, algodão=15kg)

### Outputs
Tabela com todos os equivalentes:
- sc/ha (60kg)
- kg/ha
- t/ha
- bushel/acre (soja: 1 bu/ac = 67,25 kg/ha; milho: 1 bu/ac = 62,77 kg/ha)

### Referências comparativas
Exibir médias de produtividade por estado (MT, GO, PR, SP) para a cultura selecionada.

---

# 🚜 OPERACIONAL

---

## 10. Custo de Máquinas: Compra × Aluguel × Terceirização

**Categoria:** Operacional  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Alta

### O que é
Compara o custo real por hora e por hectare de três modelos de uso de maquinário: máquina própria comprada, máquina alugada (hora-máquina) e serviço terceirizado (empreitada).

### Para que serve
Responder à pergunta mais comum do produtor: "Vale mais a pena ter minha própria colheitadeira ou contratar um prestador de serviço?"

### Inputs — Máquina Própria

| Campo | Exemplo |
|---|---|
| Valor de compra (R$) | 1.800.000 |
| Vida útil (anos) | 12 |
| Horas trabalhadas por ano (h) | 600 |
| Taxa de juros / custo de capital (% a.a.) | 8 |
| Seguro (% do valor/ano) | 1,5 |
| Custo de manutenção (% do valor/ano) | 3 |
| Consumo de combustível (L/h) | 35 |
| Preço do diesel (R$/L) | 6,20 |
| Salário do operador (R$/mês) | 4.500 |
| Capacidade operacional (ha/h) | 12 |

### Inputs — Aluguel / Parceria
- Valor cobrado por hora (R$/h)
- Inclui operador? (Sim/Não)
- Inclui combustível? (Sim/Não)

### Inputs — Terceirização
- Valor cobrado por hectare (R$/ha) ou por saca (R$/sc)

### Fórmulas — Custo Próprio

```
Depreciação/h = (Valor_compra × (1 - VR)) / (Vida_útil × Horas/ano)
Juros/h = Valor_compra × (Taxa_juros/100) / Horas/ano
Seguro/h = Valor_compra × (Seguro/100) / Horas/ano
Manutenção/h = Valor_compra × (Manut/100) / Horas/ano
Combustível/h = Consumo × Preço_diesel
Operador/h = (Salário × 13,33) / Horas/ano  (inclui encargos 33%)
Custo_total/h = soma de todos acima
Custo/ha = Custo_total/h / Capacidade_op
```
Valor Residual (VR): Trator = 30%, Colheitadeira = 20%, Plantadeira = 15%

### Outputs
- Tabela comparativa: Próprio vs Aluguel vs Terceirizado (R$/h e R$/ha)
- Recomendação automática: qual é mais econômico
- Break-even: quantas horas/ano torna a compra viável vs aluguel

### Regras de negócio
- Custo de capital é o maior componente — muitos produtores ignoram esse custo oculto.
- Se produtor tiver < 400h/ano de uso, terceirização quase sempre é mais barata.
- Mostrar gráfico de barras com decomposição do custo próprio por componente.

---

## 11. Depreciação + Custo de Manutenção de Máquinas

**Categoria:** Operacional  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula a depreciação anual e por hora de máquinas agrícolas, com projeção de valor residual e estimativa de custos de manutenção ao longo da vida útil.

### Métodos de depreciação disponíveis
1. **Linear:** depreciação igual todos os anos
2. **Por horas trabalhadas:** depreciação proporcional ao uso

### Inputs

| Campo | Exemplo |
|---|---|
| Tipo de máquina | Trator / Colheitadeira / Plantadeira / Pulverizador |
| Valor de aquisição (R$) | 850.000 |
| Valor residual estimado (%) | 25 |
| Vida útil (anos) | 10 |
| Vida útil (horas totais) | 12.000 |
| Horas trabalhadas por ano | 800 |
| Método | Linear / Por horas |

### Outputs

| Resultado | |
|---|---|
| Depreciação anual | R$/ano |
| Depreciação por hora | R$/h |
| Valor atual (por ano — tabela) | R$ |
| Custo estimado de manutenção/ano | R$ (3–5% do valor) |
| Custo total de propriedade (TCO) | R$ total na vida útil |

### Fórmulas

```
Depreciação Linear/ano = (Valor_compra - Valor_residual) / Vida_útil_anos
Depreciação/hora = (Valor_compra - Valor_residual) / Vida_útil_horas
Custo_manutenção = Valor_compra × 0,03 a 0,05 (por ano, cresce com a idade)
```

### Regras de negócio
- Custo de manutenção cresce com a idade: anos 1–3 = 2%, 4–6 = 3,5%, 7+ = 5%.
- Exibir tabela ano a ano com valor de mercado estimado.
- Alertar quando a máquina atingir 60% da vida útil (hora de planejar troca).

---

## 12. Calibração de Pulverizador

**Categoria:** Operacional  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o volume de calda aplicado por hectare com base nas configurações do pulverizador, e determina a quantidade exata de produto a adicionar no tanque.

### Para que serve
Garantir que a dose correta do defensivo seja aplicada — subdosagem causa falha no controle, superdosagem é desperdício e risco de resistência.

### Inputs

| Campo | Exemplo |
|---|---|
| Tipo de pulverizador | Autopropelido / Tratorizado / Costal |
| Número de bicos | 36 |
| Vasão por bico (L/min) | 0,80 |
| Velocidade de aplicação (km/h) | 18 |
| Espaçamento entre bicos (m) | 0,50 |
| Capacidade do tanque (L) | 3.000 |

### Fórmulas

```
Volume de calda (L/ha) = (Vazão_bico × 600) / (Velocidade × Espaçamento)
Área coberta por tanque (ha) = Capacidade_tanque / Volume_calda
```

### Outputs
- Volume de calda (L/ha)
- Área coberta por tanque (ha)
- Quantidade de produto por tanque (L ou kg) — usuário informa dose/ha

### Regras de negócio
- Volume recomendado: gotas finas 50–100 L/ha; médias 100–200 L/ha; grossas 150–300 L/ha.
- Alertar se volume < 50 L/ha (risco de deriva) ou > 400 L/ha (impraticável).
- Mostrar tabela de vazão × velocidade para diferentes bicos.

---

## 13. Capacidade Operacional (ha/hora)

**Categoria:** Operacional  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa

### O que é
Calcula quantos hectares por hora uma máquina consegue trabalhar, considerando a largura de trabalho, velocidade e eficiência operacional.

### Inputs

| Campo | Exemplo |
|---|---|
| Largura de trabalho (m) | 12 |
| Velocidade de trabalho (km/h) | 6 |
| Eficiência operacional (%) | 75 |

### Fórmula
```
Cap. Operacional (ha/h) = (Largura × Velocidade × Eficiência/100) / 10
```

### Outputs
- ha/hora
- Horas necessárias para cobrir X hectares (usuário informa a área)
- Dias necessários (usuário informa horas de trabalho por dia)
- Janela de operação para completar antes de determinada data

### Regras de negócio
- Eficiências típicas: plantadeira 70–80%, pulverizador 75–85%, colheitadeira 65–75%.
- Incluir tabela de referência de eficiências por tipo de operação.

---

## 14. Consumo de Combustível por Hectare

**Categoria:** Operacional  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa

### O que é
Calcula o consumo de diesel por hectare e o custo de combustível por operação agrícola.

### Inputs

| Campo | Exemplo |
|---|---|
| Operação | Plantio / Pulverização / Colheita / Grade / Subsolagem |
| Consumo do motor (L/h) | 28 |
| Capacidade operacional (ha/h) | 5,5 |
| Preço do diesel (R$/L) | 6,20 |
| Área total (ha) | 1.000 |

### Fórmulas
```
Consumo (L/ha) = Consumo_h / Capacidade_op
Custo_combustível (R$/ha) = Consumo_L_ha × Preço_diesel
Custo_total = Custo_ha × Área
```

### Referências de consumo típico
| Operação | L/h típico |
|---|---|
| Grade aradora pesada | 25–35 |
| Plantio soja 12m | 18–25 |
| Pulverização autopropelido | 20–28 |
| Colheita soja | 28–45 |

---

## 15. Logística de Transporte de Grãos

**Categoria:** Operacional  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o custo de frete de grãos por saca e por tonelada, considerando distância, tipo de veículo e tonelagem.

### Inputs

| Campo | Exemplo |
|---|---|
| Tipo de veículo | Truck (14t) / Carreta (27t) / Bitrem (45t) / Rodotrem (57t) |
| Distância ida e volta (km) | 320 |
| Valor do frete (R$/km rodado) | 8,50 |
| Carga (toneladas) | 27 |
| Cultura | Soja / Milho |

### Fórmula
```
Custo total frete (R$) = Distância × Valor_km
Custo por tonelada (R$/t) = Custo_total / Toneladas
Custo por saca (R$/sc) = Custo_t / (1000/60)
```

### Outputs
- R$ por tonelada
- R$ por saca (60kg)
- Frete como % do preço da commodity
- Comparativo entre tipos de veículo

### Regras de negócio
- Tabela ANTT como referência mínima de frete.
- Alertar se frete > 15% do preço da saca (logística ineficiente).
- Calcular também frete de insumos (retorno carregado).

---

## 16. Janela de Plantio

**Categoria:** Operacional / Inteligente  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Alta

### O que é
Indica as datas ideais de plantio e os riscos associados a cada período, com base no zoneamento agrícola do MAPA e características climáticas da região.

### Para que serve
Evitar plantio fora da janela ideal, que aumenta o risco de veranico na fase crítica da cultura.

### Inputs

| Campo | Exemplo |
|---|---|
| Estado | MT / GO / PR / MS / MG |
| Município (ou microrregião) | Sorriso - MT |
| Cultura | Soja / Milho 1ª safra / Milho 2ª safra (safrinha) |
| Grupo de maturação (soja) | 6.0 / 6.5 / 7.0 / 7.5 / 8.0 |

### Outputs
- Tabela de janela de plantio por GM (soja): data início / data fim recomendada
- Indicador de risco: verde (baixo), amarelo (médio), vermelho (alto)
- Data de colheita estimada
- Risco de veranico na floração (fase R1–R3)

### Regras de negócio
- Base: Zoneamento Agrícola de Risco Climático MAPA (dados públicos).
- Para safrinha de milho em MT: janela estreita de 01/jan a 15/fev.
- Mostrar mapa simplificado da região com legenda de risco.
- Avisar que é referência — produtor deve consultar ZARC vigente.

---

# 💰 FINANCEIRO

---

## 17. Custo de Produção (R$/ha e R$/saca)

**Categoria:** Financeiro  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Alta

### O que é
A calculadora financeira mais importante do agronegócio. Soma todos os custos de produção de uma safra e calcula o custo por hectare e o custo por saca produzida.

### Para que serve
Saber se a safra vai dar lucro antes de plantar, e qual o preço mínimo de venda para não ter prejuízo.

### Estrutura de custos (Inputs agrupados)

**Grupo 1 — Insumos (R$/ha)**
| Item | Exemplo R$/ha |
|---|---|
| Sementes | 320 |
| Fertilizantes (plantio) | 680 |
| Fertilizantes (cobertura) | 420 |
| Herbicidas | 185 |
| Fungicidas | 240 |
| Inseticidas | 90 |
| Inoculante / Co-inoculante | 25 |
| Micronutrientes | 35 |

**Grupo 2 — Operações (R$/ha)**
| Item | Exemplo R$/ha |
|---|---|
| Preparo do solo | 120 |
| Plantio | 85 |
| Pulverizações (nº de aplicações × custo) | 180 |
| Colheita | 145 |
| Transporte interno | 40 |

**Grupo 3 — Custos fixos (R$/ha)**
| Item | Exemplo R$/ha |
|---|---|
| Arrendamento | 420 |
| Depreciação de máquinas | 180 |
| Mão de obra fixa | 95 |
| Administração / gestão | 50 |
| Seguro rural | 30 |
| Assistência técnica (ATER) | 20 |

**Grupo 4 — Pós-colheita (R$/ha)**
| Item | Exemplo R$/ha |
|---|---|
| Frete | 95 |
| Armazenagem | 45 |
| Secagem | 30 |
| Funrural (%) | automático |
| ILPF/outros | 0 |

**Produtividade esperada:** sc/ha (para calcular custo/saca)

### Fórmulas
```
Custo Total (R$/ha) = soma de todos os grupos
Custo por saca (R$/sc) = Custo_total_ha / Produtividade
Ponto de equilíbrio (sc/ha) = Custo_total_ha / Preço_saca
```

### Outputs
- **Custo total R$/ha** (destaque principal)
- **Custo por saca produzida** (R$/sc)
- **Preço de equilíbrio** (R$/sc — preço mínimo de venda)
- Gráfico pizza com participação % de cada grupo de custo
- Comparativo com custo médio regional (referência pública)

### Regras de negócio
- Funrural PF: 1,5% sobre receita bruta; PJ: 2,85%. Calcular automaticamente.
- Permitir salvar/exportar o orçamento como PDF ou CSV.
- Oferecer template pré-preenchido por cultura e região para começar mais rápido.
- Esta ferramenta é o maior lead magnet da lista — após calcular, mostrar CTA para o software.

---

## 18. Simulador de Lucro da Safra (Viabilidade)

**Categoria:** Financeiro  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Alta

### O que é
Simula o resultado financeiro da safra em três cenários (pessimista, realista, otimista), cruzando preço de venda, produtividade e custo de produção.

### Para que serve
Apoiar a decisão de plantio e a estratégia de venda (fixar preço antes ou após colheita).

### Inputs

| Campo | Pessimista | Realista | Otimista |
|---|---|---|---|
| Produtividade (sc/ha) | 52 | 62 | 72 |
| Preço de venda (R$/sc) | 100 | 115 | 130 |
| Custo de produção (R$/ha) | 4.200 | 4.000 | 3.800 |
| Área plantada (ha) | — mesma para os 3 — |
| Impostos sobre venda (%) | — Funrural automático — |

### Fórmulas
```
Receita Bruta (R$/ha) = Produtividade × Preço
Impostos (R$/ha) = Receita_Bruta × alíquota_funrural
Receita Líquida (R$/ha) = Receita_Bruta - Impostos
Lucro/Prejuízo (R$/ha) = Receita_Líquida - Custo_produção
Margem (%) = Lucro / Receita_Bruta × 100
ROI (%) = Lucro / Custo × 100
Resultado total (R$) = Lucro_ha × Área
```

### Outputs por cenário
- Lucro ou prejuízo por hectare
- Margem percentual
- ROI
- Resultado total da fazenda
- **Gráfico de barras** com os 3 cenários lado a lado

### Regras de negócio
- Destacar com cor: lucro = verde, prejuízo = vermelho.
- Mostrar linha de ponto de equilíbrio no gráfico.
- Permitir "E se?" — slider para ajustar preço e ver impacto em tempo real.

---

## 19. Ponto de Equilíbrio (Break-even)

**Categoria:** Financeiro  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula quantas sacas por hectare o produtor precisa colher (ou a que preço precisa vender) para pagar todos os custos sem lucro nem prejuízo.

### Dois modos de cálculo

**Modo 1 — Break-even de produtividade:**
- Inputs: custo total R$/ha + preço de venda R$/sc
- Output: sc/ha mínimas para cobrir o custo

**Modo 2 — Break-even de preço:**
- Inputs: custo total R$/ha + produtividade esperada sc/ha
- Output: preço mínimo de venda R$/sc

### Fórmulas
```
Modo 1: sc/ha_mínimas = Custo_ha / Preço_sc
Modo 2: Preço_mínimo = Custo_ha / Produtividade
Margem de segurança (%) = (Produtividade_esperada - Break_even) / Produtividade_esperada × 100
```

### Outputs
- **Break-even de produtividade** (sc/ha)
- **Break-even de preço** (R$/sc)
- Margem de segurança (quanto pode perder sem ter prejuízo)
- Gráfico: linha de custo total × linha de receita, com ponto de cruzamento destacado

---

## 20. Precificação de Venda do Produto

**Categoria:** Financeiro  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o preço mínimo de venda do produto agrícola considerando custo de produção, impostos sobre venda e margem de lucro desejada.

### Inputs

| Campo | Exemplo |
|---|---|
| Custo de produção (R$/sc) | 68 |
| Funrural — tipo produtor | PF (1,5%) / PJ (2,85%) |
| ICMS sobre venda (%) | 0 (soja isenta em MT) |
| Margem de lucro desejada (%) | 20 |
| Comissão de corretor / trading (%) | 1 |

### Fórmulas
```
Preço_mínimo = Custo / (1 - Impostos_total)
Preço_com_margem = Custo / (1 - Impostos_total - Margem/100)
Mark-up = (Preço_venda - Custo) / Custo × 100
```

### Outputs
- Preço mínimo (sem lucro, só cobre custos)
- Preço com margem desejada
- Mark-up implícito
- Comparativo com preço atual da bolsa (campo manual: "preço hoje no mercado")

---

## 21. Simulador de Financiamento Rural

**Categoria:** Financeiro  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Alta

### O que é
Simula as condições de diferentes linhas de crédito rural: Pronaf, Pronamp, Moderfrota, ABC Ambiental, FCO, FNO, custeio e investimento.

### Linhas de crédito cobertas

| Linha | Finalidade | Taxa referência |
|---|---|---|
| Pronaf Custeio | Agricultura familiar | 4–6% a.a. |
| Pronamp Custeio | Médio produtor | 7% a.a. |
| Custeio comum | Grandes produtores | TLP / LCA |
| Moderfrota | Máquinas | 7,5% a.a. |
| ABC Ambiental | Sustentabilidade | 7% a.a. |
| Investimento livre | — | Livre |

### Inputs

| Campo | Exemplo |
|---|---|
| Linha de crédito | Select |
| Valor financiado (R$) | 500.000 |
| Prazo total (meses) | 60 |
| Carência (meses) | 12 |
| Taxa de juros (% a.a.) | 7,5 |
| Sistema de amortização | SAC / PRICE / Bullet |

### Fórmulas (Sistema SAC)
```
Amortização = Principal / (Prazo - Carência)
Juros_período = Saldo_devedor × (Taxa/12)
Parcela = Amortização + Juros (decrescente)
```

### Outputs
- Primeira e última parcela
- Total de juros pago
- Custo Efetivo Total (CET)
- Tabela de amortização completa (exportável)
- Comparativo entre SAC e PRICE

### Regras de negócio
- Avisar que taxas mudam conforme Plano Safra — campos editáveis pelo usuário.
- Mostrar "parcela como % do custo de produção" para contextualizar o endividamento.

---

## 22. Calculadora de Arrendamento Rural

**Categoria:** Financeiro  
**Prioridade:** ⭐ Oportunidade única  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o custo real do arrendamento rural e compara com a alternativa de aquisição do imóvel, considerando diferentes formas de pagamento (sacas, reais por hectare).

### Inputs

| Campo | Exemplo |
|---|---|
| Modalidade de pagamento | Sacas/ha × preço / R$/ha fixo |
| Valor do arrendamento (sc/ha ou R$/ha) | 15 sc/ha |
| Produtividade esperada (sc/ha) | 62 |
| Preço da saca na época de pagamento (R$) | 115 |
| Área arrendada (ha) | 500 |
| Custo de produção sem arrendamento (R$/ha) | 3.500 |

### Fórmulas
```
Custo arrendamento (R$/ha) = Sacas × Preço_saca
% do custo total = Arrendamento_ha / Custo_total_ha × 100
% da receita = Arrendamento_ha / (Produtividade × Preço) × 100
```

### Outputs
- Custo do arrendamento em R$/ha
- Participação % no custo total
- Participação % na receita bruta
- "Vale mais comprar?" — comparativo: se o valor da renda × prazo > valor de mercado da terra

### Regras de negócio
- Arrendamento > 20% da receita bruta: alerta de custo elevado.
- Mostrar comparativo com médias regionais de arrendamento (MT: 14–18 sc/ha; GO: 12–16 sc/ha).

---

## 23. Fluxo de Caixa Rural (3 meses)

**Categoria:** Financeiro  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média

### O que é
Projeção simplificada de entradas e saídas de caixa para os próximos 3 meses da propriedade rural.

### Inputs (por mês, 3 meses)

**Entradas:**
- Venda de grãos (R$)
- Recebimento de financiamento (R$)
- Outras receitas (R$)

**Saídas:**
- Compra de insumos (R$)
- Pagamento de arrendamento (R$)
- Parcelas de financiamento (R$)
- Mão de obra (R$)
- Combustível e manutenção (R$)
- Outras saídas (R$)

### Outputs
- Saldo mensal (entradas - saídas)
- Saldo acumulado
- Gráfico de barras: entradas vs saídas por mês
- Alerta: meses com saldo negativo destacados em vermelho

### Regras de negócio
- Mostrar aviso quando saldo acumulado ficar negativo: "Atenção: déficit projetado em [mês]".
- Opção de adicionar linha de crédito de giro para cobrir o déficit.

---

## 24. ROI Agrícola

**Categoria:** Financeiro  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o Retorno sobre Investimento (ROI) da safra e compara com alternativas financeiras.

### Inputs

| Campo | Exemplo |
|---|---|
| Investimento total (R$) | 4.200.000 |
| Receita bruta projetada (R$) | 5.980.000 |
| Custo total (R$) | 4.200.000 |
| Prazo da operação (meses) | 8 |

### Fórmulas
```
Lucro = Receita - Custo
ROI (%) = Lucro / Investimento × 100
ROI anualizado (%) = ((1 + ROI/100)^(12/meses) - 1) × 100
```

### Outputs
- ROI da safra (%)
- ROI anualizado (%)
- Comparativo: CDB 100% CDI, Tesouro IPCA+, Poupança (taxas atualizáveis pelo usuário)
- Gráfico comparativo de rentabilidade

---

## 25. Custo por Talhão com Ranking

**Categoria:** Financeiro  
**Prioridade:** ⭐ Oportunidade única  
**Complexidade de desenvolvimento:** Alta

### O que é
Permite cadastrar cada talhão da fazenda individualmente com sua área e insumos utilizados, gerando um ranking de custo e rentabilidade por talhão.

### Para que serve
Identificar os talhões mais e menos rentáveis da fazenda — informação chave para decisões de arrendamento, intensificação ou abandono de áreas.

### Inputs (por talhão, múltiplos talhões)

| Campo | Exemplo |
|---|---|
| Nome do talhão | Talhão Norte |
| Área (ha) | 85 |
| Produtividade obtida (sc/ha) | 58 |
| Custo de insumos (R$/ha) | 1.850 |
| Custo de operações (R$/ha) | 650 |
| Custo de arrendamento (R$/ha) | 420 |
| Outros custos (R$/ha) | 120 |

### Outputs
- Custo total R$/ha por talhão
- Custo por saca produzida por talhão
- Receita por hectare por talhão
- **Lucro/prejuízo por talhão**
- **Ranking visual** (do mais ao menos rentável)
- Mapa simplificado (representação visual com cards por talhão)

### Regras de negócio
- Aceitar até 20 talhões simultâneos.
- Talhão com prejuízo: destacar em vermelho.
- Exportar relatório por talhão em PDF ou CSV.
- Esta ferramenta é a demonstração mais poderosa do que o software pago faz — CTA forte.

---

# 📦 GRÃOS E ARMAZENAGEM

---

## 26. Desconto por Umidade e Impureza

**Categoria:** Grãos  
**Prioridade:** 🔥 Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o desconto que a trading, armazém ou cooperativa aplica sobre o preço e o peso da carga com base na umidade e impureza fora do padrão.

### Para que serve
Produtores frequentemente não sabem calcular quanto estão perdendo nos descontos. Esta ferramenta torna o desconto transparente.

### Parâmetros padrão por cultura

| Cultura | Umidade padrão | Impureza padrão |
|---|---|---|
| Soja | 14% | 1% |
| Milho | 14,5% | 1% |
| Algodão pluma | 8% | — |
| Café | 11% | — |

### Inputs

| Campo | Exemplo |
|---|---|
| Cultura | Soja |
| Peso bruto da carga (kg ou sacas) | 27.000 kg |
| Umidade medida (%) | 16,5 |
| Impureza medida (%) | 2,2 |
| Ardidos (%) | 0,5 |
| Preço de referência (R$/sc) | 115 |

### Fórmulas

**Desconto por umidade:**
```
Fator_umidade = (Umidade_medida - Umidade_padrão) / (100 - Umidade_padrão)
Desconto_kg = Peso_bruto × Fator_umidade
```

**Desconto por impureza:**
```
Fator_impureza = (Impureza_medida - Impureza_padrão) / 100
Desconto_kg = Peso_bruto × Fator_impureza
```

**Peso líquido final:**
```
Peso_líquido = Peso_bruto - Desconto_umidade - Desconto_impureza - Desconto_ardidos
Sacas_líquidas = Peso_líquido / 60
```

### Outputs
- Peso descontado por umidade (kg)
- Peso descontado por impureza (kg)
- Peso líquido final (kg e sacas)
- Valor total da carga após descontos (R$)
- Quanto perdeu em R$ pelos descontos

### Regras de negócio
- Umidade > 18% para soja: alertar que muitos armazéns recusam a carga.
- Mostrar decomposição clara de cada desconto separadamente.
- Ardidos > 8%: produto pode ser rejeitado (alertar).

---

## 27. Umidade de Grãos & Perda por Secagem

**Categoria:** Grãos / Utilitário  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Baixa

### O que é
Calcula a quebra de peso (perda de massa) que ocorre durante a secagem dos grãos, da umidade de colheita até a umidade de comercialização.

### Inputs

| Campo | Exemplo |
|---|---|
| Cultura | Soja / Milho |
| Peso inicial (kg ou sc) | 50.000 kg |
| Umidade inicial (%) | 17 |
| Umidade final desejada (%) | 14 |
| Custo de secagem (R$/sc ou R$/t) | R$ 8,00/sc |

### Fórmula
```
Peso_final = Peso_inicial × (100 - Umidade_inicial) / (100 - Umidade_final)
Perda_kg = Peso_inicial - Peso_final
Perda_sc = Perda_kg / 60
Custo_secagem = Peso_inicial/60 × Custo_sc
```

### Outputs
- Peso final após secagem
- Perda em kg e sacas
- Custo total da secagem
- Perda financeira (sacas × preço)

---

## 28. Viabilidade de Armazenagem (Vender × Guardar)

**Categoria:** Grãos  
**Prioridade:** ⭐ Oportunidade única  
**Complexidade de desenvolvimento:** Alta

### O que é
Simula se é mais vantajoso vender o grão na colheita ou armazenar e vender em momento de preço mais alto, considerando todos os custos de armazenagem.

### Inputs

| Campo | Exemplo |
|---|---|
| Quantidade (sc) | 10.000 |
| Preço atual (colheita) R$/sc | 105 |
| Preço esperado daqui a X meses R$/sc | 120 |
| Prazo de armazenagem (meses) | 4 |
| Taxa de armazenagem (R$/sc/mês) | 0,45 |
| Quebra técnica estimada (% ao mês) | 0,1 |
| Custo de capital (% a.m.) | 1 |
| Custo de seguro (% do valor/mês) | 0,05 |

### Fórmulas
```
Receita_venda_imediata = Qtd × Preço_atual
Custo_armazenagem = Qtd × Taxa × Meses
Quebra_técnica_kg = Qtd × 60 × Quebra_mensal × Meses
Custo_capital = Receita_imediata × Taxa_capital × Meses
Custo_total_armazenagem = Custo_arm + Custo_capital + Custo_seguro
Receita_futura_líquida = (Qtd - Quebra/60) × Preço_futuro - Custo_total
Ganho_armazenagem = Receita_futura - Receita_imediata
```

### Outputs
- Receita venda imediata (R$)
- Receita venda futura líquida (R$)
- Ganho ou perda com armazenagem (R$)
- **Recomendação automática:** "Vender agora" ou "Vale guardar"
- Preço futuro mínimo para armazenagem ser viável (break-even da armazenagem)

---

## 29. Custo de Armazenagem (Silo Próprio vs Terceiro)

**Categoria:** Grãos  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média

### O que é
Compara o custo de armazenar em silo próprio versus em armazém de terceiros (cooperativa, trading, silo bag), e calcula o break-even do investimento em silo próprio.

### Inputs — Terceiro
- Preço cobrado (R$/sc/mês ou R$/sc entrada + saída)
- Volume anual (sc)
- Prazo médio (meses)

### Inputs — Silo Próprio
- Capacidade (toneladas ou sacas)
- Custo de construção (R$)
- Vida útil (anos)
- Custo operacional anual (energia, manutenção) (R$/ano)

### Outputs
- Custo/sc em armazém de terceiro (R$)
- Custo/sc em silo próprio (R$)
- Break-even: em quantos anos o silo próprio se paga
- Economia anual após break-even

---

# 📋 TRIBUTÁRIO RURAL

---

## 30. Reforma Tributária para Produtor Rural

**Categoria:** Tributário  
**Prioridade:** 🔥 URGENTE  
**Complexidade de desenvolvimento:** Alta

### O que é
Simula o impacto da Reforma Tributária (EC 132/2023) na carga tributária do produtor rural, comparando o regime atual (PIS/COFINS, ICMS, ISS) com o novo regime (CBS, IBS, Imposto Seletivo).

### Para que serve
O produtor rural tem particularidades tributárias (imunidade de ICMS em alguns estados, Funrural, isenções de PIS/COFINS) que a maioria dos simuladores genéricos ignora. Esta ferramenta é específica para o agro.

### Inputs

| Campo | Exemplo |
|---|---|
| Tipo de produtor | PF (LCDPR) / PJ (Lucro Presumido) / Cooperativa |
| Estado | MT / GO / PR / SP / outros |
| Faturamento anual (R$) | 5.000.000 |
| % venda para mercado interno | 70 |
| % venda para exportação | 30 |
| Principais culturas | Soja / Milho / Algodão |
| Compra de insumos (R$/ano) | 2.200.000 |

### Regime atual (estimativa)
```
PIS/COFINS sobre venda mercado interno: 0% (soja é isenta na saída)
ICMS: varia por estado e operação
Funrural PF: 1,5% sobre receita bruta
Funrural PJ: 2,85% sobre receita bruta
```

### Regime novo (IBS + CBS)
```
CBS: ~8,8% (federal, substitui PIS/COFINS)
IBS: ~17,7% médio (subnacional, substitui ICMS/ISS)
Alíquota total: ~26,5%
Com créditos de insumos: redução significativa
Nota: agropecuária tem alíquota reduzida a 60% da padrão
```

### Outputs
- Carga tributária atual estimada (R$ e %)
- Carga tributária nova estimada (R$ e %)
- Diferença: aumento ou redução (R$ e %)
- Créditos aproveitáveis no novo regime (insumos, máquinas)
- Alerta: reforma em fase de transição até 2033

### Regras de negócio
- Disclaimer obrigatório: "Estimativa baseada em legislação vigente até [data]. Consulte seu contador."
- Mostrar premissas utilizadas no cálculo.
- Atualizar quando sair regulamentação complementar.

---

## 31. Calculadora de Funrural

**Categoria:** Tributário  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Baixa

### O que é
Calcula a contribuição previdenciária rural (Funrural) devida pelo produtor rural com base na receita bruta de venda.

### Alíquotas vigentes

| Tipo | Funrural | RAT | SENAR | Total |
|---|---|---|---|---|
| PF — empregador | 1,2% | 0,1% | 0,2% | 1,5% |
| PF — segurado especial | 1,2% | 0,1% | 0,2% | 1,5% |
| PJ — agroindustrial | 2,5% | 0,1% | 0,25% | 2,85% |

### Inputs
- Tipo de produtor (PF / PJ)
- Receita bruta do período (R$)
- Período (mensal / anual)

### Outputs
- Funrural a recolher (R$)
- RAT (R$)
- SENAR (R$)
- Total (R$)
- Projeção anual se input for mensal

### Regras de negócio
- Exportação: imune (não incide Funrural sobre receita de exportação).
- Alertar sobre prazo de recolhimento (dia 20 do mês seguinte à venda).

---

## 32. Calculadora de ITR

**Categoria:** Tributário  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula o Imposto sobre a Propriedade Territorial Rural (ITR) com base na área, localização e grau de utilização do imóvel.

### Grau de Utilização (GU)
```
GU = Área Efetivamente Utilizada / Área Total Aproveitável × 100
```

### Tabela de alíquotas ITR (simplificada)

| Área (ha) | GU ≥ 80% | GU 65–80% | GU 50–65% | GU < 50% |
|---|---|---|---|---|
| Até 50 | 0,03% | 0,20% | 0,40% | 1,00% |
| 50–200 | 0,07% | 0,40% | 0,80% | 2,00% |
| 200–500 | 0,10% | 0,60% | 1,30% | 3,00% |
| 500–1.000 | 0,15% | 0,85% | 1,90% | 4,30% |
| > 1.000 | 0,45% | 3,00% | 5,16% | 8,60% |

### Inputs
- Área total do imóvel (ha)
- Área efetivamente utilizada (ha)
- Valor da Terra Nua (VTN) por hectare (R$/ha)
- Módulo fiscal do município (ha)

### Fórmulas
```
VTNt = VTN × Área_total
GU = Área_util / Área_aproveitável × 100
Alíquota = tabela(Área_total, GU)
ITR = VTNt × Alíquota / 100
```

### Outputs
- GU calculado
- Alíquota aplicável
- ITR anual estimado
- Imposto por hectare

---

## 33. Rentabilidade por Cultura (com Impostos)

**Categoria:** Tributário / Financeiro  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Alta

### O que é
Compara a rentabilidade líquida de diferentes culturas (soja, milho, algodão, sorgo) na mesma área, já considerando todos os impostos incidentes.

### Inputs (por cultura)
- Produtividade esperada (sc/ha)
- Preço de venda (R$/sc)
- Custo de produção (R$/ha)
- Tipo de produtor (PF/PJ) para calcular Funrural correto
- ICMS diferenciado por estado

### Outputs
- Receita bruta R$/ha por cultura
- Impostos R$/ha por cultura
- Lucro líquido R$/ha por cultura
- ROI % por cultura
- **Gráfico de barras comparativo** — qual cultura rende mais na fazenda

---

# 🧰 UTILITÁRIOS

---

## 34. Conversor Universal de Medidas Agro

**Categoria:** Utilitário  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Baixa  
**Classificação:** ✅ Fácil — lançar primeiro

### O que é
Conversor completo de todas as unidades de medida utilizadas no agronegócio brasileiro, com foco nas medidas regionais (alqueires por estado).

### Para que serve
O agronegócio usa medidas regionais díspares — um alqueire no Mato Grosso é diferente de um alqueire em São Paulo. Este conversor elimina a confusão.

### Tabela de conversões de área

| Unidade | Equivalência em hectares |
|---|---|
| Hectare (ha) | 1,0000 |
| Alqueire Mato Grosso | 4,8400 ha |
| Alqueire Paulista | 2,4200 ha |
| Alqueire Mineiro | 4,8400 ha |
| Alqueire Baiano | 9,6800 ha |
| Alqueire Goiano | 4,8400 ha |
| Alqueire Nordestino (tarefa) | 0,4356 ha |
| Acre (US) | 0,4047 ha |
| m² | 0,0001 ha |

### Tabela de conversões de peso/volume

| Unidade | Base |
|---|---|
| Saca soja/milho/trigo (60kg) | — |
| Saca café (60kg) | — |
| Saca de arroz (50kg) | — |
| Saca de algodão em pluma (15kg) | — |
| Tonelada | 1.000 kg |
| Arroba boi (@) | 15 kg |
| Bushel soja | 27,216 kg |
| Bushel milho | 25,401 kg |
| Short ton (US) | 907,18 kg |

### Conversões de produtividade

| De | Para | Fator |
|---|---|---|
| sc soja/ha | kg/ha | × 60 |
| sc soja/ha | t/ha | × 0,06 |
| sc soja/ha | bu/ac | × 0,6726 |
| sc milho/ha | bu/ac | × 0,6274 |

### UX / Interface
- Dois campos: "De" (input + unidade) e "Para" (resultado + unidade)
- Botão de troca rápida ↔
- Abas: Área / Peso / Produtividade
- Resultado em tempo real (sem botão calcular)

---

## 35. Calculadora de Tank Mix

**Categoria:** Utilitário  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média  
**Classificação:** ✅ Fácil

### O que é
Calcula as quantidades de cada produto numa mistura de defensivos no tanque do pulverizador, garantindo que as doses por hectare sejam respeitadas.

### Para que serve
Tank mix é prática comum mas arriscada. Esta ferramenta padroniza o cálculo e sugere a ordem correta de adição dos produtos.

### Inputs

| Campo | Exemplo |
|---|---|
| Volume do tanque (L) | 3.000 |
| Volume de calda utilizado (L/ha) | 120 |
| Área a ser aplicada (ha) | 25 |

**Por produto (até 6 produtos):**
| Campo | Exemplo |
|---|---|
| Nome do produto | Priori Xtra |
| Formulação | SC / WG / EC / SL |
| Dose por hectare (L ou kg/ha) | 0,30 L/ha |

### Fórmulas
```
Tanques necessários = Área × Volume_calda / Volume_tanque
Quantidade por tanque = Dose_ha × (Volume_tanque / Volume_calda)
Quantidade total = Dose_ha × Área
```

### Outputs
- Número de tanques necessários
- Por produto: quantidade por tanque (L ou kg) e quantidade total
- Ordem de adição sugerida por formulação (WG → SC → EC → SL)

### Regras de negócio
- Ordem de adição no tanque: 1º WG (pó molhável), 2º SC (suspensão concentrada), 3º EC (emulsionável), 4º SL (solúvel).
- Avisar que compatibilidade química deve ser verificada nas bulas.
- Não misturar herbicidas com fungicidas/inseticidas sem verificar bula.

---

## 36. Mistura de Calda (Dose por Tanque)

**Categoria:** Utilitário  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Baixa  
**Classificação:** ✅ Fácil

### O que é
Versão simplificada do Tank Mix, focada em calcular a dose de um único produto por tanque, por bico e por hectare.

### Inputs
- Volume do tanque (L)
- Volume de calda desejado (L/ha)
- Dose do produto (L/ha ou kg/ha conforme bula)

### Outputs
- mL ou g por tanque cheio
- mL ou g por 100L de calda
- Área coberta por tanque (ha)

---

## 37. Balanço Hídrico & Pluviometria

**Categoria:** Utilitário / Inteligente  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Alta

### O que é
Ferramenta de monitoramento simplificado do balanço hídrico da lavoura, comparando precipitação acumulada com evapotranspiração estimada por fase da cultura.

### Inputs

| Campo | Exemplo |
|---|---|
| Cultura | Soja / Milho |
| Fase atual | Vegetativa / Floração / Enchimento / Maturação |
| Precipitação da semana (mm) | 45 |
| Precipitação acumulada no mês (mm) | 120 |
| Textura do solo | Arenoso / Médio / Argiloso |
| Temperatura média (°C) | 32 |

### Evapotranspiração de referência (ETo) — Estimativa simplificada
```
ETo estimada = 0,0023 × (Tmed + 17,8) × (Tmax - Tmin)^0,5 × Ra
(Método Hargreaves simplificado)
```

### Outputs
- Déficit ou excesso hídrico (mm)
- Condição: Adequado / Déficit leve / Déficit severo / Excesso
- Alerta por fase: floração com déficit = risco crítico
- Recomendação simplificada (irrigar / aguardar / drenagem)

---

## 38. Conversor Sc/Ha ↔ Kg/Ha ↔ Bushel

**Categoria:** Utilitário  
**Prioridade:** Baixa  
**Complexidade de desenvolvimento:** Muito Baixa  
**Classificação:** ✅ Fácil — já coberto pela ferramenta 34

### Observação
Esta ferramenta está consolidada na Ferramenta 34 (Conversor Universal). Pode ser feita como widget standalone mais simples, focado só em produtividade, para uso rápido.

### Inputs
- Valor de produtividade (número)
- Unidade (sc/ha, kg/ha, t/ha, bushel/acre)
- Cultura

### Output
Tabela instantânea com todos os equivalentes.

---

# 🧠 OPORTUNIDADES ÚNICAS

---

## 39. Simulador de Safra (Preço × Produtividade × Custo)

**Categoria:** Inteligente / Financeiro  
**Prioridade:** ⭐ Ouro  
**Complexidade de desenvolvimento:** Alta

### O que é
O simulador mais completo da lista. Cruza três variáveis principais (preço de mercado, produtividade e custo de produção) e gera uma análise de viabilidade com múltiplos cenários e visualização gráfica.

### Diferenciais
- Slider interativo de preço e produtividade em tempo real
- Mapa de calor (heatmap) mostrando lucro/prejuízo para combinações de preço × produtividade
- Exportar relatório PDF

### Inputs
- Custo de produção (R$/ha) — pode usar resultado da Ferramenta 17
- Área total (ha)
- Range de preço (mín. e máx. esperado R$/sc)
- Range de produtividade (mín. e máx. esperado sc/ha)
- Tipo de produtor (para Funrural)

### Outputs
- **Heatmap:** eixo X = preço (R$/sc), eixo Y = produtividade (sc/ha), células coloridas por lucro (verde) ou prejuízo (vermelho)
- Três cenários destacados: pessimista / base / otimista
- Ponto de equilíbrio: linha destacada no heatmap
- Resultado total da fazenda por cenário
- ROI por cenário

### Regras de negócio
- O heatmap é o diferencial visual desta ferramenta — investir na qualidade do gráfico.
- Usar biblioteca: Chart.js ou D3.js para o heatmap.
- Permitir salvar como imagem (screenshot) para compartilhar no WhatsApp.

---

## 40. Diagnóstico de Gestão da Fazenda

**Categoria:** Lead Magnet  
**Prioridade:** ⭐ Ouro — Máxima prioridade de desenvolvimento  
**Complexidade de desenvolvimento:** Alta

### O que é
Quiz interativo que avalia o nível de maturidade da gestão da fazenda em 6 dimensões, gera um score e apresenta recomendações personalizadas. Ao final, CTA para o software.

### Estrutura do quiz

**6 dimensões × 2 perguntas cada = 12 perguntas**

**1. Controle Financeiro**
- P1: "Como você controla as despesas da fazenda?" — Opções: Planilha Excel / Caderno / Memória / Software específico
- P2: "Com que frequência você sabe o custo por hectare da safra?" — Nunca / Após a colheita / Durante a safra / Em tempo real

**2. Gestão de Insumos**
- P3: "Como você controla o estoque de insumos?" — Sem controle / Planilha / Software / Automático
- P4: "Você consegue rastrear qual insumo foi usado em qual talhão?" — Não / Parcialmente / Sim, em planilha / Sim, em sistema

**3. Planejamento de Safra**
- P5: "Você faz orçamento da safra antes de plantar?" — Não / Estimativa mental / Planilha simples / Orçamento detalhado
- P6: "Você acompanha o custo real vs orçado durante a safra?" — Não / Raramente / Às vezes / Sempre

**4. Gestão de Máquinas**
- P7: "Você sabe o custo por hora de cada máquina?" — Não / Aproximado / Sim, calculei uma vez / Sim, atualizado sempre
- P8: "Como você controla a manutenção das máquinas?" — Sem controle / Pela memória / Planilha / Sistema

**5. Fiscal e Tributário**
- P9: "Você emite NF-e como produtor rural?" — Não emito / Emito com dificuldade / Emito normalmente / Integrado ao sistema
- P10: "Você conhece sua carga tributária real (Funrural, ITR, IR)?" — Não sei / Sei aproximado / Sei precisamente

**6. Tecnologia e Dados**
- P11: "Você utiliza algum software de gestão agrícola?" — Não / Planilha avançada / Software básico / Software completo
- P12: "Você toma decisões baseadas em dados históricos da fazenda?" — Nunca / Raramente / Às vezes / Sempre

### Pontuação
- Cada resposta: 0, 1, 2 ou 3 pontos
- Score máximo: 36 pontos
- Níveis: 0–12 = Iniciante | 13–24 = Em desenvolvimento | 25–36 = Avançado

### Outputs (página de resultado)
- Score geral com barra de progresso
- **Gráfico radar** com as 6 dimensões
- Nível de maturidade (Iniciante / Em desenvolvimento / Avançado)
- 3 recomendações personalizadas baseadas nas dimensões mais fracas
- **CTA principal:** "O Plantae resolve exatamente isso — veja como" (link para demo ou trial)

### Regras de negócio
- **Gate de e-mail:** mostrar score parcial → pedir e-mail para revelar relatório completo.
- Salvar respostas para follow-up de vendas.
- Personalizar o CTA com base nas fraquezas identificadas (ex: se financeiro baixo, mostrar feature financeira do software).
- Compartilhável: "Mostre seu score para seu agrônomo" → botão de compartilhar.

---

## 41. Simulador de ROI do Software

**Categoria:** Lead Magnet  
**Prioridade:** ⭐ Ouro — Alta conversão em venda  
**Complexidade de desenvolvimento:** Média

### O que é
Calcula quanto dinheiro o produtor pode economizar (ou ganhar) ao usar um software de gestão agrícola, transformando o argumento de venda em número concreto.

### Inputs (3 perguntas simples)

1. **Qual o tamanho da sua fazenda?** → Área em hectares
2. **Quais culturas você planta?** → Soja / Milho / Algodão / Misto
3. **Como você gerencia hoje?** → Planilha Excel / Cadernos / Memória / Outro sistema

### Estimativas de ganho por categoria

| Área de ganho | Estimativa de economia |
|---|---|
| Redução de perdas por controle de insumos | 1–2% do custo de insumos |
| Melhor timing de venda (controle financeiro) | R$ 2–5/sc |
| Redução de perdas na colheita (dados históricos) | 0,5–1 sc/ha |
| Economia em horas de gestão (tempo do produtor) | 8–15h/mês |
| Redução de erros fiscais (multas evitadas) | R$ 5.000–20.000/ano |

### Fórmulas
```
Economia_insumos = Custo_insumos_estimado × 0,015
Ganho_comercialização = Área × Produtividade_média × R$3/sc
Economia_colheita = Área × 0,7 sc × Preço_saca
Economia_total_ano = soma de todas as categorias
ROI_software = Economia_total / Custo_anual_software × 100
Payback = Custo_software / (Economia_total / 12) meses
```

### Outputs
- Economia anual estimada (R$)
- ROI do software (%)
- Payback em meses
- Breakdown por categoria de ganho
- **CTA:** "Comece o teste grátis e comprove estes números"

### Regras de negócio
- Ser conservador nas estimativas (para ser crível).
- Mostrar disclaimer: "Estimativa baseada em médias de clientes da plataforma."
- Gate de contato ao final: nome + e-mail + telefone para agendar demo.

---

## 42. Calculadora de Irrigação

**Categoria:** Inteligente  
**Prioridade:** ⭐ Ouro  
**Complexidade de desenvolvimento:** Alta

### O que é
Calcula a lâmina de irrigação necessária e o turno de rega com base na fase da cultura, características do solo e condições climáticas locais.

### Inputs

| Campo | Exemplo |
|---|---|
| Cultura | Soja / Milho / Algodão / Feijão |
| Fase fenológica | Germinação / Vegetativa / Floração / Enchimento |
| Tipo de solo | Arenoso / Franco-argiloso / Argiloso |
| Capacidade de campo (mm/m) | 100 |
| Ponto de murcha (mm/m) | 40 |
| Profundidade do sistema radicular (m) | 0,60 |
| Precipitação última semana (mm) | 12 |
| Temperatura máxima média (°C) | 34 |
| Sistema de irrigação | Pivô central / Gotejamento / Aspersão convencional |

### Fórmulas

**Evapotranspiração (ETo) — Penman-Monteith simplificado:**
```
ETc = ETo × Kc  (Kc varia por fase da cultura)
```

**Kc por fase (Soja):**
- Inicial: 0,40
- Desenvolvimento: 0,70–1,00
- Intermediário (floração): 1,00–1,15
- Final (maturação): 0,50

**Lâmina bruta:**
```
Lâmina_líquida = (CC - PM) × Prof_raiz × 0,50  (intervir a 50% da capacidade)
Lâmina_bruta = Lâmina_líquida / Eficiência_sistema
Turno_rega = Lâmina_líquida / ETc
```

### Outputs
- Lâmina de irrigação necessária (mm)
- Turno de rega (dias entre irrigações)
- Tempo de funcionamento do pivô (horas)
- Custo estimado (kWh × L/h × tarifa)
- Alerta de fase crítica (floração com déficit = risco máximo)

---

## 43. Calculadora de Área por GPS (Mapa)

**Categoria:** Inteligente  
**Prioridade:** ⭐ Ouro — Alto diferencial técnico  
**Complexidade de desenvolvimento:** Muito Alta

### O que é
Ferramenta que permite ao produtor desenhar o polígono do talhão diretamente no mapa (Google Maps / Leaflet.js) e calcular a área automaticamente em hectares e alqueires.

### Para que serve
Muitos produtores não sabem a área exata dos seus talhões, ou têm dificuldade em usar apps específicos (DroneMap, etc.). Esta ferramenta funciona direto no navegador, sem instalar nada.

### Tecnologias necessárias
- **Mapa:** Leaflet.js (open source) ou Google Maps JavaScript API
- **Cálculo de área:** algoritmo de Shoelace (área de polígono com coordenadas lat/lng)
- **GPS:** Geolocation API do navegador

### Funcionalidades

1. **Modo desktop:** clicar no mapa para marcar os vértices do talhão
2. **Modo mobile:** usar GPS do celular para caminhar pelo perímetro do talhão (gravar o percurso)
3. **Importar KML/Shapefile:** arrastar arquivo para calcular área

### Algoritmo de área (Shoelace com correção para lat/lng)
```javascript
function calcularArea(coordenadas) {
  // Fórmula de Gauss (Shoelace) em coordenadas esféricas
  // Resultado em m², converter para ha dividindo por 10.000
}
```

### Outputs
- Área em metros quadrados (m²)
- Área em hectares (ha)
- Área em alqueires (MT, SP, GO — selecionável)
- Perímetro em metros
- Mapa com o polígono desenhado (exportável como imagem)

### Regras de negócio
- Mínimo 3 pontos para formar um polígono válido.
- Alertar se o polígono se auto-intersectar.
- Precisão declarada: ±2–5% (GPS do celular tem precisão de 3–5m).
- Botão "desfazer último ponto" e "limpar tudo".
- Permitir salvar/exportar o polígono como KML.

---

## 44. Comparador de Culturas (Soja × Milho × Algodão)

**Categoria:** Inteligente / Financeiro  
**Prioridade:** ⭐ Ouro  
**Complexidade de desenvolvimento:** Alta

### O que é
Compara a rentabilidade esperada de diferentes culturas na mesma área, gerando um ranking com gráfico visual para apoiar a decisão de qual cultura plantar.

### Inputs (por cultura, até 4 culturas simultâneas)

| Campo | Soja | Milho | Algodão |
|---|---|---|---|
| Incluir no comparativo | ✓ | ✓ | ✓ |
| Produtividade esperada | sc/ha | sc/ha | @/ha |
| Preço de venda | R$/sc | R$/sc | R$/@ |
| Custo de produção | R$/ha | R$/ha | R$/ha |

### Outputs
- Tabela comparativa: receita, custo, lucro, ROI e margem por cultura
- **Gráfico de barras** empilhadas: custo vs receita por cultura
- **Ranking visual** com indicação da mais rentável
- Análise de risco: variação de preço necessária para tornar a 2ª opção mais vantajosa

---

# 🎯 FERRAMENTAS EXTRAS

---

## 45. Calculadora de Custo de Hora-Máquina

**Categoria:** Operacional  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média

### O que é
Versão focada do blueprint da Ferramenta 10, calculando especificamente o custo por hora de operação de uma máquina agrícola.

### Componentes do custo de hora-máquina

```
1. Depreciação/h = (Valor_novo - Valor_residual) / Vida_útil_horas
2. Juros/h = ((Valor_novo + Valor_residual) / 2) × Taxa_capital / Horas_ano
3. Seguro/h = Valor_novo × Taxa_seguro / Horas_ano
4. Manutenção/h = Valor_novo × Taxa_manut / Horas_ano
5. Combustível/h = Consumo_L_h × Preço_diesel
6. Operador/h = (Salário_mensal × 13,33) / Horas_ano
```

### Outputs
- Custo total por hora (R$/h)
- Custo por categoria (gráfico pizza)
- Custo por hectare (se informar capacidade operacional)
- Comparação: se o produtor cobrar abaixo deste valor numa prestação de serviço, está tendo prejuízo

---

## 46. Estimativa de Perda por Secagem

**Categoria:** Grãos / Utilitário  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Muito Baixa  
**Observação:** Coberto pela Ferramenta 27 — pode ser widget standalone mais simples.

### Fórmula essencial
```
Peso_seco = Peso_úmido × (100 - Umidade_inicial) / (100 - Umidade_final)
Perda = Peso_úmido - Peso_seco
```

---

## 47. Calculadora de Umidade de Grãos Simples

**Categoria:** Grãos / Utilitário  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Muito Baixa  
**Observação:** Coberto pelas Ferramentas 26 e 27 — widget standalone para uso rápido no celular.

### Função
Input: umidade medida + peso. Output: peso seco, kg de água a retirar, desconto estimado.

---

## 48. Simulador de Plantio Soja / Milho / Algodão

**Categoria:** Agronômica  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Média  
**Observação:** Extensão da Ferramenta 1, com templates pré-configurados por cultura.

### Diferencial
Ao invés do usuário preencher todos os campos, seleciona a cultura e a região e os campos vêm pré-preenchidos com valores típicos do ZARC/EMBRAPA para aquela combinação.

---

## 49. Calculadora de Pulverização

**Categoria:** Operacional  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Média  
**Observação:** Versão expandida da Ferramenta 12 (Calibração de Pulverizador).

### Campos adicionais vs Ferramenta 12
- Cálculo do custo total da operação de pulverização (produto + combustível + hora-máquina)
- Tabela de bicos e vazões de referência (Teejet, Magnojet)
- Calculadora de diluição de caldas concentradas

---

## 50. Simulador de Viabilidade de Armazenagem Avançado

**Categoria:** Grãos  
**Prioridade:** Alta  
**Complexidade de desenvolvimento:** Alta  
**Observação:** Versão avançada da Ferramenta 28, com simulação de preços futuros e câmbio.

### Inputs adicionais
- Cotação do dólar atual e projetada
- Preço da soja na CBOT (bushels) — conversão automática para R$/sc
- Histórico de preço para análise de sazonalidade

---

## 51. Calculadora de Conversão de Adubo (Custo por Ponto)

**Categoria:** Agronômica / Utilitário  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Baixa  
**Observação:** Já coberto pela Ferramenta 5 (Conversor de Formulação NPK). Consolidar nas duas.

---

## 52. Calculadora de Balanço Hídrico e Monitoramento Pluviométrico

**Categoria:** Utilitário / Inteligente  
**Prioridade:** Média  
**Complexidade de desenvolvimento:** Alta  
**Observação:** Já coberto pela Ferramenta 37. Blueprint consolidado lá.

---

# 📊 Resumo Estratégico — Priorização de Desenvolvimento

## Fase 1 — Lançar primeiro (rápido e alto impacto)
Ferramentas de desenvolvimento rápido que geram tráfego imediato:

| # | Ferramenta | Tempo estimado | Impacto |
|---|---|---|---|
| 34 | Conversor Universal de Medidas | 1–2 dias | Alto tráfego |
| 26 | Desconto por Umidade e Impureza | 2–3 dias | Uso na colheita |
| 27 | Umidade de Grãos & Secagem | 1 dia | Quick win |
| 9 | Produtividade por Hectare | 1 dia | Quick win |
| 38 | Conversor Sc/Ha ↔ Kg/Ha ↔ Bushel | 0,5 dia | Quick win |
| 35 | Calculadora de Tank Mix | 2 dias | Campo diário |
| 36 | Mistura de Calda | 1 dia | Campo diário |

## Fase 2 — Core calculadoras (impacto financeiro direto)
| # | Ferramenta | Tempo estimado | Impacto |
|---|---|---|---|
| 17 | Custo de Produção R$/ha e R$/saca | 5–7 dias | ⭐ Maior lead magnet |
| 19 | Ponto de Equilíbrio | 2–3 dias | Alta demanda |
| 2 | Calagem | 3–4 dias | Agrônomos |
| 3 | Adubação NPK | 4–5 dias | Agrônomos |
| 1 | Taxa de Semeadura | 2–3 dias | Campo |

## Fase 3 — Lead magnets (conversão em cliente)
| # | Ferramenta | Tempo estimado | Impacto |
|---|---|---|---|
| 40 | Diagnóstico de Gestão da Fazenda | 7–10 dias | ⭐ Conversão máxima |
| 41 | Simulador de ROI do Software | 3–5 dias | ⭐ Venda direta |
| 39 | Simulador de Safra (Heatmap) | 7–10 dias | Viral/compartilhável |
| 18 | Simulador de Lucro da Safra | 5–7 dias | Lead financeiro |

## Fase 4 — Diferenciais técnicos (autoridade de mercado)
| # | Ferramenta | Tempo estimado | Impacto |
|---|---|---|---|
| 43 | Calculadora de Área por GPS | 10–15 dias | Alto diferencial |
| 25 | Custo por Talhão | 7–10 dias | Demo do software |
| 30 | Reforma Tributária Rural | 7–10 dias | Urgente/tráfego |
| 10 | Custo Máquinas (Compra×Aluguel×Terceiro) | 5–7 dias | Alto valor |

---

# 🛠️ Guia de Implementação para o Copilot

## Como usar este arquivo

```
1. Abra o VSCode com GitHub Copilot ativo
2. Abra este arquivo como contexto
3. Crie um novo arquivo (ex: CalcSemeadura.jsx)
4. No início do arquivo, cole o comentário abaixo:
```

### Prompt padrão para o Copilot

Cole no topo do novo arquivo:

```javascript
/**
 * BLUEPRINT: [Nome da ferramenta]
 * Ver blueprint completo em: blueprint_ferramentas_agro.md#[âncora]
 * 
 * Stack: React + Tailwind CSS
 * Requisitos:
 * - Componente funcional React
 * - Sem backend, cálculo 100% client-side
 * - Responsivo (mobile-first)
 * - Inputs com validação
 * - Resultado em card destacado
 * - Botões Calcular e Limpar
 * - Cor primária: verde (#3B6D11, #639922, #EAF3DE)
 * 
 * Implemente a ferramenta conforme o blueprint.
 */
```

## Estrutura de pastas sugerida

```
/src
  /ferramentas
    /agronomicas
      TaxaSemeadura.jsx
      Calagem.jsx
      AdubacaoNPK.jsx
      ...
    /operacional
      CustoMaquinas.jsx
      Pulverizador.jsx
      ...
    /financeiro
      CustoProducao.jsx
      BreakEven.jsx
      ...
    /graos
      DescontoUmidade.jsx
      ...
    /tributario
      Funrural.jsx
      ...
    /utilitarios
      ConversorMedidas.jsx
      TankMix.jsx
      ...
    /leadmagnets
      DiagnosticoGestao.jsx
      SimuladorROI.jsx
      ...
  /components
    InputField.jsx       // Input padrão com label e unidade
    ResultCard.jsx       // Card de resultado destacado
    CalculatorLayout.jsx // Layout padrão de calculadora
    AlertBanner.jsx      // Alertas e avisos
  /utils
    formulas.js          // Todas as fórmulas puras (testáveis)
    conversoes.js        // Tabelas de conversão
    referencias.js       // Dados de referência (EMBRAPA, ZARC)
```

## Componente base recomendado

```jsx
// CalculatorLayout.jsx — use como base para todas as ferramentas
import React, { useState } from 'react';

export default function CalculatorLayout({ title, description, children, result }) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-green-800 mb-1">{title}</h1>
      <p className="text-gray-500 text-sm mb-6">{description}</p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {children}
      </div>
      
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          {result}
        </div>
      )}
    </div>
  );
}
```

---

*Blueprint gerado para uso com GitHub Copilot, Cursor e assistentes de IA.*  
*Versão 1.0 — Atualizar conforme legislação tributária e referências agronômicas mudem.*
