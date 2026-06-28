import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { theme } from '../constants/theme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xxxl }}>
      <GlassCard style={{ padding: theme.spacing.xxxl, alignItems: 'center', gap: theme.spacing.lg, width: '100%', maxWidth: 300 }}>
        <Ionicons name="cloud-offline-outline" size={48} color="rgba(255,255,255,0.3)" />
        <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.heading, fontWeight: '600', textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.body, textAlign: 'center', lineHeight: 20 }}>
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.7}
            style={{
              marginTop: theme.spacing.sm,
              paddingHorizontal: theme.spacing.xxl,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radius.full,
              backgroundColor: 'rgba(255,255,255,0.15)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <Ionicons name="refresh-outline" size={18} color={theme.colors.white} />
            <Text style={{ color: theme.colors.white, fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        )}
      </GlassCard>
    </View>
  );
}
