import { useState, useEffect } from "preact/hooks";
import { useSettings } from "../context/SettingsContext";
import { PrivacyTooltip } from "./PrivacyTooltip";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'privacy'>('general');
  const { settings, toggleSetting } = useSettings();

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    defaultCompression: 10,
    autoEncrypt: true,
    showPrivacyScore: true,
    shareAnalytics: false,
  });

  // Load privacy settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dbc-privacy-settings');
    if (saved) {
      setPrivacySettings(JSON.parse(saved));
    }
  }, []);

  const updatePrivacySetting = (key: keyof typeof privacySettings, value: any) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    localStorage.setItem('dbc-privacy-settings', JSON.stringify(updated));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        class="fixed bottom-20 right-4 z-40 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 transition-all transform hover:scale-110 active:scale-95"
        aria-label="Settings"
      >
        <span class="text-xl">⚙️</span>
      </button>

      {isOpen && (
        <div class="fixed inset-0 bg-slate-900/80 dark:bg-black/80 z-[10001] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div class="bg-white dark:bg-slate-900 border-4 border-yellow-500 rounded-2xl shadow-2xl max-w-md w-full font-mono overflow-hidden animate-scaleIn transition-colors duration-300">
            {/* Header */}
            <div class="bg-yellow-500 dark:bg-yellow-600 text-black px-6 py-4 flex justify-between items-center border-b-2 border-yellow-600">
              <span class="font-black text-xs uppercase tracking-[0.2em]">⚙️ Protocol_Settings</span>
              <button
                onClick={() => setIsOpen(false)}
                class="bg-red-500 hover:bg-red-600 text-white font-black px-3 py-1 rounded border-2 border-red-700 shadow-md transition-all active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div class="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('general')}
                class={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'general'
                    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-b-2 border-yellow-500'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                ⚙️ General
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                class={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-b-2 border-green-500'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                🔐 Privacy
              </button>
            </div>

            {/* Settings */}
            <div class="p-8 space-y-6">
              {activeTab === 'general' ? (
                <>
                  <div class="text-yellow-700 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Customize your Dallas Network experience
                  </div>

                  <div class="space-y-4">
                    {/* 90s Popups Toggle */}
                    <SettingToggle
                      label="90s Spam Popups"
                      description="Authentic retro popup ads (VISITOR #420!, etc.)"
                      enabled={settings.popupsEnabled}
                      onToggle={() => toggleSetting("popupsEnabled")}
                    />

                    {/* Live Notifications Toggle */}
                    <SettingToggle
                      label="Live Activity Notifications"
                      description="Real-time network activity feed"
                      enabled={settings.liveNotificationsEnabled}
                      onToggle={() => toggleSetting("liveNotificationsEnabled")}
                    />

                    {/* Sound Toggle */}
                    <SettingToggle
                      label="Sound Effects"
                      description="Retro computer sounds (coming soon)"
                      enabled={settings.soundEnabled}
                      onToggle={() => toggleSetting("soundEnabled")}
                      disabled
                    />
                  </div>
                </>
              ) : (
                <>
                  <div class="text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Control your privacy preferences
                  </div>

                  <div class="space-y-4">
                    {/* Default Compression */}
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <span class="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter">Default Storage Saver</span>
                          <PrivacyTooltip topic="compression" variant="icon"><span></span></PrivacyTooltip>
                        </div>
                      </div>
                      <select
                        value={privacySettings.defaultCompression}
                        onChange={(e) => updatePrivacySetting('defaultCompression', parseInt((e.target as HTMLSelectElement).value))}
                        class="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value={5}>Standard (5x savings)</option>
                        <option value={10}>Recommended (10x savings)</option>
                        <option value={20}>Maximum (20x savings)</option>
                      </select>
                    </div>

                    {/* Auto-Encrypt Toggle */}
                    <SettingToggle
                      label="Auto-Encrypt Submissions"
                      description="Automatically encrypt all case studies with your wallet key"
                      enabled={privacySettings.autoEncrypt}
                      onToggle={() => updatePrivacySetting('autoEncrypt', !privacySettings.autoEncrypt)}
                    />

                    {/* Show Privacy Score Toggle */}
                    <SettingToggle
                      label="Show Privacy Score"
                      description="Display privacy score during form submissions"
                      enabled={privacySettings.showPrivacyScore}
                      onToggle={() => updatePrivacySetting('showPrivacyScore', !privacySettings.showPrivacyScore)}
                    />

                    {/* Privacy Stats */}
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <h4 class="text-xs font-black text-green-800 dark:text-green-300 uppercase tracking-widest mb-3">Your Privacy Stats</h4>
                      <div class="space-y-2 text-xs">
                        <div class="flex justify-between">
                          <span class="text-slate-600 dark:text-slate-400">Data encrypted:</span>
                          <span class="font-bold text-green-600 dark:text-green-400">{localStorage.getItem('dbc-encrypted-count') || '0'} items</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600 dark:text-slate-400">Storage saved:</span>
                          <span class="font-bold text-green-600 dark:text-green-400">{localStorage.getItem('dbc-storage-saved') || '0'} KB</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600 dark:text-slate-400">ZK proofs generated:</span>
                          <span class="font-bold text-green-600 dark:text-green-400">{localStorage.getItem('dbc-zk-count') || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <div class="pt-6 border-t border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-[0.2em]">
                Configurations saved to local state
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function SettingToggle({ label, description, enabled, onToggle, disabled }: SettingToggleProps) {
  return (
    <div class={`flex items-center justify-between p-4 rounded-xl transition-all border border-transparent ${disabled ? "opacity-40" : "bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-sm"}`}>
      <div class="flex-1 pr-4">
        <div class="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter mb-1">{label}</div>
        <div class="text-slate-500 dark:text-slate-400 text-[10px] font-medium leading-tight">{description}</div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        class={`relative w-12 h-6 rounded-full transition-all shadow-inner ${
          enabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:brightness-110"}`}
      >
        <div
          class={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
