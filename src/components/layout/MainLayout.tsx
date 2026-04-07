import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { TOOLS, type ToolCategory } from '../../data/tools'
import {
  CATEGORY_ICON,
  CATEGORY_LABEL_CLEAN,
  Wheat,
  Home,
  Menu,
  X,
  ChevronRight,
} from '../icons'

const CATEGORY_ORDER: ToolCategory[] = [
  'agronomic',
  'operational',
  'financial',
  'grain',
  'tax',
  'utility',
  'lead-magnet',
]

/** Scroll to element after a navigation — uses double rAF to wait for React render. */
function scrollAfterNav(id: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Breadcrumb />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleCategoryClick = (cat: string) => {
    setMenuOpen(false)
    if (location.pathname === '/') {
      // Already on homepage — just scroll
      const el = document.getElementById(cat)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Navigate to homepage, then scroll after render
      navigate('/')
      scrollAfterNav(cat)
    }
  }

  return (
    <header className="bg-gradient-to-r from-agro-900 via-agro-800 to-agro-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-agro-600/80 flex items-center justify-center group-hover:bg-agro-500 transition-colors shrink-0">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">Agro SAK</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-agro-200 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
          {CATEGORY_ORDER.map((cat) => {
            const Icon = CATEGORY_ICON[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-agro-200 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                {CATEGORY_LABEL_CLEAN[cat]}
              </button>
            )
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-agro-600 bg-agro-800/95 backdrop-blur">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-agro-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <Home className="w-4 h-4" />
              Início
            </Link>
            {CATEGORY_ORDER.map((cat) => {
              const Icon = CATEGORY_ICON[cat]
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-agro-200 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                  {CATEGORY_LABEL_CLEAN[cat]}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const segments = location.pathname.split('/').filter(Boolean)

  // Only show on tool pages
  if (segments.length < 2 || segments[0] !== 'tools') return null

  const slug = segments[1]
  const tool = TOOLS.find((t) => t.slug === slug)
  if (!tool) return null

  const categoryLabel = CATEGORY_LABEL_CLEAN[tool.category]

  const handleCategoryClick = () => {
    navigate('/')
    scrollAfterNav(tool.category)
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-agro-700 transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <button type="button" onClick={handleCategoryClick} className="hover:text-agro-700 transition-colors cursor-pointer">
            {categoryLabel}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-agro-800 font-medium truncate">{tool.name}</span>
        </nav>
      </div>
    </div>
  )
}

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleCategoryClick = (cat: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(cat)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      scrollAfterNav(cat)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-agro-900 to-agro-950 text-white py-12 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div>
            <Link to="/" className="text-lg font-extrabold mb-3 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-agro-600 flex items-center justify-center">
                <Wheat className="w-4 h-4 text-white" />
              </div>
              Agro SAK
            </Link>
            <p className="text-sm text-agro-300 leading-relaxed mt-3">
              Ferramentas gratuitas para o agronegócio brasileiro. Calculadoras, simuladores e diagnósticos para produtores, agrônomos e técnicos.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-agro-300 mb-3">
              Categorias
            </h4>
            <ul className="space-y-1.5">
              {CATEGORY_ORDER.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <button type="button" onClick={() => handleCategoryClick(cat)} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {CATEGORY_LABEL_CLEAN[cat]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-agro-300 mb-3">
              Mais
            </h4>
            <ul className="space-y-1.5">
              {CATEGORY_ORDER.slice(4).map((cat) => (
                <li key={cat}>
                  <button type="button" onClick={() => handleCategoryClick(cat)} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {CATEGORY_LABEL_CLEAN[cat]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-agro-300 mb-3">
              Sobre
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cálculos de referência baseados em metodologias EMBRAPA, CONAB e ZARC. Consulte sempre um profissional para decisões importantes.
            </p>
          </div>
        </div>
        <div className="border-t border-agro-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Agro SAK — Todos os direitos reservados</p>
          <p className="text-xs text-gray-600">Feito com 💚 para o agro brasileiro</p>
        </div>
      </div>
    </footer>
  )
}
