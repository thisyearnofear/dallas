import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../config/theme';
import { staggeredEntrance, entryStyle, fadeSlideIn, pulseLoop } from '../../config/animations';
import AllianceDetailModal from '../../components/AllianceDetailModal';

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

interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  alliance: string;
  ago: string;
}

const CATEGORIES = ['All', 'Context', 'Tools', 'Evals', 'Latency', 'Prompts'];

const SEED_ALLIANCES: Alliance[] = [
  {
    id: '1', name: 'Context Crushers', ticker: '$CONTEXT',
    challenge: 'Context window limits & compression', category: 'Context',
    members: 142, tvl: '12.4K', tvlRaw: 12400, change24h: 4.2, verified: true,
  },
  {
    id: '2', name: 'Tool Loop Breakers', ticker: '$TOOL',
    challenge: 'Tool-calling loops & retry storms', category: 'Tools',
    members: 89, tvl: '8.1K', tvlRaw: 8100, change24h: -1.3, verified: true,
  },
  {
    id: '3', name: 'Hallucination Hunters', ticker: '$EVAL',
    challenge: 'Factual accuracy & eval pipelines', category: 'Evals',
    members: 217, tvl: '31.2K', tvlRaw: 31200, change24h: 11.7, verified: true, hot: true,
  },
  {
    id: '4', name: 'Latency Slayers', ticker: '$FAST',
    challenge: 'Inference latency optimization', category: 'Latency',
    members: 63, tvl: '5.7K', tvlRaw: 5700, change24h: 2.1, verified: false,
  },
  {
    id: '5', name: 'Prompt Engineers Guild', ticker: '$PROMPT',
    challenge: 'Prompt template sharing & versioning', category: 'Prompts',
    members: 304, tvl: '44.8K', tvlRaw: 44800, change24h: 6.8, verified: true, hot: true,
  },
  {
    id: '6', name: 'RAG Architects', ticker: '$RAG',
    challenge: 'Retrieval-augmented generation quality', category: 'Context',
    members: 178, tvl: '19.3K', tvlRaw: 19300, change24h: -0.5, verified: false,
  },
];

const ACTIVITY_FEED: ActivityEvent[] = [
  { id: 'a1', actor: '@dev_0x4f', action: 'submitted a log to', alliance: '$EVAL', ago: '2m ago' },
  { id: 'a2', actor: '@neural_k', action: 'joined', alliance: '$CONTEXT', ago: '5m ago' },
  { id: 'a3', actor: '@agent_77', action: 'validated a proof in', alliance: '$PROMPT', ago: '9m ago' },
  { id: 'a4', actor: '@zk_forge', action: 'submitted a log to', alliance: '$TOOL', ago: '14m ago' },
  { id: 'a5', actor: '@arc_dev', action: 'joined', alliance: '$EVAL', ago: '21m ago' },
];

function tierColor(tvlRaw: number): string {
  if (tvlRaw >= 30000) return Colors.tier1;
  if (tvlRaw >= 15000) return Colors.tier2;
  if (tvlRaw >= 8000) return Colors.tier3;
  return Colors.tier4;
}

// ─── Live activity ticker ────────────────────────────────────────────────────

