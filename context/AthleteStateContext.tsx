import { useAuth } from '@clerk/expo'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchAthleteState } from '@/lib/api'
import type { AthleteState } from '@/lib/types'

interface AthleteStateContextValue {
  state: AthleteState | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  unresolvedConcernCount: number
}

const AthleteStateContext = createContext<AthleteStateContextValue | null>(null)

export function AthleteStateProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth()
  const [state, setState] = useState<AthleteState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSignedIn) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAthleteState(() => getToken())
      setState(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load athlete state')
    } finally {
      setLoading(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  const unresolvedConcernCount = state?.concerns.filter((c) => !c.isResolved).length ?? 0

  return (
    <AthleteStateContext.Provider value={{ state, loading, error, refresh, unresolvedConcernCount }}>
      {children}
    </AthleteStateContext.Provider>
  )
}

export function useAthleteState() {
  const ctx = useContext(AthleteStateContext)
  if (!ctx) throw new Error('useAthleteState must be used inside AthleteStateProvider')
  return ctx
}