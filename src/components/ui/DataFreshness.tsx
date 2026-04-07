import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { RefreshCw } from 'lucide-react'
import { forceSync } from '../../db/sync'
import { useState } from 'react'

interface Props {
  table: string
  label?: string
}

export default function DataFreshness({ table, label }: Props) {
  const [syncing, setSyncing] = useState(false)
  const meta = useLiveQuery(() => db.syncMeta.where('table').equals(table).first(), [table])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await forceSync(table)
    } finally {
      setSyncing(false)
    }
  }

  if (!meta?.lastSyncAt) return null

  const isSeed = meta.status === 'seed'
  const lastSync = new Date(meta.lastSyncAt)
  const elapsed = Date.now() - lastSync.getTime()
  const hours = Math.floor(elapsed / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  const timeStr = isSeed
    ? 'referência'
    : days > 0 ? `${days}d atrás` : hours > 0 ? `${hours}h atrás` : 'agora'

  const isStale = !isSeed && elapsed > 7 * 24 * 60 * 60 * 1000 // 7 days
  const dotColor = isSeed ? 'bg-gray-300' : isStale ? 'bg-yellow-400' : 'bg-green-400'

  return (
    <div className="flex items-center gap-2 text-[11px] text-gray-400">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label ?? 'Dados'}: {timeStr}</span>
      {!isSeed && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="text-gray-400 hover:text-agro-600 transition-colors disabled:opacity-50"
          title="Atualizar dados"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  )
}