function ActivityTicker() {
  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    pulseLoop(dotAnim).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setIdx(i => (i + 1) % ACTIVITY_FEED.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const event = ACTIVITY_FEED[idx];

  return (
    <View style={styles.ticker}>
      <Animated.View style={[styles.tickerDot, { opacity: dotAnim }]} />
      <Animated.Text style={[styles.tickerText, { opacity: fadeAnim }]} numberOfLines={1}>
        <Text style={styles.tickerActor}>{event.actor}</Text>
        {' '}{event.action}{' '}
        <Text style={styles.tickerAlliance}>{event.alliance}</Text>
        {'  '}
        <Text style={styles.tickerAgo}>{event.ago}</Text>
      </Animated.Text>
    </View>
  );
}

// ─── Alliance card with stagger animation ────────────────────────────────────

function AllianceCard({ alliance, animValue, onPress }: { alliance: Alliance; animValue: Animated.Value; onPress: () => void }) {
  const color = tierColor(alliance.tvlRaw);
  const isPositive = alliance.change24h >= 0;

  return (
    <Animated.View style={entryStyle(animValue)}>
      <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
        <View style={[styles.accentBar, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.tickerRow}>
              <Text style={[styles.allianceTicker, { color }]}>{alliance.ticker}</Text>
              {alliance.verified && (
                <Ionicons name="checkmark-circle" size={13} color={color} style={{ marginLeft: 4 }} />
              )}
              {alliance.hot && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>🔥 HOT</Text>
                </View>
              )}
            </View>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)' }]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={11}
                color={isPositive ? Colors.success : Colors.error}
              />
              <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
                {isPositive ? '+' : ''}{alliance.change24h}%
              </Text>
            </View>
          </View>

          <Text style={styles.allianceName}>{alliance.name}</Text>
          <Text style={styles.challenge}>{alliance.challenge}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.statText}>{alliance.members} members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.statText}>${alliance.tvl} TVL</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CategoryPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function AlliancesScreen() {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAlliance, setSelectedAlliance] = useState<Alliance | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // One Animated.Value per card slot (max 10)
  const cardAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  const load = async () => {
    await new Promise(r => setTimeout(r, 300));
    setAlliances(SEED_ALLIANCES);
  };

  useEffect(() => {
    load().finally(() => {
      setLoading(false);
      // Animate header then stagger cards
      fadeSlideIn(headerAnim, 0, 220).start(() => {
        staggeredEntrance(cardAnims.slice(0, SEED_ALLIANCES.length), 70).start();
      });
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    staggeredEntrance(cardAnims.slice(0, SEED_ALLIANCES.length), 50).start();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return alliances.filter(a => {
      const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q) || a.challenge.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [alliances, search, activeCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <Animated.View style={[styles.header, entryStyle(headerAnim, 12)]}>
        <View>
          <Text style={styles.headerEyebrow}>AGENT ALLIANCES</Text>
          <Text style={styles.headerTitle}>Find your tribe</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={Colors.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* Live activity ticker */}
      <ActivityTicker />

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search alliances..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map(cat => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.id}
          renderItem={({ item, index }) => (
            <AllianceCard
              alliance={item}
              animValue={cardAnims[index]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedAlliance(item);
                setModalVisible(true);
              }}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No alliances found</Text>
            </View>
          }
        />
      )}

      <AllianceDetailModal
        alliance={selectedAlliance}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        joined={selectedAlliance ? joinedIds.has(selectedAlliance.id) : false}
        onJoin={(a) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setJoinedIds(prev => new Set([...prev, a.id]));
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
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
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Activity ticker
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  tickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    flexShrink: 0,
  },
  tickerText: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.mono,
  },
  tickerActor: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  tickerAlliance: { color: Colors.accent, fontWeight: Typography.bold },
  tickerAgo: { color: Colors.textMuted },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    height: '100%',
  },

  categoriesScroll: { flexGrow: 0, marginBottom: Spacing.sm },
  categories: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  pillActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentMuted,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  pillTextActive: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },

  list: { padding: Spacing.lg, gap: Spacing.md },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.card,
  },
  accentBar: { width: 3, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: Spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tickerRow: { flexDirection: 'row', alignItems: 'center' },
  allianceTicker: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    fontFamily: Typography.mono,
  },
  hotBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  hotText: { fontSize: 9, color: Colors.warning, fontWeight: Typography.bold },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  changeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    fontFamily: Typography.mono,
  },
  allianceName: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    marginBottom: 3,
  },
  challenge: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: Colors.textMuted, fontSize: Typography.xs },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },

  empty: { alignItems: 'center', paddingTop: 64, gap: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: Typography.base },
});
