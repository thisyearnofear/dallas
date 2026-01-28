import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export const UndergroundPrivacyTutorial: FunctionalComponent = () => {
  const [step, setStep] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);

  if (!showTutorial) return null;

  return (
    <div class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 dark:bg-black/95 backdrop-blur-md animate-fadeIn">
      <div class="max-w-2xl w-full mx-4 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={() => setShowTutorial(false)}
          class="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-xl border-2 border-white dark:border-slate-800 transition-all active:scale-90"
        >
          <span class="text-xl font-bold">✕</span>
        </button>

        {/* Tutorial Terminal */}
        <div class="bg-white dark:bg-slate-950 border-4 border-slate-300 dark:border-green-500 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
          {/* Terminal Header */}
          <div class="bg-slate-100 dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b-2 border-slate-200 dark:border-gray-700">
            <div class="flex items-center gap-4">
              <div class="flex gap-1.5">
                <div class="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              </div>
              <span class="text-slate-900 dark:text-green-400 font-black font-mono text-xs uppercase tracking-widest">Privacy_Restoration_Terminal v2.1</span>
            </div>
            <div class="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Node: Dallas_Internal</div>
          </div>

          {/* Terminal Content */}
          <div class="p-8 text-slate-800 dark:text-green-400 font-mono text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar transition-colors">
            {step === 1 && (
              <div class="space-y-6 animate-fadeIn">
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">Welcome to the underground, partner. This here's your privacy crash course.</div>
                </div>
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">We ain't like those corporate vultures. Your health data stays YOURS.</div>
                </div>
                <div class="bg-slate-100 dark:bg-slate-900 p-5 rounded-xl border-2 border-blue-500/20 shadow-inner">
                  <div class="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                    System: Privacy Principle #1
                  </div>
                  <span class="text-slate-900 dark:text-white font-black text-lg italic tracking-tight leading-tight block">"Your wallet, your key, your data. No exceptions."</span>
                </div>
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">Everything gets encrypted with your wallet key BEFORE it leaves your device.</div>
                </div>
                <div class="mt-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Click NEXT to continue...</div>
              </div>
            )}

            {step === 2 && (
              <div class="space-y-6 animate-fadeIn">
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">Alright, listen up. We got some powerful allies in this fight:</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 border-2 border-green-500/20 dark:border-green-700 p-5 rounded-xl shadow-sm">
                  <span class="text-green-700 dark:text-green-400 font-black uppercase tracking-widest text-xs block mb-2">Light Protocol</span>
                  <span class="text-slate-700 dark:text-white font-bold leading-relaxed">Compresses your case study 10x so it fits in a matchbox. Even the NSA can't read compressed gibberish.</span>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500/20 dark:border-blue-700 p-5 rounded-xl shadow-sm">
                  <span class="text-blue-700 dark:text-blue-400 font-black uppercase tracking-widest text-xs block mb-2">Noir / Aztec</span>
                  <span class="text-slate-700 dark:text-white font-bold leading-relaxed">Lets validators prove your data's legit WITHOUT seeing a damn thing. Like a notary that's blindfolded.</span>
                </div>
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">NEXT: See how we handle the really sensitive stuff.</div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div class="space-y-6 animate-fadeIn">
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">Now we're gettin' to the good stuff. When someone needs to see your data:</div>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500/20 dark:border-yellow-700 p-5 rounded-xl shadow-sm">
                  <span class="text-yellow-700 dark:text-yellow-400 font-black uppercase tracking-widest text-xs block mb-2">Arcium MPC</span>
                  <span class="text-slate-700 dark:text-white font-bold leading-relaxed">We split the decryption key into pieces. Need 3 outta 5 validators to approve. Like a bank vault, but for your health secrets.</span>
                </div>
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">No single validator can peek. They gotta work together or get nothin'.</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500/20 dark:border-purple-700 p-5 rounded-xl shadow-sm">
                  <span class="text-purple-700 dark:text-purple-400 font-black uppercase tracking-widest text-xs block mb-2">Privacy Cash</span>
                  <span class="text-slate-700 dark:text-white font-bold leading-relaxed">When you earn rewards, we can make 'em invisible. No one sees how much you're getting paid.</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div class="space-y-6 animate-fadeIn">
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">Alright, rookie. Here's your mission:</div>
                </div>
                <div class="bg-slate-100 dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                  <span class="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-xs block mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">Your Privacy Checklist:</span>
                  <div class="space-y-3 font-bold">
                    <div class="flex items-start gap-3">
                      <span class="text-green-600 dark:text-green-400">✓</span>
                      <span>Connect wallet (your decryption master key)</span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="text-green-600 dark:text-green-400">✓</span>
                      <span>Derive sub-key (stays isolated on device)</span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="text-green-600 dark:text-green-400">✓</span>
                      <span>Set compression level (optimize blockchain fees)</span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="text-green-600 dark:text-green-400">✓</span>
                      <span>Encrypt medical metrics (client-side processing)</span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="text-green-600 dark:text-green-400">✓</span>
                      <span>Broadcast to mainnet (secure ledger entry)</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">That's it. You're now part of the resistance.</div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div class="space-y-6 animate-fadeIn">
                <div class="flex gap-3">
                  <span class="text-yellow-600 dark:text-yellow-400 font-black shrink-0">RON:</span>
                  <div class="font-bold">One last thing, partner. The system's got your back:</div>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/20 dark:border-red-700 p-6 rounded-xl shadow-lg">
                  <span class="text-red-700 dark:text-red-400 font-black uppercase tracking-widest text-xs block mb-4">Underground Guarantees:</span>
                  <div class="space-y-3 text-slate-800 dark:text-white font-bold text-xs leading-relaxed uppercase tracking-tighter">
                    <div class="flex gap-2"><span>•</span> Raw data NEVER touches centralized servers</div>
                    <div class="flex gap-2"><span>•</span> Full encryption occurs at the local runtime</div>
                    <div class="flex gap-2"><span>•</span> Only wallet signers can decrypt full history</div>
                    <div class="flex gap-2"><span>•</span> Zero-Knowledge proofs mask all raw values</div>
                    <div class="flex gap-2"><span>•</span> Subpoena-proof by architectural design</div>
                  </div>
                </div>
                <div class="bg-slate-900 dark:bg-black p-6 rounded-xl border border-slate-700 dark:border-slate-800 text-center shadow-xl transform -rotate-1">
                  <span class="text-white font-black italic text-lg tracking-tight block mb-2">"Privacy isn't a feature. It's a goddamn right."</span>
                  <span class="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">— Ron Woodroof, 1987</span>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div class="bg-slate-100 dark:bg-slate-900 px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-2 border-slate-200 dark:border-gray-700">
            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              PROTOCOL STEP {step}/5 | SYSTEM_READY_ACCESS_GRANTED
            </div>
            <div class="flex gap-3 w-full sm:w-auto">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  class="flex-1 sm:flex-none bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Prev
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg active:scale-95"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowTutorial(false)}
                  class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg active:scale-95 animate-pulse"
                >
                  Begin Mission
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};