import { Stack } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'

function KPIRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <Text style={{ fontSize: 14, color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>{value}</Text>
    </View>
  )
}

export default function KPIHistoryScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const kpis = state.kpis

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'KPI history' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!kpis ? (
          <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No KPIs recorded yet.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
              Last updated {new Date(kpis.updatedAt).toDateString()}
            </Text>
            <View style={{ marginTop: 12 }}>
              <KPIRow label="Swim CSS" value={kpis.swimCssPer100m ? `${kpis.swimCssPer100m} / 100m` : null} />
              <KPIRow label="Bike FTP" value={kpis.bikeFtpWatts ? `${kpis.bikeFtpWatts}W` : null} />
              <KPIRow label="Bike FTP (W/kg)" value={kpis.bikeFtpWkg} />
              <KPIRow label="Run threshold pace" value={kpis.runThresholdPace} />
              <KPIRow label="Run LTHR" value={kpis.runLthr ? `${kpis.runLthr} bpm` : null} />
              <KPIRow label="Bike LTHR" value={kpis.bikeLthr ? `${kpis.bikeLthr} bpm` : null} />
              <KPIRow label="VO2max estimate" value={kpis.vo2maxEstimate} />
              <KPIRow label="HRV baseline" value={kpis.hrvBaseline} />
              <KPIRow label="Resting HR" value={kpis.rhrBpm ? `${kpis.rhrBpm} bpm` : null} />
            </View>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 20, lineHeight: 18 }}>
              This shows your current values only — trend history over time isn't tracked yet.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}