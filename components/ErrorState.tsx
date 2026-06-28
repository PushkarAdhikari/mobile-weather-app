import { View, Text, TouchableOpacity } from 'react-native';
import { GlassCard } from './GlassCard';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <GlassCard style={{ padding: 32, alignItems: 'center', gap: 16, width: '100%', maxWidth: 300 }}>
        <Text style={{ fontSize: 48 }}>🌤</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' }}>
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              marginTop: 8,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        )}
      </GlassCard>
    </View>
  );
}
