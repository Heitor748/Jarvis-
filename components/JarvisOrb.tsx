import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { JarvisState } from '../hooks/useJarvis';
import { colors, fontFamily } from '../constants/theme';

const SIZE = 220;
const C = SIZE / 2; // center = 110
const R_OUTER = 90;
const R_MID = 72;
const R_INNER = 55;

const STATE_COLOR: Record<JarvisState, string> = {
  idle: colors.idle,
  listening: colors.listening,
  processing: colors.processing,
  speaking: colors.speaking,
  error: colors.error,
};

const STATE_LABEL: Record<JarvisState, string> = {
  idle: 'STANDBY',
  listening: 'OUVINDO...',
  processing: 'PROCESSANDO...',
  speaking: 'JARVIS FALA',
  error: 'ERRO',
};

// ── Subcomponents ──────────────────────────────────────────────────────────────

function WaveBar({ index, color }: { index: number; color: string }) {
  const heights = [10, 20, 32, 40, 32, 20, 10];
  const maxH = heights[index];
  const baseH = 6;
  const duration = 180 + index * 45;
  const h = useSharedValue(baseH);

  useEffect(() => {
    h.value = withRepeat(
      withSequence(
        withTiming(maxH, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(baseH, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => cancelAnimation(h);
  }, []);

  const style = useAnimatedStyle(() => ({ height: h.value }));

  return (
    <Animated.View
      style={[{ width: 5, borderRadius: 3, backgroundColor: color }, style]}
    />
  );
}

function WaveformBars({ color }: { color: string }) {
  return (
    <View style={styles.waveRow}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <WaveBar key={i} index={i} color={color} />
      ))}
    </View>
  );
}

function BlinkDot({ delay, color }: { delay: number; color: string }) {
  const op = useSharedValue(0.15);

  useEffect(() => {
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350 }),
          withTiming(0.15, { duration: 350 })
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(op);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: op.value }));

  return (
    <Animated.View
      style={[{ width: 11, height: 11, borderRadius: 6, backgroundColor: color }, style]}
    />
  );
}

function ProcessingDots({ color }: { color: string }) {
  return (
    <View style={styles.dotsRow}>
      <BlinkDot delay={0} color={color} />
      <BlinkDot delay={220} color={color} />
      <BlinkDot delay={440} color={color} />
    </View>
  );
}

// ── Cardinal cross markers ─────────────────────────────────────────────────────

function CardinalMarkers({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const x = C + radius * Math.cos(rad);
        const y = C + radius * Math.sin(rad);
        return (
          <G key={deg}>
            <Line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke={color} strokeWidth="2" strokeOpacity="0.8" />
            <Line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={color} strokeWidth="2" strokeOpacity="0.8" />
          </G>
        );
      })}
    </>
  );
}

// ── Main Orb ──────────────────────────────────────────────────────────────────

interface Props {
  state: JarvisState;
  onPress: () => void;
}

