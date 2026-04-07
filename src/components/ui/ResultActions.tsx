import { useState, useCallback, useRef, useEffect, type RefObject } from 'react'
import { Share2, Copy, Printer, Check, Link } from '../icons'

interface ResultActionsProps {
  title: string
  resultRef: RefObject<HTMLDivElement | null>
}

type CopiedState = 'idle' | 'link' | 'text'

function extractTextFromElement(el: HTMLElement | null): string {
  if (!el) return ''
  const lines: string[] = []
  const cards = el.querySelectorAll('[data-result-card]')
  if (cards.length > 0) {
    cards.forEach((card) => {
      const label = card.querySelector('[data-result-label]')?.textContent?.trim() ?? ''
      const value = card.querySelector('[data-result-value]')?.textContent?.trim() ?? ''
      if (label && value) lines.push(`${label}: ${value}`)
    })
  }

  // Also capture alert banners
  const alerts = el.querySelectorAll('[data-alert-banner]')
  alerts.forEach((alert) => {
    const text = alert.textContent?.trim()
    if (text) lines.push(`⚠ ${text}`)
  })

  // Capture comparison tables
  const tables = el.querySelectorAll('table')
  tables.forEach((table) => {
    const headers: string[] = []
    table.querySelectorAll('th').forEach((th) => {
      headers.push(th.textContent?.trim() ?? '')
    })
    if (headers.length > 0) lines.push(headers.join(' | '))

    table.querySelectorAll('tbody tr').forEach((tr) => {
      const cells: string[] = []
      tr.querySelectorAll('td').forEach((td) => {
        cells.push(td.textContent?.trim() ?? '')
      })
      if (cells.length > 0) lines.push(cells.join(' | '))
    })
  })

  // Fallback: if nothing captured via data attributes, get raw text
  if (lines.length === 0) {
    const raw = el.textContent?.trim()
    if (raw) lines.push(raw)
  }

  return lines.join('\n')
}

export default function ResultActions({ title, resultRef }: ResultActionsProps) {
  const [copied, setCopied] = useState<CopiedState>('idle')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareError, setShareError] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const currentUrl = window.location.href

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [])

  const setCopiedWithTimer = useCallback((state: CopiedState) => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    setCopied(state)
    copiedTimerRef.current = setTimeout(() => setCopied('idle'), 2000)
  }, [])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopiedWithTimer('link')
    } catch {
      // clipboard API unavailable — silently fail
    }
    setShowShareMenu(false)
  }, [currentUrl, setCopiedWithTimer])

  const handleCopyText = useCallback(async () => {
    if (!resultRef.current) return

    const text = `${title}\n${'─'.repeat(30)}\n${extractTextFromElement(resultRef.current)}\n\n🌱 Calculado em Agro SAK — ${currentUrl}`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedWithTimer('text')
    } catch {
      // clipboard API unavailable — silently fail
    }
  }, [title, resultRef, currentUrl, setCopiedWithTimer])

  const handleNativeShare = useCallback(async () => {
    if (!resultRef.current) return

    const text = extractTextFromElement(resultRef.current)

    try {
      await navigator.share({
        title: `${title} — Agro SAK`,
        text: `${title}\n${text}`,
        url: currentUrl,
      })
    } catch (err) {
      // Only show error if it wasn't a user cancellation
      if (err instanceof DOMException && err.name === 'AbortError') return
      setShareError(true)
      setTimeout(() => setShareError(false), 3000)
    }
    setShowShareMenu(false)
  }, [title, resultRef, currentUrl])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleShareClick = useCallback(() => {
    // On mobile with Web Share API, use it directly
    if (typeof navigator.share === 'function') {
      handleNativeShare()
    } else {
      setShowShareMenu((prev) => !prev)
    }
  }, [handleNativeShare])

  // Close share menu on outside click
  const handleBlur = useCallback(() => {
    const timer = setTimeout(() => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(document.activeElement)) {
        setShowShareMenu(false)
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center gap-1.5 print:hidden">
      {/* Share button */}
      <div className="relative" ref={shareMenuRef} onBlur={handleBlur}>
        <button
          type="button"
          onClick={handleShareClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-agro-700 hover:text-agro-900 hover:bg-agro-100 rounded-lg transition-all cursor-pointer"
          title="Compartilhar"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>

        {/* Desktop share dropdown */}
        {showShareMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-48 animate-scale-in">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Link className="w-4 h-4 text-gray-400" />
              Copiar link
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              Copiar resultado
            </button>
          </div>
        )}
      </div>

      {/* Copy result (direct button on desktop) */}
      <button
        type="button"
        onClick={handleCopyText}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-agro-700 hover:text-agro-900 hover:bg-agro-100 rounded-lg transition-all cursor-pointer"
        title="Copiar resultado"
      >
        {copied === 'text' ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline text-emerald-600">Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copiar</span>
          </>
        )}
      </button>

      {/* Print button */}
      <button
        type="button"
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-agro-700 hover:text-agro-900 hover:bg-agro-100 rounded-lg transition-all cursor-pointer"
        title="Imprimir resultado"
      >
        <Printer className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Imprimir</span>
      </button>

      {/* Copied link feedback */}
      {copied === 'link' && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          Link copiado!
        </span>
      )}

      {shareError && (
        <span className="flex items-center gap-1 text-xs text-red-600 font-medium animate-fade-in">
          Não foi possível compartilhar
        </span>
      )}
    </div>
  )
}
