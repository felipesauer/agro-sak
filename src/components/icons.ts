import {
  Sprout,
  Tractor,
  DollarSign,
  Warehouse,
  FileText,
  Wrench,
  Brain,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Info,
  Calculator,
  Eraser,
  Home,
  Wheat,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Menu,
  X,
  Star,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Droplets,
  Thermometer,
  Scale,
  Fuel,
  Truck,
  CalendarDays,
  Settings,
  RefreshCw,
  Share2,
  Copy,
  Printer,
  Check,
  Link,
  type LucideIcon,
} from 'lucide-react'
import type { ToolCategory } from '../data/tools'

// ── Category icons ──

export const CATEGORY_ICON = {
  agronomic: Sprout,
  operational: Tractor,
  financial: DollarSign,
  grain: Warehouse,
  tax: FileText,
  utility: Wrench,
  'lead-magnet': Brain,
} satisfies Record<ToolCategory, LucideIcon>

// ── Category labels (clean, no emojis) ──

export const CATEGORY_LABEL_CLEAN = {
  agronomic: 'Agronômicas',
  operational: 'Operacional',
  financial: 'Financeiro',
  grain: 'Grãos e Armazenagem',
  tax: 'Tributário',
  utility: 'Utilitários',
  'lead-magnet': 'Inteligente',
} satisfies Record<ToolCategory, string>

// ── Category gradient colors ──

export const CATEGORY_GRADIENT = {
  agronomic: 'from-emerald-500 to-green-600',
  operational: 'from-amber-500 to-orange-600',
  financial: 'from-blue-500 to-indigo-600',
  grain: 'from-yellow-600 to-amber-700',
  tax: 'from-violet-500 to-purple-600',
  utility: 'from-slate-500 to-gray-600',
  'lead-magnet': 'from-rose-500 to-pink-600',
} satisfies Record<ToolCategory, string>

// ── Category solid colors for borders/accents ──

export const CATEGORY_COLOR = {
  agronomic: 'text-emerald-600',
  operational: 'text-amber-600',
  financial: 'text-blue-600',
  grain: 'text-yellow-700',
  tax: 'text-violet-600',
  utility: 'text-slate-600',
  'lead-magnet': 'text-rose-600',
} satisfies Record<ToolCategory, string>

export const CATEGORY_BG_LIGHT = {
  agronomic: 'bg-emerald-50',
  operational: 'bg-amber-50',
  financial: 'bg-blue-50',
  grain: 'bg-yellow-50',
  tax: 'bg-violet-50',
  utility: 'bg-slate-50',
  'lead-magnet': 'bg-rose-50',
} satisfies Record<ToolCategory, string>

// ── Alert icons ──

export const ALERT_ICON = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
} as const

// ── Re-exports for convenience ──

export {
  Sprout,
  Tractor,
  DollarSign,
  Warehouse,
  FileText,
  Wrench,
  Brain,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Info,
  Calculator,
  Eraser,
  Home,
  Wheat,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Menu,
  X,
  Star,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Droplets,
  Thermometer,
  Scale,
  Fuel,
  Truck,
  CalendarDays,
  Settings,
  RefreshCw,
  Share2,
  Copy,
  Printer,
  Check,
  Link,
}
