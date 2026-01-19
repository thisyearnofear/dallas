import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export const UndergroundPrivacyTutorial: FunctionalComponent = () => {
  const [step, setStep] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);

  if (!showTutorial) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div class="max-w-2xl w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={() => setShowTutorial(false)}
          class="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
        >
          ✕
        </button>

        {/* Tutorial Terminal */}
        <div class="bg-gray-900 border-2 border-green-500 rounded-lg overflow-hidden">
          {/* Terminal Header */}
          <div class="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
            <div class="flex gap-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span class="text-green-400 font-mono text-sm">DALLAS BUYERS CLUB - PRIVACY TERMINAL</span>
          </div>

          {/* Terminal Content */}
          <div class="p-6 text-green-400 font-mono text-sm leading-relaxed">
            {step === 1 && (
              <>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Welcome to the underground, partner. This here's your privacy crash course.
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> We ain't like those corporate vultures. Your health data stays YOURS.
                </div>
                <div class="mb-4 bg-gray-800 p-3 rounded border border-gray-700">
                  <span class="text-blue-400">SYSTEM:</span> <strong>PRIVACY PRINCIPLE #1</strong>
                  <br/>
                  <span class="text-white">"Your wallet, your key, your data. No exceptions."</span>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Everything gets encrypted with your wallet key BEFORE it leaves your device.
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Click NEXT to see how we keep the feds and pharma outta your business.
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Alright, listen up. We got some powerful allies in this fight:
                </div>
                <div class="mb-4 bg-green-900/30 border border-green-700 p-3 rounded">
                  <span class="text-green-400 font-bold">LIGHT PROTOCOL</span>
                  <br/>
                  <span class="text-white">Compresses your case study 10x so it fits in a matchbox. Even the NSA can't read compressed gibberish.</span>
                </div>
                <div class="mb-4 bg-blue-900/30 border border-blue-700 p-3 rounded">
                  <span class="text-blue-400 font-bold">NOIR/AZTEC</span>
                  <br/>
                  <span class="text-white">Lets validators prove your data's legit WITHOUT seeing a damn thing. Like a notary that's blindfolded.</span>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> NEXT: See how we handle the really sensitive stuff.
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Now we're gettin' to the good stuff. When someone needs to see your data:
                </div>
                <div class="mb-4 bg-yellow-900/30 border border-yellow-700 p-3 rounded">
                  <span class="text-yellow-400 font-bold">ARCIUM MPC</span>
                  <br/>
                  <span class="text-white">We split the decryption key into pieces. Need 3 outta 5 validators to approve. Like a bank vault, but for your health secrets.</span>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> No single validator can peek. They gotta work together or get nothin'.
                </div>
                <div class="mb-4 bg-purple-900/30 border border-purple-700 p-3 rounded">
                  <span class="text-purple-400 font-bold">PRIVACY CASH</span>
                  <br/>
                  <span class="text-white">When you earn rewards, we can make 'em invisible. No one sees how much you're getting paid.</span>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> NEXT: Let's talk about what YOU need to do.
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Alright, rookie. Here's your mission:
                </div>
                <div class="mb-4 bg-gray-800 p-3 rounded border border-gray-700">
                  <span class="text-white font-bold">YOUR PRIVACY CHECKLIST:</span>
                  <div class="mt-2 ml-4 space-y-2">
                    <div class="flex items-start gap-2">
                      <span class="text-green-400">✓</span>
                      <span>Connect your wallet (this is your encryption key)</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-green-400">✓</span>
                      <span>Derive your encryption key (this stays on YOUR device)</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-green-400">✓</span>
                      <span>Choose your compression level (10x is a good start)</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-green-400">✓</span>
                      <span>Fill out your case study (this gets encrypted immediately)</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-green-400">✓</span>
                      <span>Submit to the blockchain (now it's in the underground)</span>
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> That's it. You're now part of the resistance.
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> One last thing, partner. The system's got your back:
                </div>
                <div class="mb-4 bg-red-900/30 border border-red-700 p-3 rounded">
                  <span class="text-red-400 font-bold">PRIVACY GUARANTEES:</span>
                  <div class="mt-2 ml-4 space-y-2 text-white">
                    <div>• Your raw data NEVER touches our servers</div>
                    <div>• Encryption happens in YOUR browser</div>
                    <div>• Only YOU can decrypt your full case study</div>
                    <div>• Validators see NOTHING without your approval</div>
                    <div>• We can't comply with subpoenas (we don't HAVE your data)</div>
                  </div>
                </div>
                <div class="mb-4">
                  <span class="text-yellow-400">RON:</span> Now get out there and stick it to the system. And remember...
                </div>
                <div class="bg-black p-4 rounded border border-gray-700 text-center">
                  <span class="text-white font-bold italic">"Privacy isn't a feature. It's a goddamn right."</span>
                  <br/>
                  <span class="text-gray-500 text-xs">- Ron Woodroof, 1987</span>
                </div>
              </>
            )}
          </div>

          {/* Terminal Footer */}
          <div class="bg-gray-800 px-4 py-3 flex justify-between items-center border-t border-gray-700">
            <div class="text-gray-500 text-xs">
              STEP {step}/5 | ESC to exit | F1 for help
            </div>
            <div class="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  class="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded text-xs"
                >
                  PREV
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  class="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-xs"
                >
                  NEXT
                </button>
              ) : (
                <button
                  onClick={() => setShowTutorial(false)}
                  class="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-xs"
                >
                  BEGIN MISSION
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};