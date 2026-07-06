import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

const tabs = [
  { name: 'index', title: 'Now', icon: 'cloud', iconSet: 'Ionicons' },
  { name: 'forecast', title: 'Forecast', icon: 'calendar', iconSet: 'Feather' },
  { name: 'alerts', title: 'Alerts', icon: 'alert-triangle', iconSet: 'Feather' },
  { name: 'settings', title: 'Settings', icon: 'settings', iconSet: 'Feather' },
];

function TabIcon({ icon, iconSet, focused }: { icon: string; iconSet: string; focused: boolean }) {
  const color = focused ? '#FFF' : '#64748B';
  const size = 20;
  if (iconSet === 'Feather') {
    return <Feather name={icon as any} size={size} color={color} />;
  }
  return <Ionicons name={icon as any} size={size} color={color} />;
}

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.navBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.navItem, isFocused && styles.navItemActive]}
          >
            <TabIcon icon={tab.icon} iconSet={tab.iconSet} focused={isFocused} />
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="forecast" />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  navText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
