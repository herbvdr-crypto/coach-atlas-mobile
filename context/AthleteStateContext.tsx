import { useAuth } from '@clerk/expo'
import { useFocusEffect } from 'expo-router'
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

  // Deliberately NOT depending on `getToken` here. Clerk does not guarantee
  // that reference stays identical across renders — if it changes, this
  // callback's identity changes too, which re-triggers the effect below,
  // which calls setLoading/setState, which re-renders, which can produce a
  // new getToken reference again — an infinite fetch loop that shows up as
  // the screen rapidly flashing between spinner and content. `getToken`
  // still works correctly when called inside refresh() regardless of which
  // render's closure created this function, since it always reads Clerk's
  // live current session state at call time, not render-time state.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

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

// Call this from any tab/screen to refetch athlete state every time that
// screen comes into focus — e.g. tapping into the KPIs tab, or navigating
// back to it. Without this, data only ever loads once at app launch, so a
// manual DB edit (or anything changed elsewhere) won't show up until the
// app is fully restarted.
export function useRefreshOnFocus() {
  const { refresh } = useAthleteState()
  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )
}