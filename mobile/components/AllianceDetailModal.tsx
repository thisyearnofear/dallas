import { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../config/theme';
import { fadeSlideIn, springPop } from '../config/animations';

interface Alliance {
  id: string;
  name: string;
  ticker: string;
  challenge: string;
  category: string;
  members: number;
  tvl: string;
  tvlRaw: number;
  change24h: number;
  verified: boolean;
  hot?: boolean;
}

interface Props {
  alliance: Alliance | null;
  visible: boolean;
  onClose: () => void;
  onJoin: (alliance: Alliance) => void;
  joined: boolean;
}

function tierColor(tvlRaw: number): string {
  if (tvlRaw >= 30000) return Colors.tier1;
  if (tvlRaw >= 15000) return Colors.tier2;
  if (tvlRaw >= 8000) return Colors.tier3;
  return Colors.tier4;
}

const MILESTONES = [
  { label: 'Launch fine-tuning dataset', target: 500, icon: 'server-outline' as const },
  { label: 'Fund shared eval infra', target: 1000, icon: 'flask-outline' as const },
  { label: 'Collective GPU pool', target: 2500, icon: 'hardware-chip-outline' as const },
];

const RECENT_LOGS = [
  { actor: '@dev_0x4f', metric: 'Pass@1 +18%', ago: '2m ago' },
  { actor: '@neural_k', metric: 'Latency -34ms', ago: '11m ago' },
  { actor: '@zk_forge', metric: 'Tool success +22%', ago: '28m ago' },
];

export default function AllianceDetailModal({ alliance, visible, onClose, onJoin, joined }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const joinAnim = useRef(new Animated.Value(1)).current;
  const [localJoined, setLocalJoined] = useState(joined);

  useEffect(() => {
    setLocalJoined(joined);
  }, [joined]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      fadeSlideIn(slideAnim, 0, 280).start();
    }
  }, [visible]);

  if (!alliance) return null;

  const color = tierColor(alliance.tvlRaw);
  const isPositive = alliance.change24h >= 0;
  const membersProgress = Math.min(alliance.members / MILESTONES[0].target, 1);

  const handleJoin = () => {
    if (localJoined) return;
    springPop(joinAnim).start();
    setLocalJoined(true);
    onJoin(alliance);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}
        >
          <Pressable>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={[styles.header, { borderLeftColor: color }]}>
              <View style={styles.headerLeft}>
                <View style={styles.tickerRow}>
                  <Text style={[styles.ticker, { color }]}>{alliance.ticker}</Text>
                  {alliance.verified && (
                    <Ionicons name="checkmark-circle" size={14} color={color} style={{ marginLeft: 4 }} />
                  )}
                  {alliance.hot && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotText}>🔥 HOT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.name}>{alliance.name}</Text>
                <Text style={styles.challenge}>{alliance.challenge}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color }]}>{alliance.members}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color }]}>${alliance.tvl}</Text>
                <Text style={styles.statLabel}>TVL</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: isPositive ? Colors.success : Colors.error }]}>
                  {isPositive ? '+' : ''}{alliance.change24h}%
                </Text>
                <Text style={styles.statLabel}>24h</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              {/* Milestone progress */}
              <Text style={styles.sectionTitle}>Alliance Milestone</Text>
              <View style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  <Ionicons name={MILESTONES[0].icon} size={16} color={color} />
                  <Text style={styles.milestoneLabel}>{MILESTONES[0].label}</Text>
                </View>
                <View style={styles.milestoneTrack}>
                  <View style={[styles.milestoneFill, { width: `${membersProgress * 100}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.milestoneProgress}>
                  {alliance.members} / {MILESTONES[0].target} members
                  {'  '}
                  <Text style={{ color }}>{Math.round(membersProgress * 100)}%</Text>
                </Text>
              </View>

              {/* Recent optimization logs */}
              <Text style={styles.sectionTitle}>Recent Logs</Text>
              {RECENT_LOGS.map((log, i) => (
                <View key={i} style={styles.logRow}>
                  <View style={styles.logDot} />
                  <View style={styles.logContent}>
                    <Text style={styles.logActor}>{log.actor}</Text>
                    <Text style={[styles.logMetric, { color }]}>{log.metric}</Text>
                  </View>
                  <Text style={styles.logAgo}>{log.ago}</Text>
                </View>
              ))}

              {/* Fee info */}
              <View style={styles.feeRow}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.feeText}>Submit an optimization log for 0.10 USDC · 50% burns DBC</Text>
              </View>

              <View style={{ height: Spacing.xl }} />
            </ScrollView>

            {/* Join CTA */}
            <View style={styles.ctaWrap}>
              <Animated.View style={{ transform: [{ scale: joinAnim }] }}>
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: localJoined ? Colors.surface : color }, localJoined && styles.joinBtnJoined]}
                  onPress={handleJoin}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={localJoined ? 'checkmark-circle' : 'add-circle-outline'}
                    size={18}
                    color={localJoined ? Colors.success : Colors.bg}
                  />
                  <Text style={[styles.joinText, { color: localJoined ? Colors.success : Colors.bg }]}>
                    {localJoined ? 'Joined Alliance' : `Join ${alliance.ticker}`}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: 34,
    maxHeight: '88%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderLeftWidth: 3,
    marginLeft: Spacing.lg,
    paddingLeft: Spacing.md,
    marginRight: Spacing.lg,
    borderRadius: Radius.sm,
  },
  headerLeft: { flex: 1 },
  tickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ticker: { ...Typography.label, fontSize: 13 },
  hotBadge: {
    backgroundColor: 'rgba(255,165,0,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  hotText: { fontSize: 10, color: '#FFA500', fontWeight: '700' },
  name: { ...Typography.h3, marginBottom: 4 },
  challenge: { ...Typography.caption, color: Colors.textSecondary },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h3, fontSize: 18 },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  scroll: { paddingHorizontal: Spacing.lg },
  sectionTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: Spacing.md },
  milestoneCard: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  milestoneLabel: { ...Typography.body, flex: 1 },
  milestoneTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  milestoneFill: { height: '100%', borderRadius: 3 },
  milestoneProgress: { ...Typography.caption, color: Colors.textMuted },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  logDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  logContent: { flex: 1 },
  logActor: { ...Typography.caption, color: Colors.textSecondary },
  logMetric: { ...Typography.label, fontSize: 12 },
  logAgo: { ...Typography.caption, color: Colors.textMuted },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.bg,
    borderRadius: Radius.sm,
  },
  feeText: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  ctaWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  joinBtnJoined: {
    borderWidth: 1,
    borderColor: Colors.success,
  },
  joinText: { ...Typography.label, fontSize: 15 },
});
