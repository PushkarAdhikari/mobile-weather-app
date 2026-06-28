import { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface AnimatedTempProps {
  value: number;
  unit: string;
  fontSize?: number;
}

export function AnimatedTemp({ value, unit, fontSize }: AnimatedTempProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Text
      style={{
        fontSize: fontSize || 64,
        fontWeight: '700',
        color: '#FFFFFF',
      }}
    >
      {display}°
    </Text>
  );
}
