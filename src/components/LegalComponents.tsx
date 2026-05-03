// LEGAL COMPONENTS - Integrated following Core Principles (enhancing SharedUIComponents)
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

import { useState, useEffect } from "preact/hooks";
import { 
  DISCLAIMER_BANNER, 
  SUBMISSION_CONSENT, 
  TERMS_OF_SERVICE, 
  PRIVACY_POLICY,
  DISCOVERY_DISCLAIMER 
} from '../config/legal';

// Persistent disclaimer banner for bottom of screen
export function DisclaimerBanner({ variant = 'minimal' }: { variant?: 'minimal' | 'full' }) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed && variant === 'minimal') return null;
  
  return (
    <div class="fixed bottom-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900/95 border-t-2 border-yellow-400 dark:border-yellow-600 px-6 py-3 z-40 shadow-2xl backdrop-blur-md transition-all">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <div class="flex items-center gap-4 text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm font-bold">
          <span class="text-2xl animate-bounce">⚠️</span>
          <span class="leading-relaxed">{variant === 'full' ? DISCLAIMER_BANNER.full : DISCLAIMER_BANNER.short}</span>
        </div>
        {variant === 'minimal' && (
          <button 
            onClick={() => setDismissed(true)}
            class="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-300 dark:hover:text-yellow-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-yellow-400 dark:border-yellow-600 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Pre-submission consent checkboxes (integrates into forms)
export function SubmissionConsentCheckboxes({ 
  onAllChecked 
}: { 
  onAllChecked: (allChecked: boolean) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const allRequired = SUBMISSION_CONSENT.checkboxes
      .filter(c => c.required)
      .every(c => checked[c.id]);
    onAllChecked(allRequired);
  }, [checked, onAllChecked]);
  
  return (
    <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-yellow-500/30 rounded-2xl shadow-inner transition-colors">
      <div class="text-yellow-700 dark:text-yellow-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <span>{SUBMISSION_CONSENT.title}</span>
      </div>
      <div class="space-y-3">
        {SUBMISSION_CONSENT.checkboxes.map((item) => (
          <label key={item.id} class="flex items-start gap-4 cursor-pointer group p-2 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                checked={checked[item.id] || false}
                onChange={(e) => setChecked(prev => ({ 
                  ...prev, 
                  [item.id]: (e.target as HTMLInputElement).checked 
                }))}
                class="sr-only peer"
              />
              <div class="w-5 h-5 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-green-500 peer-checked:border-green-600 transition-all shadow-sm"></div>
              <svg class="absolute w-3.5 h-3.5 text-white left-[3px] top-[3px] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed">
              {item.label}
              {item.required && <span class="text-red-500 ml-1.5 font-black">*</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Terms of Service modal content
export function TermsOfServiceContent() {
  return (
    <div class="text-sm space-y-6 pr-4 font-medium leading-relaxed">
      {TERMS_OF_SERVICE.sections.map((section, i) => (
        <div key={i} class="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-100 dark:border-white/5">
          <h4 class="font-black text-green-700 dark:text-green-400 mb-3 uppercase tracking-tighter flex items-center gap-2">
            <span class="w-1.5 h-4 bg-green-500 rounded-full"></span>
            {section.heading}
          </h4>
          <p class="whitespace-pre-line text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

// Privacy Policy modal content
export function PrivacyPolicyContent() {
  return (
    <div class="text-sm space-y-6 pr-4 font-medium leading-relaxed">
      {PRIVACY_POLICY.sections.map((section, i) => (
        <div key={i} class="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-100 dark:border-white/5">
          <h4 class="font-black text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-tighter flex items-center gap-2">
            <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
            {section.heading}
          </h4>
          <p class="whitespace-pre-line text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

// First-time terms acceptance modal - lightweight, non-intrusive
export function TermsAcceptanceModal({ 
  isOpen, 
  onAccept 
}: { 
  isOpen: boolean; 
  onAccept: () => void;
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div class="fixed inset-0 bg-slate-900/90 dark:bg-black/95 z-[100] flex items-center justify-center p-4 font-mono backdrop-blur-xl transition-all duration-500">
        <div class="bg-white dark:bg-slate-900 border-2 border-green-500/50 shadow-2xl max-w-md w-full rounded-2xl overflow-hidden transform animate-scaleIn">
          {/* Title Bar */}
          <div class="bg-green-600 text-white px-6 py-5 border-b border-green-700 flex items-center gap-3">
            <div class="text-2xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">🏥</div>
            <div>
              <span class="font-black uppercase tracking-[0.2em] text-sm block">Verification Protocol</span>
              <span class="text-[9px] font-bold opacity-70 uppercase tracking-widest">Dallas_Buyers_Club_Devnet</span>
            </div>
          </div>
          
          {/* Content */}
          <div class="p-8">
            <p class="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-6 tracking-tight">
              A privacy-first community for sharing agent architecture experiments. 
              This is <strong class="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-1 rounded">not production advice</strong>.
            </p>
            
            <p class="text-slate-600 dark:text-slate-400 text-xs font-medium mb-8 leading-relaxed">
              By continuing, you acknowledge our mission and agree to our{' '}
              <button 
                onClick={() => setShowTerms(true)} 
                class="text-green-600 dark:text-green-400 underline decoration-dotted underline-offset-4 hover:text-green-700 dark:hover:text-green-300 font-black transition-colors"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                onClick={() => setShowPrivacy(true)} 
                class="text-green-600 dark:text-green-400 underline decoration-dotted underline-offset-4 hover:text-green-700 dark:hover:text-green-300 font-black transition-colors"
              >
                Privacy Policy
              </button>.
            </p>
            
            <button
              onClick={onAccept}
              class="w-full py-4 font-black text-lg rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl border border-green-500 uppercase tracking-widest"
            >
              Enter Club
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Terms Modal */}
      {showTerms && (
        <div class="fixed inset-0 bg-slate-900/95 dark:bg-black/90 z-[110] flex items-center justify-center p-4 font-mono backdrop-blur-md">
          <div class="bg-white dark:bg-slate-900 border-2 border-green-500 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-slideUp">
            <div class="bg-green-600 text-white px-6 py-4 flex justify-between items-center border-b border-green-700 shadow-md">
              <span class="font-black uppercase tracking-[0.2em] text-sm">Terms of Service</span>
              <button 
                onClick={() => setShowTerms(false)} 
                class="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <TermsOfServiceContent />
            </div>
            <div class="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 text-center">
              <button onClick={() => setShowTerms(false)} class="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Close Document</button>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Privacy Modal */}
      {showPrivacy && (
        <div class="fixed inset-0 bg-slate-900/95 dark:bg-black/90 z-[110] flex items-center justify-center p-4 font-mono backdrop-blur-md">
          <div class="bg-white dark:bg-slate-900 border-2 border-green-500 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-slideUp">
            <div class="bg-green-600 text-white px-6 py-4 flex justify-between items-center border-b border-green-700 shadow-md">
              <span class="font-black uppercase tracking-[0.2em] text-sm">Privacy Policy</span>
              <button 
                onClick={() => setShowPrivacy(false)} 
                class="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <PrivacyPolicyContent />
            </div>
            <div class="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 text-center">
              <button onClick={() => setShowPrivacy(false)} class="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Close Document</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Discovery results disclaimer (inline)
export function DiscoveryDisclaimer() {
  return (
    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-5 rounded-2xl text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 shadow-sm transition-all animate-fadeIn">
      <div class="flex items-start gap-4">
        <span class="text-2xl animate-pulse">⚠️</span>
        <div class="font-bold leading-relaxed">{DISCOVERY_DISCLAIMER}</div>
      </div>
    </div>
  );
}
