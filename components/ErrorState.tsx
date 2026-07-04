import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { theme, ThemeColors } from '../constants/theme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  colors: ThemeColors;
}

export function ErrorState({ message, onRetry, colors }: ErrorStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xxxl }}>
      <GlassCard colors={colors} style={{ padding: theme.spacing.xxxl, alignItems: 'center', gap: theme.spacing.xl, width: '100%', maxWidth: 340 }}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.text.muted} />
        <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '600', textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.bodyLg, textAlign: 'center', lineHeight: 24 }}>
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.7}
            style={{
              marginTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.xxl,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radius.full,
              backgroundColor: 'rgba(255,255,255,0.15)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: theme.typography.bodyLg }}>Try Again</Text>
          </TouchableOpacity>
        )}
      </GlassCard>
    </View>
  );
}
