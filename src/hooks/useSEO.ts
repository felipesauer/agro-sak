import { useEffect } from 'react'

const SITE_NAME = 'Agro SAK'
const DEFAULT_DESCRIPTION =
  'Ferramentas gratuitas para o agronegócio brasileiro — calculadoras agronômicas, financeiras e operacionais'

interface SEOOptions {
  title: string
  description?: string
}

export function useSEO({ title, description }: SEOOptions) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`
    document.title = fullTitle

    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', description || DEFAULT_DESCRIPTION)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', fullTitle)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description || DEFAULT_DESCRIPTION)

    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.setAttribute('content', fullTitle)

    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      document.title = `${SITE_NAME} — Ferramentas Gratuitas para o Agronegócio`
      if (metaDesc) metaDesc.setAttribute('content', DEFAULT_DESCRIPTION)
    }
  }, [title, description])
}
