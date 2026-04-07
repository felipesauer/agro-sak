import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronRight, Info, BookOpen, BarChart3 } from 'lucide-react'
import { useSEO } from '../../hooks/useSEO'
import ResultActions from '../ui/ResultActions'

interface CalculatorLayoutProps {
  title: string
  description: string
  children: ReactNode
  result?: ReactNode
  about?: string
  methodology?: string
}

export default function CalculatorLayout({
  title,
  description,
  children,
  result,
  about,
  methodology,
}: CalculatorLayoutProps) {
  const [showInfo, setShowInfo] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const prevResult = useRef<ReactNode>(null)
  useSEO({ title, description })

  // Auto-scroll to result when it first appears
  useEffect(() => {
    if (result && !prevResult.current && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevResult.current = result
  }, [result])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Print-only header */}
      <div className="hidden print:block print-header">
        🌱 Agro SAK — {title}
      </div>

      {/* Title */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-agro-800 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{description}</p>
      </div>

      {/* Calculator form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-4 shadow-sm space-y-4 animate-slide-up print:hidden">
        {children}
      </div>

      {/* Result */}
      {result && (
        <div
          ref={resultRef}
          id="calculator-result"
          className="bg-gradient-to-br from-agro-50 via-emerald-50 to-green-50 border border-agro-200 rounded-2xl p-6 shadow-sm mb-4 animate-scale-in print:shadow-none print:border-gray-300 print:rounded-none print:p-4"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-agro-600 flex items-center justify-center print:hidden">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-agro-800 uppercase tracking-wide">Resultado</h2>
            </div>
            <ResultActions title={title} resultRef={resultRef} />
          </div>
          {result}
        </div>
      )}

      {/* About section */}
      {(about || methodology) && (
        <div className="mt-6 print:hidden">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-sm font-medium text-agro-700 hover:text-agro-900 transition-colors cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${showInfo ? 'bg-agro-600 border-agro-600' : 'border-agro-400'}`}>
              <ChevronRight
                className={`w-3 h-3 transition-transform ${showInfo ? 'rotate-90 text-white' : 'text-agro-500'}`}
              />
            </div>
            Sobre esta ferramenta
          </button>
          {showInfo && (
            <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-5 md:p-6 space-y-4 text-sm text-gray-600 leading-relaxed shadow-sm animate-slide-up">
              {about && (
                <div>
                  <h3 className="flex items-center gap-1.5 font-bold text-gray-800 mb-1.5">
                    <Info className="w-4 h-4 text-agro-600" /> O que é
                  </h3>
                  <p>{about}</p>
                </div>
              )}
              {methodology && (
                <div>
                  <h3 className="flex items-center gap-1.5 font-bold text-gray-800 mb-1.5">
                    <BookOpen className="w-4 h-4 text-agro-600" /> Metodologia
                  </h3>
                  <p>{methodology}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Print-only footer */}
      <div className="hidden print:block print-footer">
        Calculado em agrosak.com.br — {new Date().toLocaleDateString('pt-BR')} — Resultados para fins de referência
      </div>
    </div>
  )
}
