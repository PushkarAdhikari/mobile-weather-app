import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';

import { searchCities } from '../../services/api';
import { useAppContext } from '../../constants/AppContext';
import { GlassCard } from '../../components/GlassCard';
import { Location } from '../../types/weather';

export default function CitySearchModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSelectedLocation } = useAppContext();
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
    <View
      style={{
        flex: 1,
        backgroundColor: '#0f172a',
        paddingTop: insets.top,
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 16,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search city..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 16, paddingHorizontal: 12 }}
            autoCapitalize="words"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length < 2 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.15)" />
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
            Type at least 2 characters to search cities
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.lat}-${item.lng}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} onPress={() => selectLocation(item)}>
            <GlassCard style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}>
              <Ionicons name="location-outline" size={20} color="rgba(255,255,255,0.5)" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {item.region ? `${item.region}, ` : ''}{item.country}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)' }}>Searching...</Text>
            </View>
          ) : query.trim().length >= 2 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)' }}>No cities found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
