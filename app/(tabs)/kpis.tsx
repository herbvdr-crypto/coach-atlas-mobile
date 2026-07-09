import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAthleteState } from '@/context/AthleteStateContext'

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, flex: 1 }}>
      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '500' }}>{value}</Text>
    </View>
  )
}

export default function KpisScreen() {
  const { state, loading } = useAthleteState()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const { kpis } = state

  // Primary KPI (stride length) is currently only visible through
  // coaching_notes / session key_metrics — no dedicated field on
  // AthleteKPIs yet. Placeholder values shown; wire up once you
  // confirm where "current stride length at matched HR" is queryable.
  const strideLengthCurrent = 0.96
  const strideLengthTarget = 1.05
  const progressPct = Math.round((strideLengthCurrent / strideLengthTarget) * 100)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '500', marginBottom: 20 }}>KPIs</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <KpiCard label="Run LTHR" value={kpis?.runLthr ? String(kpis.runLthr) : '—'} />
          <KpiCard label="Threshold" value={kpis?.runThresholdPace ?? '—'} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <KpiCard label="Bike FTP" value={kpis?.bikeFtpWatts ? `${kpis.bikeFtpWatts}w` : '—'} />
          <KpiCard label="Swim CSS" value={kpis?.swimCssPer100m ?? '—'} />
        </View>

        <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Primary KPI · stride length</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '500' }}>{strideLengthCurrent}m</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>target {strideLengthTarget}m</Text>
          </View>
          <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#111827' }} />
          </View>
        </View>

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
          Trend history and race-weight target are in More.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}