export function JarvisOrb({ state, onPress }: Props) {
  const scale = useSharedValue(1);
  const glowOp = useSharedValue(0.25);
  const outerRot = useSharedValue(0);
  const innerRot = useSharedValue(0);

  const color = STATE_COLOR[state];

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(glowOp);
    cancelAnimation(outerRot);
    cancelAnimation(innerRot);

    if (state === 'idle') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.97, { duration: 2600, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      );
      glowOp.value = withRepeat(
        withSequence(withTiming(0.38, { duration: 2600 }), withTiming(0.18, { duration: 2600 })),
        -1, false
      );
      outerRot.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
      innerRot.value = withRepeat(withTiming(-360, { duration: 9000, easing: Easing.linear }), -1, false);
    }

    if (state === 'listening') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 320, easing: Easing.out(Easing.ease) }),
          withTiming(0.96, { duration: 320, easing: Easing.in(Easing.ease) })
        ), -1, false
      );
      glowOp.value = withRepeat(
        withSequence(withTiming(0.75, { duration: 320 }), withTiming(0.4, { duration: 320 })),
        -1, false
      );
      outerRot.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
      innerRot.value = withRepeat(withTiming(-360, { duration: 2000, easing: Easing.linear }), -1, false);
    }

    if (state === 'processing') {
      scale.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 550 }), withTiming(0.98, { duration: 550 })),
        -1, false
      );
      glowOp.value = withRepeat(
        withSequence(withTiming(0.85, { duration: 380 }), withTiming(0.35, { duration: 380 })),
        -1, false
      );
      outerRot.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);
      innerRot.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    }

    if (state === 'speaking') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 450, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.97, { duration: 450, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      );
      glowOp.value = withRepeat(
        withSequence(withTiming(0.68, { duration: 450 }), withTiming(0.3, { duration: 450 })),
        -1, false
      );
      outerRot.value = withRepeat(withTiming(360, { duration: 5500, easing: Easing.linear }), -1, false);
      innerRot.value = withRepeat(withTiming(-360, { duration: 3500, easing: Easing.linear }), -1, false);
    }

    if (state === 'error') {
      scale.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 180 }), withTiming(0.97, { duration: 180 })),
        4, false
      );
      glowOp.value = 0.55;
    }
  }, [state]);

  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));
  const outerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${outerRot.value}deg` }] }));
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${innerRot.value}deg` }] }));

  const topArc = `M ${C - 30} ${C - 38} A 38 38 0 0 1 ${C + 30} ${C - 38}`;
  const botArc = `M ${C - 30} ${C + 38} A 38 38 0 0 0 ${C + 30} ${C + 38}`;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[{ width: SIZE, height: SIZE }, scaleStyle]}>

        {/* Glow background */}
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <Stop offset="60%" stopColor={color} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={C} cy={C} r={105} fill="url(#glow)" />
          </Svg>
        </Animated.View>

        {/* Outer dashed rotating ring */}
        <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={C} cy={C} r={R_OUTER}
              stroke={color} strokeWidth="1.5" fill="none"
              strokeDasharray="12 6" strokeOpacity="0.55"
            />
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg - 90) * (Math.PI / 180);
              return (
                <Circle key={deg}
                  cx={C + R_OUTER * Math.cos(rad)}
                  cy={C + R_OUTER * Math.sin(rad)}
                  r={3.5} fill={color} fillOpacity="0.9"
                />
              );
            })}
          </Svg>
        </Animated.View>

        {/* Inner dashed counter-rotating ring */}
        <Animated.View style={[StyleSheet.absoluteFill, innerStyle]}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={C} cy={C} r={R_MID}
              stroke={color} strokeWidth="1" fill="none"
              strokeDasharray="5 10" strokeOpacity="0.38"
            />
          </Svg>
        </Animated.View>

        {/* Static core SVG */}
        <Svg style={StyleSheet.absoluteFill} width={SIZE} height={SIZE}>
          {/* Core ring */}
          <Circle cx={C} cy={C} r={R_INNER} stroke={color} strokeWidth="2.5" fill="none" strokeOpacity="0.85" />
          {/* Core fill */}
          <Circle cx={C} cy={C} r={R_INNER - 3} fill={color} fillOpacity="0.06" />
          {/* Bracket arcs */}
          <Path d={topArc} stroke={color} strokeWidth="2.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
          <Path d={botArc} stroke={color} strokeWidth="2.5" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
          {/* Cardinal cross markers on core ring */}
          <CardinalMarkers radius={R_INNER} color={color} />
          {/* Inner corner decorations */}
          <Line x1={C - 18} y1={C - 48} x2={C - 8} y2={C - 48} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
          <Line x1={C + 8} y1={C - 48} x2={C + 18} y2={C - 48} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
          <Line x1={C - 18} y1={C + 48} x2={C - 8} y2={C + 48} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
          <Line x1={C + 8} y1={C + 48} x2={C + 18} y2={C + 48} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
        </Svg>

        {/* Center dynamic content */}
        <View style={styles.centerContent}>
          {state === 'idle' && (
            <Text style={[styles.orbLetter, { color }]}>J</Text>
          )}
          {state === 'listening' && <WaveformBars color={color} />}
          {state === 'processing' && <ProcessingDots color={color} />}
          {state === 'speaking' && (
            <Text style={[styles.orbLetter, { color, fontSize: 36 }]}>◈</Text>
          )}
          {state === 'error' && (
            <Text style={[styles.orbLetter, { color, fontSize: 44 }]}>!</Text>
          )}
        </View>

        {/* Pressable overlay */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
      </Animated.View>

      {/* State label */}
      <Text style={[styles.stateLabel, { color }]}>{STATE_LABEL[state]}</Text>
      {state === 'idle' && (
        <Text style={[styles.hint, { color: color + '55' }]}>▷ toque para falar</Text>
      )}
      {state === 'listening' && (
        <Text style={[styles.hint, { color: color + 'aa' }]}>■ toque para finalizar</Text>
      )}
      {state === 'speaking' && (
        <Text style={[styles.hint, { color: color + '88' }]}>◼ toque para interromper</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  orbLetter: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateLabel: {
    marginTop: 14,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 4,
    fontWeight: '600',
  },
  hint: {
    marginTop: 5,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
