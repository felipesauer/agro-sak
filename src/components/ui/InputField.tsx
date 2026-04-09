import { useState, useCallback, useId } from 'react'

// ── Brazilian number formatting helpers ──

function formatBrNumber(raw: string, decimals: number): string {
  if (!raw && raw !== '0') return ''
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function stripBrFormat(display: string): string {
  // Remove thousand separators (.) and convert ALL decimal commas to dots
  return display.replace(/\./g, '').replace(/,/g, '.')
}

interface InputFieldProps {
  label: string
  unit?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  step?: string
  min?: string
  max?: string
  required?: boolean
  hint?: string
  error?: string
  prefix?: string
  inputMode?: 'numeric' | 'decimal' | 'text'
  mask?: 'currency' | 'decimal'
}

export default function InputField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  type = 'number',
  step,
  min,
  max,
  required = false,
  hint,
  error,
  prefix,
  inputMode,
  mask,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  const autoId = useId()
  const inputId = `input-${autoId}`
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const isMasked = !!mask
  const decimals = mask === 'currency' ? 2 : 1
  const resolvedType = isMasked ? 'text' : type
  const resolvedInputMode = inputMode ?? (isMasked || type === 'number' ? 'decimal' : undefined)

  // Display value: formatted when not focused, raw when focused (for editing)
  const displayValue = isMasked && !focused
    ? formatBrNumber(String(value), decimals)
    : value

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isMasked) {
      // Accept digits, comma, dot, minus
      const cleaned = e.target.value.replace(/[^0-9.,-]/g, '')
      // Convert to raw number string for upstream
      const raw = stripBrFormat(cleaned)
      // Enforce min/max even for masked inputs
      const num = parseFloat(raw)
      if (!isNaN(num)) {
        if (min !== undefined && num < parseFloat(min)) return
        if (max !== undefined && num > parseFloat(max)) return
      }
      onChange(raw)
    } else {
      onChange(e.target.value)
    }
  }, [isMasked, onChange, min, max])

  const handleFocus = useCallback(() => setFocused(true), [])
  const handleBlur = useCallback(() => setFocused(false), [])

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {unit && <span className="text-gray-400 font-normal"> ({unit})</span>}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type={resolvedType}
          inputMode={resolvedInputMode}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          step={isMasked ? undefined : step}
          min={isMasked ? undefined : min}
          max={isMasked ? undefined : max}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          className={`w-full py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-agro-500/40 focus:border-agro-600 ${
            prefix ? 'pl-10 pr-3' : 'px-3'
          } ${
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500" role="alert">{error}</p>
      )}
    </div>
  )
}
