import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'

// Lazy-loaded tools for code-splitting
const UnitConverter = lazy(() => import('./tools/utilities/UnitConverter'))
const YieldConverter = lazy(() => import('./tools/utilities/YieldConverter'))
const MoistureDiscount = lazy(() => import('./tools/grain/MoistureDiscount'))
const DryingLoss = lazy(() => import('./tools/grain/DryingLoss'))
const TankMix = lazy(() => import('./tools/utilities/TankMix'))
const SprayMix = lazy(() => import('./tools/utilities/SprayMix'))
const SeedingRate = lazy(() => import('./tools/agronomic/SeedingRate'))
const LimingCalculator = lazy(() => import('./tools/agronomic/LimingCalculator'))
const NpkFertilization = lazy(() => import('./tools/agronomic/NpkFertilization'))
const NutrientRemoval = lazy(() => import('./tools/agronomic/NutrientRemoval'))
const NpkFormulaComparer = lazy(() => import('./tools/agronomic/NpkFormulaComparer'))
const PlantSpacing = lazy(() => import('./tools/agronomic/PlantSpacing'))
const PreHarvestYield = lazy(() => import('./tools/operational/PreHarvestYield'))
const HarvestLoss = lazy(() => import('./tools/operational/HarvestLoss'))
const SprayerCalibration = lazy(() => import('./tools/operational/SprayerCalibration'))
const OperationalCapacity = lazy(() => import('./tools/operational/OperationalCapacity'))
const FuelConsumption = lazy(() => import('./tools/operational/FuelConsumption'))
const ProductionCost = lazy(() => import('./tools/financial/ProductionCost'))
const BreakEven = lazy(() => import('./tools/financial/BreakEven'))
const SalePricing = lazy(() => import('./tools/financial/SalePricing'))
const Funrural = lazy(() => import('./tools/tax/Funrural'))
const CropProfitSimulator = lazy(() => import('./tools/financial/CropProfitSimulator'))
const RuralFinancing = lazy(() => import('./tools/financial/RuralFinancing'))
const FarmLease = lazy(() => import('./tools/financial/FarmLease'))
const CashFlow = lazy(() => import('./tools/financial/CashFlow'))
const FarmROI = lazy(() => import('./tools/financial/FarmROI'))
const MachineryCost = lazy(() => import('./tools/operational/MachineryCost'))
const MachineDepreciation = lazy(() => import('./tools/operational/MachineDepreciation'))
const GrainFreight = lazy(() => import('./tools/operational/GrainFreight'))
const StorageViability = lazy(() => import('./tools/grain/StorageViability'))
const StorageCost = lazy(() => import('./tools/grain/StorageCost'))
const TaxReform = lazy(() => import('./tools/tax/TaxReform'))
const ItrCalculator = lazy(() => import('./tools/tax/ItrCalculator'))
const CropProfitability = lazy(() => import('./tools/tax/CropProfitability'))
const PlantingWindow = lazy(() => import('./tools/agronomic/PlantingWindow'))
const FarmDiagnostics = lazy(() => import('./tools/lead-magnets/FarmDiagnostics'))
const SoftwareROI = lazy(() => import('./tools/lead-magnets/SoftwareROI'))
const CropSimulator = lazy(() => import('./tools/lead-magnets/CropSimulator'))
const FieldCostRanking = lazy(() => import('./tools/financial/FieldCostRanking'))
const Irrigation = lazy(() => import('./tools/lead-magnets/Irrigation'))
const GpsArea = lazy(() => import('./tools/lead-magnets/GpsArea'))
const CropComparer = lazy(() => import('./tools/lead-magnets/CropComparer'))
const WaterBalance = lazy(() => import('./tools/utilities/WaterBalance'))

function LazyFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-8 h-8 border-3 border-agro-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-500">Carregando ferramenta...</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/*" element={
          <Suspense fallback={<LazyFallback />}>
            <ToolRoutes />
          </Suspense>
        } />
      </Route>
    </Routes>
  )
}

function ToolRoutes() {
  return (
    <Routes>
      <Route path="unit-converter" element={<UnitConverter />} />
      <Route path="yield-converter" element={<YieldConverter />} />
      <Route path="moisture-discount" element={<MoistureDiscount />} />
      <Route path="drying-loss" element={<DryingLoss />} />
      <Route path="tank-mix" element={<TankMix />} />
      <Route path="spray-mix" element={<SprayMix />} />
      <Route path="seeding-rate" element={<SeedingRate />} />
      <Route path="liming" element={<LimingCalculator />} />
      <Route path="npk-fertilization" element={<NpkFertilization />} />
      <Route path="nutrient-removal" element={<NutrientRemoval />} />
      <Route path="npk-formula-comparer" element={<NpkFormulaComparer />} />
      <Route path="plant-spacing" element={<PlantSpacing />} />
      <Route path="pre-harvest-yield" element={<PreHarvestYield />} />
      <Route path="harvest-loss" element={<HarvestLoss />} />
      <Route path="sprayer-calibration" element={<SprayerCalibration />} />
      <Route path="operational-capacity" element={<OperationalCapacity />} />
      <Route path="fuel-consumption" element={<FuelConsumption />} />
      <Route path="production-cost" element={<ProductionCost />} />
      <Route path="break-even" element={<BreakEven />} />
      <Route path="sale-pricing" element={<SalePricing />} />
      <Route path="funrural" element={<Funrural />} />
      <Route path="crop-profit-simulator" element={<CropProfitSimulator />} />
      <Route path="rural-financing" element={<RuralFinancing />} />
      <Route path="farm-lease" element={<FarmLease />} />
      <Route path="cash-flow" element={<CashFlow />} />
      <Route path="farm-roi" element={<FarmROI />} />
      <Route path="machinery-cost" element={<MachineryCost />} />
      <Route path="machine-depreciation" element={<MachineDepreciation />} />
      <Route path="grain-freight" element={<GrainFreight />} />
      <Route path="storage-viability" element={<StorageViability />} />
      <Route path="storage-cost" element={<StorageCost />} />
      <Route path="tax-reform" element={<TaxReform />} />
      <Route path="itr" element={<ItrCalculator />} />
      <Route path="crop-profitability" element={<CropProfitability />} />
      <Route path="planting-window" element={<PlantingWindow />} />
      <Route path="farm-diagnostics" element={<FarmDiagnostics />} />
      <Route path="software-roi" element={<SoftwareROI />} />
      <Route path="crop-simulator" element={<CropSimulator />} />
      <Route path="field-cost-ranking" element={<FieldCostRanking />} />
      <Route path="irrigation" element={<Irrigation />} />
      <Route path="gps-area" element={<GpsArea />} />
      <Route path="crop-comparer" element={<CropComparer />} />
      <Route path="water-balance" element={<WaterBalance />} />
    </Routes>
  )
}
