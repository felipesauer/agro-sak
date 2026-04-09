# Agro SAK

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel&logoColor=white)](https://github.com/felipesauer/agro-sak)

**Agro SAK** é uma coleção de **63 calculadoras gratuitas** para o agronegócio brasileiro. O objetivo é simples: dar ao produtor rural, técnico agrícola e consultor acesso rápido a cálculos do dia a dia — sem precisar de planilha, cadastro ou internet (depois do primeiro acesso).

Tudo roda direto no navegador. Os dados ficam no dispositivo do usuário.

## Para quem é

- **Produtores rurais** que querem tomar decisões baseadas em números, não em chute.
- **Técnicos e consultores** que precisam de cálculos rápidos no campo.
- **Estudantes de agronomia** que querem entender as fórmulas na prática.

## O que você pode calcular

### 🌱 Agronômico (14)
Calagem, adubação NPK, taxa de semeadura, exportação de nutrientes, espaçamento de plantio, janela de plantio, análise de solo, tratamento de sementes, gessagem, amostragem de solo, rotação de culturas, formulação de adubos, comparador de fórmulas NPK, correção de micronutrientes.

### 🚜 Operacional (12)
Calibração de pulverizador, capacidade operacional, perdas na colheita, estimativa de produtividade pré-colheita, consumo de combustível, custo de máquinas, depreciação, logística de transporte, custo de energia elétrica, aplicação aérea, custo de colheita, consumo de água.

### 💰 Financeiro (13)
Custo de produção, ponto de equilíbrio, precificação de venda, simulador de lucro, fluxo de caixa, ROI agrícola, financiamento rural, arrendamento rural, payback de investimento, seguro rural, ranking de custo por talhão, inventário de insumos, pecuária.

### 📦 Grãos e Armazenagem (7)
Desconto por umidade e impureza, perda por secagem, custo de secagem, custo de armazenagem, viabilidade de armazenagem, classificação de grãos, dimensionamento de silos.

### 📋 Tributário (4)
Funrural, ITR, rentabilidade por cultura, impacto da Reforma Tributária (EC 132/2023).

### 🧰 Utilitários (6)
Conversor de medidas agro, conversor de produtividade, tank mix, mistura de calda, volume de chuva, balanço hídrico.

### 🧠 Ferramentas Inteligentes (7)
Irrigação, comparador de culturas, simulador de safra (heatmap preço × produtividade), ROI de software de gestão, calculadora de área por GPS, crédito de carbono rural, diagnóstico de maturidade de gestão da fazenda.

## Como usar

Clone o repositório e rode localmente (veja instruções abaixo), ou faça deploy na Vercel com um clique.

Para usar offline, adicione o site à tela inicial do celular (PWA). O app funciona sem conexão após o primeiro carregamento.

## Rodando Localmente

```bash
git clone https://github.com/felipesauer/agro-sak.git
cd agro-sak
cp .env.example .env      # configurar variáveis de ambiente
npm install
npm run dev                # http://localhost:5173
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`tsc` + Vite) |
| `npm run lint` | Verificação de código (ESLint) |
| `npm test` | Rodar todos os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com relatório de cobertura |

### Variáveis de Ambiente

Veja [`.env.example`](.env.example) para as variáveis necessárias. Somente as serverless functions (API proxies) usam variáveis — o frontend não precisa de nenhuma.

## Arquitetura

```
src/
├── core/           # Lógica de domínio pura (funções calculate/validate)
│   ├── agronomic/  # 16 módulos — calagem, adubação, semeadura...
│   ├── financial/  # 16 módulos — custo, ROI, financiamento...
│   ├── grain/      #  7 módulos — secagem, armazenagem, classificação...
│   ├── operational/# 12 módulos — máquinas, combustível, colheita...
│   ├── tax/        #  2 módulos — funrural, ITR
│   └── utilities/  #  8 módulos — conversores, GPS, diagnóstico...
├── tools/          # Componentes .tsx (UI) — cada um consome seu core/
├── components/     # Componentes compartilhados (InputField, Layout...)
├── data/           # Dados de referência (fórmulas, coeficientes)
├── db/             # Dexie (IndexedDB) — persistência local
├── hooks/          # React hooks customizados
├── pages/          # Páginas de roteamento
└── utils/          # Utilitários gerais (formatação, parse)
```

**Regra principal:** toda lógica de cálculo fica em `src/core/`. Os arquivos `.tsx` fazem apenas parsing de string → número, chamam `core/` e exibem o resultado. Isso garante testabilidade — cada módulo core tem seu `.test.ts` correspondente.

## Testes

897 testes distribuídos em 61 suítes. Cobertura atual:

| Métrica | Valor |
|---|---|
| Statements | 99.81% |
| Branches | 98.84% |
| Functions | 100% |
| Lines | 99.92% |

```bash
npm test               # rodar todos
npm run test:coverage  # com relatório de cobertura
```

## Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de código, como adicionar novas ferramentas e o fluxo de pull request.

## Tech Stack

- **React 19** + **TypeScript 6** — UI e tipagem
- **Vite 8** — bundler e dev server
- **Tailwind CSS 4** — estilização
- **Vitest** — testes unitários (897 testes, 98.8% branches)
- **Dexie** — persistência local via IndexedDB
- **React Router 7** — roteamento SPA
- **Vercel** — deploy e serverless functions (proxies BCB/CBS)
- **PWA** — funciona offline via Service Worker

## Perguntas Frequentes

**Os cálculos são confiáveis?**
As fórmulas seguem referências técnicas oficiais (Embrapa, MAPA, legislação vigente). Ainda assim, os resultados são estimativas — sempre valide com um engenheiro agrônomo credenciado antes de tomar decisões críticas.

**Meus dados ficam na nuvem?**
Não. Todo o processamento acontece no seu navegador. O histórico de cálculos é salvo localmente no dispositivo via IndexedDB e nunca é enviado a nenhum servidor.

**Precisa de internet?**
Apenas no primeiro acesso. Depois, o app funciona offline como qualquer aplicativo instalado no celular (PWA).

**As ferramentas são pagas?**
Não. Todas as calculadoras são gratuitas e não há plano pago.

**Posso usar no celular?**
Sim. O app é responsivo e pode ser instalado na tela inicial do celular via "Adicionar à tela inicial" no navegador.

## Licença

[MIT](LICENSE) © Felipe Sauer
