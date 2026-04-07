# Agro SAK

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel&logoColor=white)](https://agro-sak.com.br)

Ferramentas gratuitas de cálculo para o agronegócio brasileiro — direto no navegador, sem cadastro.

## Screenshots

| Home | Calculadora |
|---|---|
| ![Home](.github/screenshots/home.png) | ![Calculadora](.github/screenshots/tool.png) |

## Ferramentas

| Categoria | Exemplos |
|---|---|
| 🌱 Agronômicas | Calagem, Adubação NPK, Taxa de Semeadura, Análise de Solo |
| 🚜 Operacional | Calibração de Pulverizador, Perdas na Colheita, Custo por Máquina |
| 💰 Financeiro | Custo de Produção, Simulador de Lucro, Financiamento Rural |
| 📦 Grãos | Desconto por Umidade, Perda por Secagem, Viabilidade de Armazenagem |
| 📋 Tributário | Funrural, ITR, Reforma Tributária (EC 132/2023) |
| 🧰 Utilitários | Conversor de Medidas Agro, Tank Mix, Volume de Chuva |
| 🧠 Inteligente | Diagnóstico de Gestão, Simulador de Safra, Comparador de Culturas |

57+ calculadoras no total.

## Stack

- **React 19** + **TypeScript**
- **Vite** (build e dev server)
- **Tailwind CSS v4**
- **Dexie** (IndexedDB — histórico local de cálculos)
- **React Router v7**
- Deploy via **Vercel** (incluindo proxies serverless para BCB e CEPEA)

## Rodando Localmente

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`.

```bash
npm run build   # build de produção
npm run lint    # verificação de código
```

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE)
