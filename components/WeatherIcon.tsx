import { Image, View } from 'react-native';

interface WeatherIconProps {
  icon: string;
  size?: number;
}

export function WeatherIcon({ icon, size = 64 }: WeatherIconProps) {
  const iconUrl = icon.startsWith('//') ? `https:${icon}` : icon;
  const url = iconUrl.replace('64x64', `${size}x${size}`);

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        fadeDuration={200}
      />
    </View>
  );
}
