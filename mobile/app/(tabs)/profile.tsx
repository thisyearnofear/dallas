import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../config/theme';
import { useWallet } from '../../hooks/useWallet';
import { useReputation, RANK_COLORS, RANK_NEXT_XP } from '../../hooks/useReputation';
import { fadeSlideIn, entryStyle, springPop, pulseLoop } from '../../config/animations';

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: {
  label: string; value: string; icon: keyof typeof Ionicons.glyphMap; accent?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={16} color={accent ? Colors.accent : Colors.textMuted} />
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function MenuRow({ icon, label, value, onPress, accent }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  accent?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIcon, accent && styles.menuIconAccent]}>
        <Ionicons name={icon} size={16} color={accent ? Colors.error : Colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, accent && styles.menuLabelAccent]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

function AllianceBadge({ name, ticker, role }: { name: string; ticker: string; role: string }) {
  return (
    <View style={styles.allianceBadge}>
      <View style={styles.allianceBadgeLeft}>
        <Text style={styles.allianceBadgeTicker}>{ticker}</Text>
        <Text style={styles.allianceBadgeName}>{name}</Text>
      </View>
      <View style={styles.rolePill}>
        <Text style={styles.roleText}>{role}</Text>
      </View>
    </View>
  );
}

// ─── XP / Rank bar ───────────────────────────────────────────────────────────

function RankBar({ xp, rank, rankProgress }: { xp: number; rank: string; rankProgress: number }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const rankColor = RANK_COLORS[rank as keyof typeof RANK_COLORS] ?? Colors.accent;
  const nextXp = RANK_NEXT_XP(xp);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: rankProgress,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [rankProgress]);

  return (
    <View style={styles.rankBar}>
      <View style={styles.rankBarHeader}>
        <View style={[styles.rankBadge, { borderColor: rankColor, backgroundColor: `${rankColor}18` }]}>
          <Text style={[styles.rankBadgeText, { color: rankColor }]}>{rank}</Text>
        </View>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: rankColor,
              width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>{xp} / {nextXp} XP to next rank</Text>
    </View>
  );
}

