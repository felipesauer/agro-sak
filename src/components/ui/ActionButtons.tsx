import { Calculator, Eraser } from '../icons'

interface ActionButtonsProps {
  onCalculate: () => void
  onClear: () => void
  calculateLabel?: string
  clearLabel?: string
  disabled?: boolean
}

export default function ActionButtons({
  onCalculate,
  onClear,
  calculateLabel = 'Calcular',
  clearLabel = 'Limpar',
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        type="button"
        onClick={onCalculate}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-agro-700 to-agro-600 hover:from-agro-800 hover:to-agro-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agro-500 focus-visible:ring-offset-2"
      >
        <Calculator className="w-4 h-4" aria-hidden="true" />
        {calculateLabel}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agro-500 focus-visible:ring-offset-2"
      >
        <Eraser className="w-4 h-4" aria-hidden="true" />
        {clearLabel}
      </button>
    </div>
  )
}
