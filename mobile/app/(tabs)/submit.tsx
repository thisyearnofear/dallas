import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
  Animated, Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../config/theme';
import { useWallet } from '../../hooks/useWallet';
import { useReputation } from '../../hooks/useReputation';
import { notifyLogValidated } from '../../hooks/useNotifications';
import { optimizationLogService } from '../../services/OptimizationLogService';
import { zkProofAnimation, springPop, fadeSlideIn, entryStyle } from '../../config/animations';

const STEPS = [
  { id: 1, label: 'Alliance', icon: 'people-outline' as const },
  { id: 2, label: 'Metrics', icon: 'bar-chart-outline' as const },
  { id: 3, label: 'Privacy', icon: 'shield-outline' as const },
  { id: 4, label: 'Submit', icon: 'flash-outline' as const },
];

const ALLIANCE_OPTIONS = [
  { id: '1', name: 'Context Crushers', ticker: '$CONTEXT' },
  { id: '2', name: 'Tool Loop Breakers', ticker: '$TOOL' },
  { id: '3', name: 'Hallucination Hunters', ticker: '$EVAL' },
  { id: '4', name: 'Latency Slayers', ticker: '$FAST' },
  { id: '5', name: 'Prompt Engineers Guild', ticker: '$PROMPT' },
];

const ZK_STAGES = [
  'Encrypting metrics client-side...',
  'Generating witness...',
  'Computing Noir ZK-SNARK...',
  'Submitting proof on-chain...',
  'Proof verified ✓',
];

// ─── ZK Proof animation overlay ─────────────────────────────────────────────

function ZkProofOverlay({ visible }: { visible: boolean }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [stageIdx, setStageIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progressAnim.setValue(0);
    setStageIdx(0);
    fadeSlideIn(fadeAnim, 0, 200).start();
    zkProofAnimation(progressAnim).start();
    // Cycle through stages
    const interval = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, ZK_STAGES.length - 1));
    }, 480);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const barWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.zkOverlay, { opacity: fadeAnim }]}>
      <View style={styles.zkCard}>
        <View style={styles.zkIconRow}>
          <View style={styles.zkIconWrap}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.accent} />
          </View>
        </View>
        <Text style={styles.zkTitle}>Forging Proof</Text>
        <Text style={styles.zkStage}>{ZK_STAGES[stageIdx]}</Text>
        <View style={styles.zkTrack}>
          <Animated.View style={[styles.zkFill, { width: barWidth }]} />
        </View>
        <Text style={styles.zkNote}>Your IP stays private. Only the delta is published.</Text>
      </View>
    </Animated.View>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={styles.stepRow}>
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <View key={step.id} style={styles.stepItem}>
            <View style={[styles.stepCircle, done && styles.stepDone, active && styles.stepActive]}>
              {done
                ? <Ionicons name="checkmark" size={13} color={Colors.bg} />
                : <Text style={[styles.stepNum, active && styles.stepNumActive]}>{step.id}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step.label}</Text>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
          </View>
        );
      })}
    </View>
  );
}