// ─── Streak counter ──────────────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    springPop(scaleAnim).start();
  }, []);

  if (streak === 0) return null;

  return (
    <Animated.View style={[styles.streakBadge, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <Text style={styles.streakCount}>{streak}</Text>
      <Text style={styles.streakLabel}>day streak</Text>
    </Animated.View>
  );
}

// ─── Achievement shelf ───────────────────────────────────────────────────────

function AchievementShelf({ achievements }: { achievements: ReturnType<typeof useReputation>['achievements'] }) {
  const unlocked = achievements.filter(a => a.unlockedAt !== null);
  const locked = achievements.filter(a => a.unlockedAt === null);

  return (
    <View style={styles.achievementShelf}>
      {unlocked.map(a => (
        <View key={a.id} style={styles.achievementChip}>
          <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={14} color={Colors.accent} />
          <Text style={styles.achievementLabel}>{a.label}</Text>
        </View>
      ))}
      {locked.slice(0, 3).map(a => (
        <View key={a.id} style={[styles.achievementChip, styles.achievementLocked]}>
          <Ionicons name="lock-closed-outline" size={12} color={Colors.textMuted} />
          <Text style={[styles.achievementLabel, { color: Colors.textMuted }]}>{a.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Daily challenge card ────────────────────────────────────────────────────

const DAILY_CHALLENGES = [
  { icon: 'flash-outline' as const, title: 'Submit an optimization log', xp: 75, action: 'Submit' },
  { icon: 'people-outline' as const, title: 'Join a new alliance', xp: 50, action: 'Explore' },
  { icon: 'checkmark-circle-outline' as const, title: 'Validate a peer log', xp: 100, action: 'Validate' },
];

function DailyChallengeCard() {
  const challenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => { pulseLoop(glowAnim).start(); }, []);

  return (
    <View style={styles.challengeCard}>
      <Animated.View style={[styles.challengeGlow, { opacity: glowAnim }]} />
      <View style={styles.challengeLeft}>
        <View style={styles.challengeIconWrap}>
          <Ionicons name={challenge.icon} size={18} color={Colors.accent} />
        </View>
        <View style={styles.challengeText}>
          <Text style={styles.challengeEyebrow}>DAILY CHALLENGE</Text>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
        </View>
      </View>
      <View style={styles.challengeRight}>
        <Text style={styles.challengeXp}>+{challenge.xp} XP</Text>
        <TouchableOpacity
          style={styles.challengeBtn}
          activeOpacity={0.8}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={styles.challengeBtnText}>{challenge.action}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Disconnected state ──────────────────────────────────────────────────────

function DisconnectedView({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const ctaAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    pulseLoop(pulseAnim).start();
    pulseLoop(ctaAnim).start();
  }, []);

  return (
    <View style={styles.disconnectedContainer}>
      <Animated.View style={[styles.walletRing, { borderColor: Colors.accentBorder, opacity: pulseAnim }]}>
        <View style={styles.walletInner}>
          <Ionicons name="wallet-outline" size={40} color={Colors.accent} />
        </View>
      </Animated.View>
      <Text style={styles.disconnectedTitle}>Connect your wallet</Text>
      <Text style={styles.disconnectedBody}>
        Link your Solana wallet to join alliances, submit optimization logs, and build your on-chain validator reputation.
      </Text>

      <View style={styles.featureList}>
        {[
          { icon: 'people-outline' as const, text: 'Join alliances around your AI challenges' },
          { icon: 'shield-checkmark-outline' as const, text: 'Submit encrypted optimization logs' },
          { icon: 'star-outline' as const, text: 'Build a verifiable validator reputation' },
          { icon: 'flash-outline' as const, text: 'Earn alliance tokens for contributions' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Ionicons name={f.icon} size={14} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <Animated.View style={{ width: '100%', opacity: ctaAnim }}>
        <TouchableOpacity style={styles.connectBtn} onPress={onConnect} activeOpacity={0.85} disabled={connecting}>
          {connecting ? (
            <ActivityIndicator color={Colors.bg} size="small" />
          ) : (
            <>
              <Ionicons name="wallet" size={18} color={Colors.bg} />
              <Text style={styles.connectBtnText}>Connect Wallet</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.connectNote}>Uses Mobile Wallet Adapter — Phantom, Solflare, and more</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

const MOCK_ALLIANCES = [
  { name: 'Hallucination Hunters', ticker: '$EVAL', role: 'Member' },
  { name: 'Context Crushers', ticker: '$CONTEXT', role: 'Validator' },
];

export default function ProfileScreen() {
  const { connected, publicKey, balance, connect, disconnect } = useWallet();
  const solBalance = balance;
  const dbcBalance: number | null = null; // DBC balance fetched separately
  const rep = useReputation();
  const [connecting, setConnecting] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeSlideIn(headerAnim, 0, 220).start(() => {
      fadeSlideIn(contentAnim, 0, 300).start();
    });
  }, [connected]);

  const handleConnect = async () => {
    setConnecting(true);
    try { await connect(); } finally { setConnecting(false); }
  };

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  if (!connected) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <Animated.View style={[styles.header, entryStyle(headerAnim, 12)]}>
          <Text style={styles.headerEyebrow}>IDENTITY</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </Animated.View>
        <DisconnectedView onConnect={handleConnect} connecting={connecting} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, entryStyle(headerAnim, 12)]}>
          <Text style={styles.headerEyebrow}>IDENTITY</Text>
          <Text style={styles.headerTitle}>Profile</Text>
          <StreakBadge streak={rep.streak} />
        </Animated.View>

        <Animated.View style={entryStyle(contentAnim, 20)}>
          {/* Identity card */}
          <View style={styles.identityCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={28} color={Colors.accent} />
              </View>
            </View>
            <View style={styles.identityInfo}>
              <View style={styles.addressRow}>
                <Text style={styles.address}>{shortKey}</Text>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="copy-outline" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.validatorBadge}>
                <Ionicons name="shield-checkmark" size={11} color={Colors.accent} />
                <Text style={styles.validatorBadgeText}>Active Validator</Text>
              </View>
            </View>
          </View>

          {/* Rank + XP bar */}
          <RankBar xp={rep.xp} rank={rep.rank} rankProgress={rep.rankProgress} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard label="SOL" value={solBalance?.toFixed(3) ?? '—'} icon="logo-bitcoin" />
            <View style={styles.statsDivider} />
            <StatCard label="DBC" value={dbcBalance ? `${(dbcBalance / 1000).toFixed(1)}K` : '—'} icon="flash" accent />
            <View style={styles.statsDivider} />
            <StatCard label="Logs" value={String(rep.logsSubmitted)} icon="document-text-outline" />
            <View style={styles.statsDivider} />
            <StatCard label="Rep" value={String(rep.validationsCompleted > 0 ? Math.round(94 + rep.validationsCompleted * 0.1) : 0)} icon="star" accent />
          </View>

          {/* Achievements */}
          <SectionHeader title="ACHIEVEMENTS" />
          <View style={[styles.section, { padding: Spacing.md }]}>
            <AchievementShelf achievements={rep.achievements} />
          </View>

          {/* Alliances */}
          <SectionHeader title="MY ALLIANCES" />
          <View style={styles.section}>
            {MOCK_ALLIANCES.map((a, i) => (
              <AllianceBadge key={i} {...a} />
            ))}
            <TouchableOpacity style={styles.joinMoreBtn} activeOpacity={0.75}>
              <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
              <Text style={styles.joinMoreText}>Browse alliances</Text>
            </TouchableOpacity>
          </View>

          {/* Validator status */}
          <SectionHeader title="VALIDATOR STATUS" />
          <View style={styles.section}>
            <View style={styles.validatorCard}>
              <View style={styles.validatorRow}>
                <Text style={styles.validatorLabel}>DBC Staked</Text>
                <Text style={styles.validatorValue}>1,200 DBC</Text>
              </View>
              <View style={styles.validatorDivider} />
              <View style={styles.validatorRow}>
                <Text style={styles.validatorLabel}>Validations</Text>
                <Text style={styles.validatorValue}>{rep.validationsCompleted} completed</Text>
              </View>
              <View style={styles.validatorDivider} />
              <View style={styles.validatorRow}>
                <Text style={styles.validatorLabel}>Accuracy</Text>
                <Text style={[styles.validatorValue, { color: Colors.accent }]}>97.8%</Text>
              </View>
              <View style={styles.validatorDivider} />
              <View style={styles.validatorRow}>
                <Text style={styles.validatorLabel}>SOL Earned</Text>
                <Text style={[styles.validatorValue, { color: Colors.accent }]}>2.14 SOL</Text>
              </View>
            </View>
          </View>

          {/* Daily challenge */}
          <DailyChallengeCard />

          {/* Settings */}
          <SectionHeader title="SETTINGS" />
          <View style={styles.section}>
            <MenuRow icon="notifications-outline" label="Notifications" value="On" onPress={() => {}} />
            <MenuRow icon="globe-outline" label="Network" value="Mainnet" onPress={() => {}} />
            <MenuRow icon="shield-outline" label="Privacy" onPress={() => {}} />
            <MenuRow icon="help-circle-outline" label="Support" onPress={() => {}} />
          </View>

          {/* Disconnect */}
          <View style={[styles.section, { marginBottom: 48 }]}>
            <MenuRow icon="log-out-outline" label="Disconnect wallet" onPress={disconnect} accent />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerEyebrow: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1.5,
    fontFamily: Typography.mono,
    marginBottom: 2,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    flex: 1,
  },

  // Streak badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  streakEmoji: { fontSize: 13 },
  streakCount: { color: Colors.warning, fontSize: Typography.sm, fontWeight: Typography.bold, fontFamily: Typography.mono },
  streakLabel: { color: Colors.warning, fontSize: Typography.xs },

  // Rank bar
  rankBar: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rankBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rankBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1 },
  xpText: { color: Colors.textMuted, fontSize: Typography.xs, fontFamily: Typography.mono },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: { color: Colors.textMuted, fontSize: Typography.xs, fontFamily: Typography.mono },

  // Daily challenge card
  challengeCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  challengeGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.accent,
    opacity: 0.04,
    borderRadius: Radius.md,
  },
  challengeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  challengeIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,255,136,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  challengeText: { flex: 1 },
  challengeEyebrow: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: Typography.bold,
    letterSpacing: 1.5,
    fontFamily: Typography.mono,
    marginBottom: 2,
  },
  challengeTitle: { ...Typography.body, fontSize: Typography.sm },
  challengeRight: { alignItems: 'flex-end', gap: 6 },
  challengeXp: {
    color: Colors.accent,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    fontFamily: Typography.mono,
  },
  challengeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  challengeBtnText: {
    color: Colors.bg,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },

  // Identity card
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityInfo: { flex: 1, gap: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  address: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold, fontFamily: Typography.mono },
  validatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  validatorBadgeText: { color: Colors.accent, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: Colors.textPrimary, fontSize: Typography.md, fontWeight: Typography.bold, fontFamily: Typography.mono },
  statValueAccent: { color: Colors.accent },
  statLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  statsDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Achievements
  achievementShelf: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  achievementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  achievementLocked: {
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.border,
  },
  achievementLabel: { color: Colors.accent, fontSize: Typography.xs, fontWeight: Typography.medium },

  // Section
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1.2,
    fontFamily: Typography.mono,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  section: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Alliance badges
  allianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  allianceBadgeLeft: { gap: 2 },
  allianceBadgeTicker: { color: Colors.accent, fontSize: Typography.xs, fontFamily: Typography.mono, fontWeight: Typography.bold },
  allianceBadgeName: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.medium },
  rolePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.medium },
  joinMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  joinMoreText: { color: Colors.accent, fontSize: Typography.sm, fontWeight: Typography.medium },

  // Validator card
  validatorCard: { padding: Spacing.md, gap: Spacing.sm },
  validatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  validatorLabel: { color: Colors.textSecondary, fontSize: Typography.sm },
  validatorValue: { color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: Typography.semibold, fontFamily: Typography.mono },
  validatorDivider: { height: 1, backgroundColor: Colors.borderSubtle },

  // Menu rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconAccent: { backgroundColor: 'rgba(239,68,68,0.1)' },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base },
  menuLabelAccent: { color: Colors.error },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuValue: { color: Colors.textMuted, fontSize: Typography.sm },

  // Disconnected
  disconnectedContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  walletRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  walletInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectedTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  disconnectedBody: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  featureList: { width: '100%', gap: Spacing.md, marginBottom: Spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 18 },
  connectBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    marginBottom: Spacing.md,
    ...Shadow.accent,
  },
  connectBtnText: { color: Colors.bg, fontSize: Typography.base, fontWeight: Typography.bold },
  connectNote: { color: Colors.textMuted, fontSize: Typography.xs, textAlign: 'center' },
});
