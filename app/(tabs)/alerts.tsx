import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { getTimeFromDate } from '../../utils/weather';
import { WeatherAlert } from '../../types/weather';

const severityColors: Record<string, string> = {
  Extreme: '#ff4444',
  Severe: '#ff8800',
  Moderate: '#ffaa00',
  Minor: '#ffcc00',
  Unknown: '#888888',
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedLocation } = useAppContext();
  const { location } = useLocation();

  const activeLat = selectedLocation?.lat ?? location?.lat ?? DEFAULT_LOCATION.lat;
  const activeLng = selectedLocation?.lng ?? location?.lng ?? DEFAULT_LOCATION.lng;

  const { data, isLoading, isError, error, refetch } = useWeather(activeLat, activeLng);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState message={error?.message || 'Failed to load alerts'} onRetry={refetch} />;
  if (!data) return <ErrorState message="No alert data available" onRetry={refetch} />;

  const alerts = data.alerts?.alert || [];

  return (
    <GradientBackground isDay={data.current.is_day} weatherCode={data.current.condition.code}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
          Weather Alerts
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
          {alerts.length === 0
            ? 'No active alerts for your area'
            : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} active`
          }
        </Text>

        {alerts.length === 0 ? (
          <GlassCard style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16 }}>All Clear</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              No weather alerts in your area right now
            </Text>
          </GlassCard>
        ) : (
          <View style={{ gap: 16 }}>
            {alerts.map((alert: WeatherAlert, index: number) => {
              const expanded = expandedIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <GlassCard style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: severityColors[alert.severity] || severityColors.Unknown,
                          marginTop: 6,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                          {alert.headline}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ color: severityColors[alert.severity] || severityColors.Unknown, fontSize: 12, fontWeight: '600' }}>
                            {alert.severity}
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{alert.category}</Text>
                        </View>

                        {expanded && (
                          <View style={{ marginTop: 16, gap: 12 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20 }}>
                              {alert.desc}
                            </Text>
                            {alert.instruction && (
                              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
                                  INSTRUCTION
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 }}>
                                  {alert.instruction}
                                </Text>
                              </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Effective</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                                  {getTimeFromDate(alert.effective)}
                                </Text>
                              </View>
                              <View>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Expires</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                                  {getTimeFromDate(alert.expires)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 }}>
                          {expanded ? 'Tap to collapse' : 'Tap for details'}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}
