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
}: InputFieldProps) {
  const resolvedInputMode = inputMode ?? (type === 'number' ? 'decimal' : undefined)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
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
          type={type}
          inputMode={resolvedInputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
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
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
