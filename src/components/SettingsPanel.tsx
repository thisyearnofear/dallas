import { useState } from "preact/hooks";
import { useSettings } from "../context/SettingsContext";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting } = useSettings();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        class="fixed bottom-20 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg border-2 border-gray-600"
        aria-label="Settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <div class="fixed inset-0 bg-black/70 z-[10001] flex items-center justify-center p-4">
          <div class="bg-gray-900 border-4 border-yellow-500 rounded-lg shadow-2xl max-w-md w-full font-mono">
            {/* Header */}
            <div class="bg-yellow-600 text-black px-4 py-2 flex justify-between items-center">
              <span class="font-bold text-lg">⚙️ SETTINGS</span>
              <button
                onClick={() => setIsOpen(false)}
                class="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-sm border border-black rounded"
              >
                ✕
              </button>
            </div>

            {/* Settings */}
            <div class="p-4 space-y-4">
              <div class="text-yellow-400 text-sm mb-4">
                🎛️ Customize your Dallas Buyers Club experience
              </div>

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

              {/* Footer */}
              <div class="pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
                Settings are saved locally in your browser
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
    <div class={`flex items-center justify-between p-3 rounded ${disabled ? "opacity-50" : "hover:bg-gray-800"}`}>
      <div class="flex-1">
        <div class="text-white font-bold text-sm">{label}</div>
        <div class="text-gray-400 text-xs">{description}</div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        class={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-green-600" : "bg-gray-600"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          class={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
