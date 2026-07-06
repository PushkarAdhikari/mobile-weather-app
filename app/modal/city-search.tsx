import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';

import { searchCities } from '../../services/api';
import { useAppContext } from '../../constants/AppContext';
import { theme, getThemeColors } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { Location } from '../../types/weather';
import { t } from '../../utils/i18n';

export default function CitySearchModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSelectedLocation, theme: themeMode, language } = useAppContext();
  const colors = getThemeColors(themeMode);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const cities = await searchCities(query.trim());
        setResults(cities.slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  function selectLocation(loc: Location) {
    setSelectedLocation(loc);
    Keyboard.dismiss();
    router.back();
  }

  return (
    <BlurView intensity={80} tint={themeMode === 'light' ? 'light' : 'dark'} style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.lg }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ alignSelf: 'flex-start', marginBottom: theme.spacing.md }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: query.trim().length > 0 ? `${colors.accent}66` : colors.surfaceBorder,
          }}
        >
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_city', language)}
            placeholderTextColor={colors.text.muted}
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: theme.typography.bodyLg,
              paddingVertical: theme.spacing.xl,
              paddingHorizontal: theme.spacing.md,
            }}
            autoCapitalize="words"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length < 2 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xxxl }}>
          <Ionicons name="search-outline" size={48} color={colors.text.muted} />
          <Text style={{ color: colors.text.muted, fontSize: theme.typography.bodyLg, marginTop: theme.spacing.lg, textAlign: 'center', lineHeight: 22 }}>
            {t('type_to_search', language)}
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.lat}-${item.lng}-${index}`}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} onPress={() => selectLocation(item)} accessibilityLabel={`Select ${item.name}`} accessibilityRole="button">
            <GlassCard colors={colors} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl }}>
              <Ionicons name="location-outline" size={22} color={colors.text.tertiary} />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: theme.typography.bodyLg }}>{item.name}</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, marginTop: theme.spacing.xs }}>
                  {item.region ? `${item.region}, ` : ''}{item.country}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxxl }}>
              <ActivityIndicator size="small" color={colors.text.tertiary} />
            </View>
          ) : query.trim().length >= 2 ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxxl }}>
              <Ionicons name="map-outline" size={36} color={colors.text.muted} />
              <Text style={{ color: colors.text.muted, fontSize: theme.typography.body, marginTop: theme.spacing.md }}>
                {t('no_cities', language)}
              </Text>
            </View>
          ) : null
        }
      />
    </BlurView>
  );
}