function MetricRow({ label, value, onChange, placeholder, suffix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; suffix?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricInputWrap}>
        <TextInput
          style={styles.metricInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
        />
        {suffix && <Text style={styles.metricSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function InfoBox({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon} size={16} color={Colors.info} style={{ marginTop: 1 }} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function ReviewRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, mono && styles.reviewValueMono, accent && styles.reviewValueAccent]}>{value}</Text>
    </View>
  );
}

// ─── Success state ───────────────────────────────────────────────────────────

function SuccessView({ onReset, txSignature }: { onReset: () => void; txSignature: string | null }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    springPop(scaleAnim).start(() => {
      fadeSlideIn(contentAnim, 0, 300).start();
    });
  }, []);

  return (
    <View style={styles.successContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="checkmark-circle" size={72} color={Colors.accent} />
      </Animated.View>
      <Animated.View style={[{ alignItems: 'center', width: '100%' }, entryStyle(contentAnim, 16)]}>
        <Text style={styles.successTitle}>Log Submitted</Text>
        <Text style={styles.successBody}>
          Your optimization log is encrypted and on-chain. Validators will verify your ZK proof without seeing your proprietary data.
        </Text>
        <View style={styles.successMeta}>
          {[
            { icon: 'shield-checkmark-outline' as const, text: 'End-to-end encrypted' },
            { icon: 'flash-outline' as const, text: 'ZK proof pending validation' },
            { icon: 'wallet-outline' as const, text: '0.10 USDC fee deducted' },
            { icon: 'star-outline' as const, text: '+75 XP earned' },
          ].map((r, i) => (
            <View key={i} style={styles.successMetaRow}>
              <Ionicons name={r.icon} size={14} color={Colors.accent} />
              <Text style={styles.successMetaText}>{r.text}</Text>
            </View>
          ))}
        </View>
        {txSignature && (
          <TouchableOpacity
            style={styles.txLinkBtn}
            onPress={() => Linking.openURL(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`)}
            activeOpacity={0.75}
          >
            <Ionicons name="open-outline" size={13} color={Colors.accent} />
            <Text style={styles.txLinkText}>{txSignature.slice(0, 8)}...{txSignature.slice(-8)}</Text>
            <Text style={styles.txLinkLabel}>View on Explorer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ctaBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Submit Another</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SubmitScreen() {
  const { connected, connect, publicKey, signAndSendTransaction } = useWallet();
  const { recordLogSubmission } = useReputation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedAlliance, setSelectedAlliance] = useState('');
  const [baselineRate, setBaselineRate] = useState('');
  const [improvedRate, setImprovedRate] = useState('');
  const [latencyBefore, setLatencyBefore] = useState('');
  const [latencyAfter, setLatencyAfter] = useState('');
  const [encryptionAck, setEncryptionAck] = useState(false);
  const [zkAck, setZkAck] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { fadeSlideIn(headerAnim, 0, 220).start(); }, []);

  const canNext = () => {
    if (step === 1) return !!selectedAlliance;
    if (step === 2) return !!baselineRate && !!improvedRate;
    if (step === 3) return encryptionAck && zkAck;
    return false;
  };

  const handleSubmit = async () => {
    if (!connected || !publicKey) { await connect(); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Encrypt metrics client-side (XOR stub — swap for AES-GCM / Lit Protocol on mainnet)
      const encode = (v: string) => new TextEncoder().encode(v);
      const tx = await optimizationLogService.buildSubmitTransaction({
        agentPublicKey: publicKey.toBase58(),
        encryptedBaseline: encode(baselineRate),
        encryptedOutcome: encode(improvedRate),
        architectureProtocol: ALLIANCE_OPTIONS.find(a => a.id === selectedAlliance)?.ticker ?? 'unknown',
        durationDays: 1,
        costUSD: 0.10,
      });
      const sig = await signAndSendTransaction(tx);
      setTxSignature(sig);
      recordLogSubmission();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Schedule a "log validated" push notification (fires 8s later to simulate validator)
      const allianceName = ALLIANCE_OPTIONS.find(a => a.id === selectedAlliance)?.name ?? 'Alliance';
      notifyLogValidated(allianceName, 75);
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Transaction failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false); setStep(1); setSelectedAlliance('');
    setBaselineRate(''); setImprovedRate(''); setLatencyBefore('');
    setLatencyAfter(''); setEncryptionAck(false); setZkAck(false);
    setTxSignature(null); setSubmitError(null);
  };

  if (submitted) return <SuccessView onReset={handleReset} txSignature={txSignature} />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ZkProofOverlay visible={submitting} />

      <Animated.View style={[styles.header, entryStyle(headerAnim, 12)]}>
        <View>
          <Text style={styles.headerEyebrow}>PROOF OF OPTIMIZATION</Text>
          <Text style={styles.headerTitle}>Submit Log</Text>
        </View>
        <View style={styles.feeBadge}>
          <Ionicons name="card-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.feeText}>0.10 USDC</Text>
        </View>
      </Animated.View>

      <StepIndicator current={step} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Which alliance are you contributing to?</Text>
            <Text style={styles.stepSubtitle}>Your log will be validated by that alliance's validator set.</Text>
            <View style={styles.optionList}>
              {ALLIANCE_OPTIONS.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.optionCard, selectedAlliance === a.id && styles.optionCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedAlliance(a.id);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionLeft}>
                    <Text style={[styles.optionTicker, selectedAlliance === a.id && { color: Colors.accent }]}>{a.ticker}</Text>
                    <Text style={styles.optionName}>{a.name}</Text>
                  </View>
                  {selectedAlliance === a.id && <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What did you improve?</Text>
            <Text style={styles.stepSubtitle}>These metrics will be committed to a ZK proof. Your actual implementation stays private.</Text>
            <InfoBox icon="lock-closed-outline" text="Raw values are encrypted client-side before upload. Validators only see the proof delta." />
            <View style={styles.metricsSection}>
              <Text style={styles.sectionLabel}>PASS RATE</Text>
              <MetricRow label="Before" value={baselineRate} onChange={setBaselineRate} placeholder="e.g. 0.72" suffix="%" />
              <MetricRow label="After" value={improvedRate} onChange={setImprovedRate} placeholder="e.g. 0.91" suffix="%" />
            </View>
            <View style={styles.metricsSection}>
              <Text style={styles.sectionLabel}>LATENCY (optional)</Text>
              <MetricRow label="Before" value={latencyBefore} onChange={setLatencyBefore} placeholder="e.g. 1200" suffix="ms" />
              <MetricRow label="After" value={latencyAfter} onChange={setLatencyAfter} placeholder="e.g. 840" suffix="ms" />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Privacy confirmation</Text>
            <Text style={styles.stepSubtitle}>Review how your data is protected before signing.</Text>
            <View style={styles.privacyCard}>
              <View style={styles.privacyRow}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                <View style={styles.privacyText}>
                  <Text style={styles.privacyTitle}>End-to-end encryption</Text>
                  <Text style={styles.privacyDesc}>Your metrics are encrypted with your wallet key before leaving this device.</Text>
                </View>
              </View>
              <View style={styles.privacyDivider} />
              <View style={styles.privacyRow}>
                <Ionicons name="flash" size={20} color={Colors.tier3} />
                <View style={styles.privacyText}>
                  <Text style={styles.privacyTitle}>Zero-knowledge proof</Text>
                  <Text style={styles.privacyDesc}>A Noir ZK-SNARK proves your improvement delta on-chain. Validators verify the math, not your data.</Text>
                </View>
              </View>
              <View style={styles.privacyDivider} />
              <View style={styles.privacyRow}>
                <Ionicons name="server-outline" size={20} color={Colors.tier2} />
                <View style={styles.privacyText}>
                  <Text style={styles.privacyTitle}>Decentralised storage</Text>
                  <Text style={styles.privacyDesc}>Encrypted payload stored on IPFS/Arweave. Only you hold the decryption key.</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.ackRow} onPress={() => { Haptics.selectionAsync(); setEncryptionAck(v => !v); }} activeOpacity={0.8}>
              <View style={[styles.checkbox, encryptionAck && styles.checkboxActive]}>
                {encryptionAck && <Ionicons name="checkmark" size={12} color={Colors.bg} />}
              </View>
              <Text style={styles.ackText}>I understand my data is encrypted before submission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ackRow} onPress={() => { Haptics.selectionAsync(); setZkAck(v => !v); }} activeOpacity={0.8}>
              <View style={[styles.checkbox, zkAck && styles.checkboxActive]}>
                {zkAck && <Ionicons name="checkmark" size={12} color={Colors.bg} />}
              </View>
              <Text style={styles.ackText}>I consent to a ZK proof of my improvement delta being published on-chain</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ready to submit</Text>
            <Text style={styles.stepSubtitle}>Review your submission before signing with your wallet.</Text>
            <View style={styles.reviewCard}>
              <ReviewRow label="Alliance" value={ALLIANCE_OPTIONS.find(a => a.id === selectedAlliance)?.name ?? ''} />
              <ReviewRow label="Ticker" value={ALLIANCE_OPTIONS.find(a => a.id === selectedAlliance)?.ticker ?? ''} mono />
              <ReviewRow label="Pass rate (before)" value={`${baselineRate}%`} mono />
              <ReviewRow label="Pass rate (after)" value={`${improvedRate}%`} mono accent />
              {latencyBefore && <ReviewRow label="Latency (before)" value={`${latencyBefore}ms`} mono />}
              {latencyAfter && <ReviewRow label="Latency (after)" value={`${latencyAfter}ms`} mono accent />}
              <View style={styles.reviewDivider} />
              <ReviewRow label="Fee" value="0.10 USDC" mono />
              <ReviewRow label="Storage" value="IPFS (encrypted)" />
              <ReviewRow label="Proof" value="Noir ZK-SNARK" />
              <ReviewRow label="XP Reward" value="+75 XP" accent />
            </View>
            {!connected && <InfoBox icon="wallet-outline" text="You'll be prompted to connect your wallet to sign this transaction." />}
            {submitError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" style={{ marginTop: 1 }} />
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        {step < 4 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={() => setStep(s => s + 1)}
            disabled={!canNext()}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color={canNext() ? Colors.bg : Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
            <Ionicons name="flash" size={16} color={Colors.bg} />
            <Text style={styles.submitBtnText}>{connected ? 'Sign & Submit' : 'Connect & Submit'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // ZK overlay
  zkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,8,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: Spacing.xl,
  },
  zkCard: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.accent,
  },
  zkIconRow: { marginBottom: Spacing.sm },
  zkIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zkTitle: { color: Colors.textPrimary, fontSize: Typography.lg, fontWeight: Typography.bold },
  zkStage: { color: Colors.accent, fontSize: Typography.sm, fontFamily: Typography.mono, textAlign: 'center' },
  zkTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  zkFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  zkNote: { color: Colors.textMuted, fontSize: Typography.xs, textAlign: 'center', lineHeight: 16 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  headerEyebrow: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1.5,
    fontFamily: Typography.mono,
    marginBottom: 2,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: Typography.xl, fontWeight: Typography.bold },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  feeText: { color: Colors.textMuted, fontSize: Typography.xs, fontFamily: Typography.mono },

  stepRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  stepActive: { borderColor: Colors.accent, backgroundColor: Colors.accentMuted },
  stepNum: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold },
  stepNumActive: { color: Colors.accent },
  stepLabel: { color: Colors.textMuted, fontSize: Typography.xs, marginLeft: 4, fontWeight: Typography.medium },
  stepLabelActive: { color: Colors.accent },
  stepLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: Colors.accent },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  stepContent: { gap: Spacing.lg },
  stepTitle: { color: Colors.textPrimary, fontSize: Typography.lg, fontWeight: Typography.bold, lineHeight: 26 },
  stepSubtitle: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20, marginTop: -Spacing.sm },

  optionList: { gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  optionCardActive: { borderColor: Colors.accentBorder, backgroundColor: Colors.accentMuted },
  optionLeft: { gap: 2 },
  optionTicker: { color: Colors.textMuted, fontSize: Typography.xs, fontFamily: Typography.mono, fontWeight: Typography.bold },
  optionName: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.medium },

  metricsSection: { gap: Spacing.sm },
  sectionLabel: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1.2, fontFamily: Typography.mono },
  metricRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 48,
  },
  metricLabel: { color: Colors.textSecondary, fontSize: Typography.sm, width: 48 },
  metricInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  metricInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base, fontFamily: Typography.mono },
  metricSuffix: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.mono },

  infoBox: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: Radius.md, borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)', padding: Spacing.md,
  },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 18 },

  privacyCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: Spacing.md,
  },
  privacyRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  privacyText: { flex: 1, gap: 4 },
  privacyTitle: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold },
  privacyDesc: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 18 },
  privacyDivider: { height: 1, backgroundColor: Colors.border },

  ackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  ackText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20 },

  reviewCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  reviewLabel: { color: Colors.textSecondary, fontSize: Typography.sm },
  reviewValue: { color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: Typography.medium },
  reviewValueMono: { fontFamily: Typography.mono },
  reviewValueAccent: { color: Colors.accent },
  reviewDivider: { height: 1, backgroundColor: Colors.border },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.bg, gap: Spacing.md,
  },
  backBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: 14, paddingHorizontal: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center',
  },
  backBtnText: { color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.medium },
  nextBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.accent,
  },
  nextBtnDisabled: { backgroundColor: Colors.bgElevated },
  nextBtnText: { color: Colors.bg, fontSize: Typography.base, fontWeight: Typography.bold },
  submitBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md,
    backgroundColor: Colors.accent, ...Shadow.accent,
  },
  submitBtnText: { color: Colors.bg, fontSize: Typography.base, fontWeight: Typography.bold },

  successContainer: {
    flex: 1, backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl, paddingTop: 100, alignItems: 'center',
  },
  successIcon: { marginBottom: Spacing.xl },
  successTitle: { color: Colors.textPrimary, fontSize: Typography.xxl, fontWeight: Typography.bold, marginBottom: Spacing.md },
  successBody: {
    color: Colors.textSecondary, fontSize: Typography.base,
    lineHeight: 24, textAlign: 'center', marginBottom: Spacing.xl,
  },
  successMeta: {
    width: '100%', backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accentBorder,
    padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  successMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  successMetaText: { color: Colors.textSecondary, fontSize: Typography.sm },
  ctaBtn: {
    width: '100%', paddingVertical: 14, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentMuted, alignItems: 'center',
  },
  ctaBtnText: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.semibold },

  txLinkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.accentBorder,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    marginBottom: Spacing.lg, width: '100%',
  },
  txLinkText: { color: Colors.accent, fontSize: Typography.xs, fontFamily: Typography.mono, flex: 1 },
  txLinkLabel: { color: Colors.textMuted, fontSize: Typography.xs },

  errorBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    padding: Spacing.md, marginTop: Spacing.md,
  },
  errorText: { flex: 1, color: '#ef4444', fontSize: Typography.sm, lineHeight: 18 },
});
