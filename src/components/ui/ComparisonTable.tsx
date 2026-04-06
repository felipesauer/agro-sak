interface Column<T> {
  key: keyof T
  label: string
  unit?: string
  format?: (value: T[keyof T]) => string
}

interface ComparisonTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  highlightIndex?: number
}

export default function ComparisonTable<T extends Record<string, unknown>>({
  columns,
  rows,
  highlightIndex,
}: ComparisonTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left py-2 px-3 font-medium text-gray-600"
              >
                {col.label}
                {col.unit && (
                  <span className="text-gray-400 font-normal"> ({col.unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-100 ${
                i === highlightIndex ? 'bg-agro-50 font-medium' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="py-2 px-3">
                  {col.format
                    ? col.format(row[col.key])
                    : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
