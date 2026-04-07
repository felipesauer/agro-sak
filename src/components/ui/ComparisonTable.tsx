import type { ReactNode } from 'react'

interface Column<T> {
  key: keyof T
  label: string
  unit?: string
  format?: (value: T[keyof T], row?: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  cellClassName?: (value: T[keyof T], row?: T) => string
}

interface ComparisonTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  highlightIndex?: number
  rowKey?: keyof T
  rowClassName?: (row: T, index: number) => string
  colSpanRow?: (row: T, index: number) => ReactNode | null
  'aria-label'?: string
}

const ALIGN_CLASS = { left: 'text-left', center: 'text-center', right: 'text-right' }

export default function ComparisonTable<T extends Record<string, unknown>>({
  columns,
  rows,
  highlightIndex,
  rowKey,
  rowClassName,
  colSpanRow,
  'aria-label': ariaLabel,
}: ComparisonTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className={`py-2 px-3 font-medium text-gray-600 ${ALIGN_CLASS[col.align ?? 'left']}`}
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
          {rows.map((row, i) => {
            const span = colSpanRow ? colSpanRow(row, i) : null
            if (span !== null && span !== undefined) {
              return (
                <tr
                  key={rowKey ? String(row[rowKey]) : `span-${i}`}
                  className="border-b border-gray-100"
                >
                  <td colSpan={columns.length} className="py-2 px-3 text-center">
                    {span}
                  </td>
                </tr>
              )
            }
            const highlight = i === highlightIndex ? 'bg-agro-50 font-medium' : ''
            const custom = rowClassName ? rowClassName(row, i) : ''
            return (
              <tr
                key={rowKey ? String(row[rowKey]) : String(columns[0] ? row[columns[0].key] : i)}
                className={`border-b border-gray-100 ${highlight} ${custom}`}
              >
                {columns.map((col) => {
                  const val = row[col.key]
                  const cellCls = col.cellClassName ? col.cellClassName(val, row) : ''
                  return (
                    <td
                      key={String(col.key)}
                      className={`py-2 px-3 ${ALIGN_CLASS[col.align ?? 'left']} ${cellCls}`}
                    >
                      {col.format ? col.format(val, row) : String(val ?? '')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
