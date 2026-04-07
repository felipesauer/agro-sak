# Agro SAK

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel&logoColor=white)](https://agro-sak.com.br)

**Agro SAK** é uma coleção de mais de 57 calculadoras gratuitas para o agronegócio brasileiro. O objetivo é simples: dar ao produtor rural, técnico agrícola e consultor acesso rápido a cálculos do dia a dia — sem precisar de planilha, cadastro ou internet (depois do primeiro acesso).

Tudo roda direto no navegador. Os dados ficam no dispositivo do usuário.

---

## Screenshots

| Home | Calculadora |
|---|---|
| ![Home](.github/screenshots/home.png) | ![Calculadora](.github/screenshots/tool.png) |

---

## Para quem é

- **Produtores rurais** que querem tomar decisões baseadas em números, não em chute.
- **Técnicos e consultores** que precisam de cálculos rápidos no campo.
- **Estudantes de agronomia** que querem entender as fórmulas na prática.

---

## O que você pode calcular

### 🌱 Agronômico
Calagem, adubação NPK, taxa de semeadura, exportação de nutrientes, espaçamento de plantio, janela de plantio, análise de solo, tratamento de sementes, gessagem, amostragem de solo, rotação de culturas, formulação de adubos.

### 🚜 Operacional
Calibração de pulverizador, capacidade operacional, perdas na colheita, estimativa de produtividade pré-colheita, consumo de combustível, custo de máquinas, depreciação, logística de transporte, custo de energia elétrica.

### 💰 Financeiro
Custo de produção, ponto de equilíbrio, precificação de venda, simulador de lucro da safra, fluxo de caixa, ROI agrícola, financiamento rural (Pronaf, Pronamp, Moderfrota), arrendamento rural, payback de investimento, seguro rural.

### 📦 Grãos e Armazenagem
Desconto por umidade e impureza, perda por secagem, custo de secagem, custo de armazenagem, viabilidade de armazenagem (vender agora ou guardar?), classificação de grãos, dimensionamento de silos.

### 📋 Tributário
Funrural, ITR, rentabilidade por cultura, impacto da Reforma Tributária (EC 132/2023).

### 🧰 Utilitários
Conversor de medidas agro (ha, alqueires, sacas, bushels), conversor de produtividade (sc/ha ↔ t/ha ↔ bushel/acre), tank mix, mistura de calda, volume de chuva, balanço hídrico.

### 🧠 Ferramentas Inteligentes
Diagnóstico de maturidade de gestão da fazenda, ROI de software de gestão, simulador de safra (heatmap preço × produtividade), comparador de culturas (soja × milho × algodão), calculadora de área por GPS, calculadora de irrigação, crédito de carbono rural.

---

## Como usar

Acesse **[agro-sak.com.br](https://agro-sak.com.br)** — não precisa instalar nada.

Para usar offline, adicione o site à tela inicial do celular (PWA). O app funciona sem conexão após o primeiro carregamento.

---

## Rodando Localmente

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # build de produção
npm run lint    # verificação de código
```

---

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

---

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

---

## Licença

[MIT](LICENSE)
