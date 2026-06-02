import React from 'react';
import { View, StyleSheet } from 'react-native';

export function ScanLines() {
  const lines = Array.from({ length: 50 });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            {
              top: i * (100 / 50) + '%',
              opacity: i % 2 === 0 ? 0.018 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00d4ff',
  },
});
