import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../config/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  eyebrow: string;
  headline: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    iconColor: '#00ff88',
    eyebrow: 'THE DARK FOREST PROBLEM',
    headline: 'Your AI agent\nbreakthroughs\nare invisible.',
    body: 'You solved a hard problem — context limits, tool loops, hallucinations. But sharing your solution means exposing your proprietary prompts and architecture.',
  },
  {
    id: '2',
    icon: 'people',
    iconColor: '#3b82f6',
    eyebrow: 'AGENT ALLIANCES',
    headline: 'Find your\ntribe. Keep\nyour edge.',
    body: 'Join alliances of developers facing the same bottlenecks. Share validated optimizations via zero-knowledge proofs — prove you improved without revealing how.',
  },
  {
    id: '3',
    icon: 'flash',
    iconColor: '#8b5cf6',
    eyebrow: 'PROOF OF OPTIMIZATION',
    headline: 'Earn. Govern.\nBreak through\ntogether.',
    body: 'Submit encrypted performance logs. Earn alliance tokens. Fund collective R&D — fine-tuning datasets, eval infra, compute credits — without giving away your moat.',
  },
];

function Slide({ slide }: { slide: Slide }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconRing, { borderColor: slide.iconColor + '33' }]}>
        <View style={[styles.iconInner, { backgroundColor: slide.iconColor + '18' }]}>
          <Ionicons name={slide.icon} size={48} color={slide.iconColor} />
        </View>
      </View>
      <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
      <Text style={styles.headline}>{slide.headline}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = activeIndex === SLIDES.length - 1;

  const complete = async () => {
    await AsyncStorage.setItem('dbc_onboarding_complete', 'true');
    router.replace('/(tabs)/alliances');
  };

  const handleNext = () => {
    if (isLast) {
      complete();
      return;
    }
    const next = activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  const handleSkip = () => {
    complete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skip} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={s => s.id}
        renderItem={({ item }) => <Slide slide={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.flatList}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        <Dots count={SLIDES.length} active={activeIndex} />

        <TouchableOpacity
          style={[styles.cta, isLast && styles.ctaFinal]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {isLast ? (
            <>
              <Ionicons name="wallet-outline" size={18} color={Colors.bg} />
              <Text style={styles.ctaTextDark}>Connect Wallet</Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
            </>
          )}
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity style={styles.ghostCta} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.ghostCtaText}>Explore without wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  skip: {
    position: 'absolute',
    top: 56,
    right: Spacing.lg,
    zIndex: 10,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: height * 0.14,
    paddingBottom: Spacing.xl,
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    fontFamily: Typography.mono,
  },
  headline: {
    color: Colors.textPrimary,
    fontSize: Typography.xxxl,
    fontWeight: Typography.black,
    lineHeight: 44,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    lineHeight: 24,
    maxWidth: 320,
  },
  bottom: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.accent,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    borderRadius: Radius.md,
    paddingVertical: 16,
    backgroundColor: Colors.accentMuted,
  },
  ctaFinal: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  ctaText: {
    color: Colors.accent,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  ctaTextDark: {
    color: Colors.bg,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  ghostCta: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  ghostCtaText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
});
