import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme, getThemeColors, ThemeColors } from '../../constants/theme';
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
  const { selectedLocation, theme: themeMode, use24hour } = useAppContext();
  const colors = getThemeColors(themeMode);
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

  if (isLoading) return <LoadingSkeleton colors={colors} />;
  if (isError) return <ErrorState colors={colors} message={error?.message || 'Failed to load alerts'} onRetry={refetch} />;
  if (!data) return <ErrorState colors={colors} message="No alert data available" onRetry={refetch} />;

  const alerts = data.alerts?.alert || [];

  return (
    <GradientBackground isDay={data.current.is_day} weatherCode={data.current.condition.code} theme={themeMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: theme.spacing.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.sm }}>
          Weather Alerts
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.bodyLg, marginBottom: theme.spacing.xxl }}>
          {alerts.length === 0
            ? 'No active alerts for your area'
            : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} active`
          }
        </Text>

        {alerts.length === 0 ? (
          <GlassCard colors={colors} style={{ alignItems: 'center', paddingVertical: theme.spacing.huge, paddingHorizontal: theme.spacing.xxl }}>
            <Ionicons name="shield-checkmark-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '600', marginTop: theme.spacing.xl }}>
              All Clear
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.bodyLg, marginTop: theme.spacing.md, textAlign: 'center', lineHeight: 24 }}>
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
                  <GlassCard colors={colors} style={{ padding: theme.spacing.xl }}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                      <Ionicons
                        name={severityIcons[alert.severity] || severityIcons.Unknown}
                        size={24}
                        color={severityColor}
                        style={{ marginTop: 2 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: theme.typography.bodyLg, marginBottom: theme.spacing.sm }}>
                          {alert.headline}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: severityColor }} />
                            <Text style={{ color: severityColor, fontSize: theme.typography.caption, fontWeight: '700' }}>
                              {alert.severity}
                            </Text>
                          </View>
                          <Text style={{ color: colors.text.muted, fontSize: theme.typography.caption }}>{alert.category}</Text>
                        </View>

                        {expanded && (
                          <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.lg }}>
                            <Text style={{ color: colors.text.secondary, fontSize: theme.typography.body, lineHeight: 22 }}>
                              {alert.desc}
                            </Text>
                            {alert.instruction && (
                              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: theme.radius.md, padding: theme.spacing.lg }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.sm }}>
                                  INSTRUCTION
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: theme.typography.body, lineHeight: 22 }}>
                                  {alert.instruction}
                                </Text>
                              </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View>
                                <Text style={{ color: colors.text.muted, fontSize: theme.typography.caption }}>Effective</Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, marginTop: theme.spacing.xs }}>
                                  {getTimeFromDate(alert.effective, use24hour)}
[...truncated]...
                                  {getTimeFromDate(alert.expires, use24hour)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        <Text style={{ color: colors.text.muted, fontSize: theme.typography.caption, marginTop: theme.spacing.md }}>
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
      </SafeAreaView>
    </GradientBackground>
  );
}
