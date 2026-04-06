import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS, type ToolCategory } from '../data/tools'
import {
  CATEGORY_ICON,
  CATEGORY_LABEL_CLEAN,
  CATEGORY_GRADIENT,
  Search,
  ArrowRight,
  Star,
  Wheat,
} from '../components/icons'

const CATEGORY_ORDER: ToolCategory[] = [
  'agronomic',
  'operational',
  'financial',
  'grain',
  'tax',
  'utility',
  'lead-magnet',
]

const PRIORITY_ORDER: Record<string, number> = {
  gold: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  gold: { label: 'Destaque', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  high: { label: 'Alta', className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Média', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  low: { label: 'Baixa', className: 'bg-gray-50 text-gray-600 border-gray-200' },
}

export default function HomePage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : null

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL_CLEAN[cat],
    tools: TOOLS.filter((t) => t.category === cat).sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 3
      const pb = PRIORITY_ORDER[b.priority] ?? 3
      return pa !== pb ? pa - pb : a.id - b.id
    }),
  })).filter((g) => g.tools.length > 0)

  const totalReady = TOOLS.filter((t) => t.ready).length

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-agro-800 via-agro-700 to-emerald-700 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Wheat className="w-8 h-8 sm:w-10 sm:h-10 text-agro-300" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Ferramentas para o Agronegócio
            </h1>
          </div>
          <p className="text-lg md:text-xl text-agro-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            {totalReady} calculadoras agronômicas, financeiras e operacionais.
            <br className="hidden sm:block" />
            100% gratuitas, sem cadastro, direto no navegador.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ferramenta... ex: Funrural, NPK, irrigação"
              className="w-full px-5 py-3.5 pl-12 rounded-2xl text-gray-800 bg-white shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-gray-400"
            />
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-10 mt-8 text-sm text-agro-200">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">{totalReady}</span>
              <span>ferramentas</span>
            </div>
            <div className="w-px h-5 bg-agro-500" />
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">7</span>
              <span>categorias</span>
            </div>
            <div className="w-px h-5 bg-agro-500" />
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">100%</span>
              <span>gratuito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search results */}
      {filtered && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {filtered.length} resultado{filtered.length !== 1 && 's'} para &quot;{search}&quot;
          </h2>
          {filtered.length === 0 ? (
            <p className="text-gray-500">Nenhuma ferramenta encontrada. Tente outro termo.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Category quick nav */}
      {!filtered && (
        <section className="max-w-5xl mx-auto px-4 -mt-7 relative z-10">
          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">
            {grouped.map(({ category, label, tools }) => {
              const Icon = CATEGORY_ICON[category]
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(category)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-3.5 text-center group cursor-pointer"
                >
                  <div className={`w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENT[category]} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">
                    {label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tools.length} ferramentas</p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      {!filtered && (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
          {grouped.map(({ category, label, tools }) => {
            const Icon = CATEGORY_ICON[category]
            return (
              <section key={category} id={category} className="scroll-mt-16">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_GRADIENT[category]} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{label}</h2>
                    <p className="text-xs text-gray-400">{tools.length} ferramentas disponíveis</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const badge = PRIORITY_BADGE[tool.priority]
  const gradient = CATEGORY_GRADIENT[tool.category]

  if (!tool.ready) {
    return (
      <div className="border border-gray-200 bg-gray-50 rounded-2xl p-4 opacity-60">
        <p className="font-semibold text-gray-600 text-sm">{tool.name}</p>
        <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
        <span className="inline-block mt-2 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          Em breve
        </span>
      </div>
    )
  }

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative border border-gray-200 bg-white hover:border-agro-300 hover:shadow-lg hover:-translate-y-0.5 rounded-2xl p-4 transition-all duration-200 block overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-800 text-sm group-hover:text-agro-700 transition-colors leading-snug">
          {tool.name}
        </p>
        {badge && tool.priority !== 'low' && (
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
            {tool.priority === 'gold' && <Star className="w-3 h-3" />}
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{tool.description}</p>
      <div className="flex items-center gap-1 mt-3 text-xs text-agro-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        Abrir ferramenta <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  )
}
