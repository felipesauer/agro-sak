import { useId } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
  hint?: string
  placeholder?: string
  icon?: string
  id?: string
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  hint,
  placeholder = 'Selecione...',
  icon,
  id: selectId,
}: SelectFieldProps) {
  const autoId = useId()
  const resolvedId = selectId || `select-${autoId}`
  const hintId = hint ? `${resolvedId}-hint` : undefined
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={resolvedId}>
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          id={resolvedId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-xl text-sm bg-white hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-agro-500/40 focus:border-agro-600 appearance-none cursor-pointer"
          aria-describedby={hintId}
          aria-required={required || undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
}
