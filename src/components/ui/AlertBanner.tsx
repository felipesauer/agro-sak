import { ALERT_ICON } from '../icons'

type AlertVariant = 'info' | 'warning' | 'error' | 'success'

interface AlertBannerProps {
  variant?: AlertVariant
  message: string
  title?: string
}

const styles: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-agro-50 border-agro-200 text-agro-800',
}

const iconColors: Record<AlertVariant, string> = {
  info: 'text-blue-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
  success: 'text-agro-600',
}

export default function AlertBanner({
  variant = 'info',
  message,
  title,
}: AlertBannerProps) {
  const Icon = ALERT_ICON[variant]

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${styles[variant]}`} data-alert-banner>
      <Icon className={`mt-0.5 shrink-0 w-4 h-4 ${iconColors[variant]}`} />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{message}</p>
      </div>
    </div>
  )
}
