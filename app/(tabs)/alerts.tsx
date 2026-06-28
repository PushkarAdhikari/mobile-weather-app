import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme } from '../../constants/theme';
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

const severityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Extreme: 'warning',
  Severe: 'alert-circle',
  Moderate: 'alert-circle-outline',
  Minor: 'information-circle-outline',
  Unknown: 'help-circle-outline',
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
        contentContainerStyle={{ paddingTop: insets.top + theme.spacing.lg, paddingBottom: 40, paddingHorizontal: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <Text style={{ color: '#FFFFFF', fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.sm }}>
          Weather Alerts
        </Text>
        <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.body, marginBottom: theme.spacing.xxl }}>
          {alerts.length === 0
            ? 'No active alerts for your area'
            : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} active`
          }
        </Text>

        {alerts.length === 0 ? (
          <GlassCard style={{ alignItems: 'center', paddingVertical: theme.spacing.huge, paddingHorizontal: theme.spacing.xxl }}>
            <Ionicons name="shield-checkmark-outline" size={56} color="rgba(255,255,255,0.25)" />
            <Text style={{ color: '#FFFFFF', fontSize: theme.typography.heading, fontWeight: '600', marginTop: theme.spacing.lg }}>
              All Clear
            </Text>
            <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.body, marginTop: theme.spacing.sm, textAlign: 'center', lineHeight: 20 }}>
              No weather alerts in your area right now
            </Text>
          </GlassCard>
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {alerts.map((alert: WeatherAlert, index: number) => {
              const expanded = expandedIndex === index;
              const severityColor = severityColors[alert.severity] || severityColors.Unknown;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <GlassCard style={{ padding: theme.spacing.xl }}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                      <Ionicons
                        name={severityIcons[alert.severity] || severityIcons.Unknown}
                        size={22}
                        color={severityColor}
                        style={{ marginTop: 2 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: theme.typography.bodyLg, marginBottom: theme.spacing.xs }}>
                          {alert.headline}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: severityColor }} />
                            <Text style={{ color: severityColor, fontSize: theme.typography.caption, fontWeight: '600' }}>
                              {alert.severity}
                            </Text>
                          </View>
                          <Text style={{ color: theme.colors.text.muted, fontSize: theme.typography.caption }}>{alert.category}</Text>
                        </View>

                        {expanded && (
                          <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
                            <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.body, lineHeight: 20 }}>
                              {alert.desc}
                            </Text>
                            {alert.instruction && (
                              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: theme.radius.md, padding: theme.spacing.md }}>
                                <Text style={{ color: theme.colors.text.tertiary, fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: theme.spacing.xs }}>
                                  INSTRUCTION
                                </Text>
                                <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.body, lineHeight: 20 }}>
                                  {alert.instruction}
                                </Text>
                              </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View>
                                <Text style={{ color: theme.colors.text.muted, fontSize: theme.typography.caption }}>Effective</Text>
                                <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption }}>
                                  {getTimeFromDate(alert.effective)}
                                </Text>
                              </View>
                              <View>
                                <Text style={{ color: theme.colors.text.muted, fontSize: theme.typography.caption }}>Expires</Text>
                                <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption }}>
                                  {getTimeFromDate(alert.expires)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        <Text style={{ color: theme.colors.text.muted, fontSize: 10, marginTop: theme.spacing.sm, letterSpacing: 0.5 }}>
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
