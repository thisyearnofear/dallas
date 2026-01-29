import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface Settings {
  popupsEnabled: boolean;
  liveNotificationsEnabled: boolean;
  soundEnabled: boolean;
  tokenPromotions: TokenPromotion[];
}

interface TokenPromotion {
  tokenMint: string;
  count: number;
  lastPromoted: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleSetting: (key: keyof Settings) => void;
  addTokenPromotion: (tokenMint: string) => void;
  getTokenPromotionCount: (tokenMint: string) => number;
}

const DEFAULT_SETTINGS: Settings = {
  popupsEnabled: true,
  liveNotificationsEnabled: true,
  soundEnabled: false,
  tokenPromotions: [],
};

const STORAGE_KEY = "dallas-settings";

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ComponentChildren }) {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addTokenPromotion = (tokenMint: string) => {
    setSettings((prev) => {
      const existing = prev.tokenPromotions.find(p => p.tokenMint === tokenMint);
      if (existing) {
        return {
          ...prev,
          tokenPromotions: prev.tokenPromotions.map(p =>
            p.tokenMint === tokenMint
              ? { ...p, count: p.count + 1, lastPromoted: Date.now() }
              : p
          )
        };
      }
      return {
        ...prev,
        tokenPromotions: [
          ...prev.tokenPromotions,
          { tokenMint, count: 1, lastPromoted: Date.now() }
        ]
      };
    });
  };

  const getTokenPromotionCount = (tokenMint: string): number => {
    return settings.tokenPromotions.find(p => p.tokenMint === tokenMint)?.count || 0;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, toggleSetting, addTokenPromotion, getTokenPromotionCount }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
