import type { ReactNode } from 'react'

interface ResultCardProps {
  label: string
  value: string | number
  unit?: string
  prefix?: string
  highlight?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children?: ReactNode
}

const VARIANT_STYLES = {
  default: 'bg-gray-50 border-gray-200',
  success: 'bg-emerald-50 border-emerald-300',
  warning: 'bg-amber-50 border-amber-300',
  danger: 'bg-red-50 border-red-300',
}

const VALUE_COLORS = {
  default: 'text-gray-800',
  success: 'text-emerald-800',
  warning: 'text-amber-800',
  danger: 'text-red-800',
}

export default function ResultCard({
  label,
  value,
  unit,
  prefix,
  highlight = false,
  variant = 'default',
  children,
}: ResultCardProps) {
  const bgStyle = highlight
    ? 'bg-gradient-to-br from-agro-50 to-emerald-50 border-agro-300 shadow-sm'
    : `${VARIANT_STYLES[variant]} border`
  const valueColor = highlight ? 'text-agro-800' : VALUE_COLORS[variant]

  return (
    <div className={`rounded-xl p-4 ${bgStyle} animate-slide-up`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold ${valueColor} break-words`}>
        {prefix && (
          <span className="text-sm font-normal text-gray-500 mr-1">{prefix}</span>
        )}
        {value}
        {unit && (
          <span className="text-sm font-normal text-gray-500 ml-1">
            {unit}
          </span>
        )}
      </p>
      {children}
    </div>
  )
}
