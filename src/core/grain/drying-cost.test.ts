import { describe, it, expect } from 'vitest'
import { calculateDryingCost, validateDryingCost } from './drying-cost'
import type { EnergySource } from './drying-cost'

const firewood: EnergySource = {
    label: 'Lenha',
    unit: 'm³',
    kcalPerUnit: 2_400_000,
    efficiency: 0.55,
    pricePerUnit: 120,
}

describe('calculateDryingCost', () => {
    const base = {
        grainWeightTons: 100,
        initialMoisture: 20,
        targetMoisture: 14,
        energySource: firewood,
        dryerThroughput: 20,
        thirdPartyCostPerBag: 4,
        kcalPerKgWater: 700,
    }

    it('calcula água removida', () => {
        const r = calculateDryingCost(base)
        // water = 100000 * (20-14)/(100-14) = 100000 * 6/86 ≈ 6976.7 kg
        expect(r.waterToRemoveKg).toBeCloseTo(6976.7, 0)
    })

    it('calcula energia e combustível', () => {
        const r = calculateDryingCost(base)
        const expectedEnergy = r.waterToRemoveKg * 700
        expect(r.energyRequiredKcal).toBeCloseTo(expectedEnergy, 0)
        const expectedFuel = expectedEnergy / (2_400_000 * 0.55)
        expect(r.fuelConsumed).toBeCloseTo(expectedFuel, 1)
    })

    it('calcula custo por tonelada e por saca', () => {
        const r = calculateDryingCost(base)
        expect(r.energyCostPerTon).toBeCloseTo(r.energyCost / 100, 2)
        expect(r.energyCostPerBag).toBeCloseTo(r.energyCostPerTon * 0.06, 4)
    })

    it('calcula tempo de secagem', () => {
        const r = calculateDryingCost(base)
        expect(r.dryingTimeHours).toBeCloseTo(5, 1) // 100t / 20t/h
    })

    it('compara com terceiro', () => {
        const r = calculateDryingCost(base)
        const totalBags = 100000 / 60
        expect(r.thirdPartyCostTotal).toBeCloseTo(totalBags * 4, 0)
    })

    it('aceita override de preço de energia', () => {
        const r1 = calculateDryingCost(base)
        const r2 = calculateDryingCost({ ...base, energyPriceOverride: 200 })
        expect(r2.energyCost).toBeGreaterThan(r1.energyCost)
    })

    it('retorna fuelUnit do source', () => {
        const r = calculateDryingCost(base)
        expect(r.fuelUnit).toBe('m³')
    })
})

describe('validateDryingCost', () => {
    it('rejeita peso zero', () => {
        expect(validateDryingCost({ grainWeightTons: 0, initialMoisture: 20, targetMoisture: 14 })).toBeTruthy()
    })

    it('rejeita umidade inicial <= final', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 14, targetMoisture: 14 })).toBeTruthy()
    })

    it('aceita inputs válidos', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 20, targetMoisture: 14 })).toBeNull()
    })

    it('rejeita umidade inicial > 50', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 55, targetMoisture: 14 })).toBeTruthy()
    })

    it('rejeita umidade final > 50', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 20, targetMoisture: 55 })).toBeTruthy()
    })

    it('rejeita umidade inicial zero', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 0, targetMoisture: 14 })).toBeTruthy()
    })

    it('rejeita umidade inicial NaN', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: NaN, targetMoisture: 14 })).toBeTruthy()
    })

    it('rejeita umidade final NaN', () => {
        expect(validateDryingCost({ grainWeightTons: 100, initialMoisture: 20, targetMoisture: NaN })).toBeTruthy()
    })
})

describe('branch: zero denominators in calc', () => {
    const firewood: EnergySource = { label: 'Lenha', unit: 'm³', kcalPerUnit: 2_400_000, efficiency: 0.55, pricePerUnit: 120 }

    it('energyCostPerTon and thirdPartyCostPerTon are 0 when grainWeightTons is 0', () => {
        const r = calculateDryingCost({
            grainWeightTons: 0, initialMoisture: 20, targetMoisture: 14,
            energySource: firewood, dryerThroughput: 20, thirdPartyCostPerBag: 4, kcalPerKgWater: 700,
        })
        expect(r.energyCostPerTon).toBe(0)
        expect(r.thirdPartyCostPerTon).toBe(0)
    })

    it('dryingTimeHours is 0 when dryerThroughput is 0', () => {
        const r = calculateDryingCost({
            grainWeightTons: 100, initialMoisture: 20, targetMoisture: 14,
            energySource: firewood, dryerThroughput: 0, thirdPartyCostPerBag: 4, kcalPerKgWater: 700,
        })
        expect(r.dryingTimeHours).toBe(0)
    })
})
