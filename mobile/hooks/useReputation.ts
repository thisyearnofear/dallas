// Gamification state — XP, rank, streak, achievements
// Single source of truth for all reputation data across screens
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Rank = 'INITIATE' | 'CONTRIBUTOR' | 'VALIDATOR' | 'ARCHITECT' | 'LEGEND';

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  unlockedAt: number | null; // timestamp ms, null = locked
}

export interface ReputationState {
  xp: number;
  rank: Rank;
  rankProgress: number; // 0–1 within current rank band
  streak: number;       // consecutive days with a submission
  logsSubmitted: number;
  validationsCompleted: number;
  achievements: Achievement[];
}

// XP thresholds per rank
const RANK_THRESHOLDS: Record<Rank, number> = {
  INITIATE: 0,
  CONTRIBUTOR: 200,
  VALIDATOR: 600,
  ARCHITECT: 1500,
  LEGEND: 4000,
};

const RANK_ORDER: Rank[] = ['INITIATE', 'CONTRIBUTOR', 'VALIDATOR', 'ARCHITECT', 'LEGEND'];

// XP rewards per action
export const XP_REWARDS = {
  submitLog: 50,
  logValidated: 120,
  joinAlliance: 30,
  streakBonus: 25,   // per day on top of base
};

const STORAGE_KEY = '@dbc_reputation';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_log',       label: 'First Log',        icon: 'document-text',        unlockedAt: null },
  { id: 'first_alliance',  label: 'Alliance Member',  icon: 'people',               unlockedAt: null },
  { id: 'first_validated', label: 'Proof Verified',   icon: 'shield-checkmark',     unlockedAt: null },
  { id: 'streak_3',        label: '3-Day Streak',     icon: 'flame',                unlockedAt: null },
  { id: 'streak_7',        label: '7-Day Streak',     icon: 'trophy',               unlockedAt: null },
  { id: 'validator_rank',  label: 'Validator Rank',   icon: 'star',                 unlockedAt: null },
  { id: 'legend_rank',     label: 'Legend',           icon: 'diamond',              unlockedAt: null },
];

function rankForXp(xp: number): Rank {
  let rank: Rank = 'INITIATE';
  for (const r of RANK_ORDER) {
    if (xp >= RANK_THRESHOLDS[r]) rank = r;
  }
  return rank;
}

function rankProgress(xp: number): number {
  const rank = rankForXp(xp);
  const idx = RANK_ORDER.indexOf(rank);
  const current = RANK_THRESHOLDS[rank];
  const next = idx < RANK_ORDER.length - 1 ? RANK_THRESHOLDS[RANK_ORDER[idx + 1]] : current + 1000;
  return Math.min((xp - current) / (next - current), 1);
}

const DEFAULT_STATE: ReputationState = {
  xp: 0,
  rank: 'INITIATE',
  rankProgress: 0,
  streak: 0,
  logsSubmitted: 0,
  validationsCompleted: 0,
  achievements: INITIAL_ACHIEVEMENTS,
};

// Seed with demo data so the UI looks alive on first launch
const DEMO_STATE: ReputationState = {
  xp: 720,
  rank: 'VALIDATOR',
  rankProgress: rankProgress(720),
  streak: 7,
  logsSubmitted: 7,
  validationsCompleted: 23,
  achievements: INITIAL_ACHIEVEMENTS.map(a =>
    ['first_log', 'first_alliance', 'first_validated', 'streak_3', 'streak_7'].includes(a.id)
      ? { ...a, unlockedAt: Date.now() - Math.random() * 1e9 }
      : a,
  ),
};

export function useReputation() {
  const [state, setState] = useState<ReputationState>(DEMO_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as ReputationState;
          setState(saved);
        } catch { /* use demo state */ }
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: ReputationState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const xp = prev.xp + amount;
      const rank = rankForXp(xp);
      const progress = rankProgress(xp);
      const achievements = prev.achievements.map(a => {
        if (a.unlockedAt) return a;
        if (a.id === 'validator_rank' && rank === 'VALIDATOR') return { ...a, unlockedAt: Date.now() };
        if (a.id === 'legend_rank' && rank === 'LEGEND') return { ...a, unlockedAt: Date.now() };
        return a;
      });
      const next = { ...prev, xp, rank, rankProgress: progress, achievements };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const recordLogSubmission = useCallback(() => {
    setState(prev => {
      const logsSubmitted = prev.logsSubmitted + 1;
      const streak = prev.streak + 1;
      const xp = prev.xp + XP_REWARDS.submitLog + (streak > 1 ? XP_REWARDS.streakBonus : 0);
      const rank = rankForXp(xp);
      const progress = rankProgress(xp);
      const achievements = prev.achievements.map(a => {
        if (a.unlockedAt) return a;
        if (a.id === 'first_log' && logsSubmitted === 1) return { ...a, unlockedAt: Date.now() };
        if (a.id === 'streak_3' && streak >= 3) return { ...a, unlockedAt: Date.now() };
        if (a.id === 'streak_7' && streak >= 7) return { ...a, unlockedAt: Date.now() };
        if (a.id === 'validator_rank' && rank === 'VALIDATOR') return { ...a, unlockedAt: Date.now() };
        if (a.id === 'legend_rank' && rank === 'LEGEND') return { ...a, unlockedAt: Date.now() };
        return a;
      });
      const next = { ...prev, xp, rank, rankProgress: progress, streak, logsSubmitted, achievements };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const recordAllianceJoin = useCallback(() => {
    setState(prev => {
      const xp = prev.xp + XP_REWARDS.joinAlliance;
      const rank = rankForXp(xp);
      const progress = rankProgress(xp);
      const achievements = prev.achievements.map(a =>
        a.id === 'first_alliance' && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a,
      );
      const next = { ...prev, xp, rank, rankProgress: progress, achievements };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { ...state, loaded, addXp, recordLogSubmission, recordAllianceJoin };
}

export const RANK_COLORS: Record<Rank, string> = {
  INITIATE:    '#888888',
  CONTRIBUTOR: '#3b82f6',
  VALIDATOR:   '#8b5cf6',
  ARCHITECT:   '#f59e0b',
  LEGEND:      '#00ff88',
};

export const RANK_NEXT_XP: (xp: number) => number = (xp) => {
  const rank = rankForXp(xp);
  const idx = RANK_ORDER.indexOf(rank);
  return idx < RANK_ORDER.length - 1 ? RANK_THRESHOLDS[RANK_ORDER[idx + 1]] : RANK_THRESHOLDS.LEGEND;
};
