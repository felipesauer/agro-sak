// ── Carbon Credit ──

import { CARBON_SEQUESTRATION } from '../../data/carbon'

export interface CarbonCreditInput {
    areaHa: number
    cropSystem: string
    noTill: boolean
    coverCrop: boolean
    ilpf: boolean
    years: number
    carbonPrice: number
}

export interface CarbonCreditResult {
    annualSequestration: number
    totalSequestration: number
    annualRevenue: number
    totalRevenue: number
    revenuePerHa: number
    practices: { name: string; contribution: number }[]
    equivalentTrees: number
}

const CO2_PER_TREE_YEAR = 0.022

export function calculateCarbonCredit(input: CarbonCreditInput): CarbonCreditResult | null {
    const { areaHa, cropSystem, noTill, coverCrop, ilpf, years, carbonPrice } = input
    if (areaHa <= 0 || years <= 0 || carbonPrice <= 0) return null

    const baseRate = CARBON_SEQUESTRATION[cropSystem] ?? CARBON_SEQUESTRATION.soybean_corn

    const practices: { name: string; contribution: number }[] = []
    let totalRate = baseRate

    practices.push({ name: 'Sistema de cultivo', contribution: baseRate * areaHa })

    if (noTill) {
        const bonus = 0.5
        totalRate += bonus
        practices.push({ name: 'Plantio direto (SPD)', contribution: bonus * areaHa })
    }

    if (coverCrop) {
        const bonus = 0.3
        totalRate += bonus
        practices.push({ name: 'Planta de cobertura', contribution: bonus * areaHa })
    }

    if (ilpf) {
        const bonus = 1.2
        totalRate += bonus
        practices.push({ name: 'ILPF / SAF', contribution: bonus * areaHa })
    }

    const annualSequestration = totalRate * areaHa
    const totalSequestration = annualSequestration * years
    const annualRevenue = annualSequestration * carbonPrice
    const totalRevenue = totalSequestration * carbonPrice
    const revenuePerHa = totalRate * carbonPrice
    const equivalentTrees = Math.round(annualSequestration / CO2_PER_TREE_YEAR)

    return {
        annualSequestration,
        totalSequestration,
        annualRevenue,
        totalRevenue,
        revenuePerHa,
        practices,
        equivalentTrees,
    }
}

export function validateCarbonCredit(input: CarbonCreditInput): string | null {
    if (!input.areaHa || input.areaHa <= 0) return 'A área deve ser maior que zero'
    if (input.areaHa > 100_000) return 'Área muito grande — verifique o valor'
    if (!input.years || input.years < 1 || input.years > 50) return 'O prazo deve ser entre 1 e 50 anos'
    if (!input.carbonPrice || input.carbonPrice <= 0) return 'Informe o preço do crédito de carbono'
    return null
}
