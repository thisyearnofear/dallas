import { useState } from "preact/hooks";
import { useSettings } from "../context/SettingsContext";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting } = useSettings();

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

            {/* Settings */}
            <div class="p-8 space-y-6">
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
