import { useState } from "preact/hooks";
import { AgentEnhancedModal as Modal } from "./Modal";
import { TermsOfServiceContent, PrivacyPolicyContent } from "./LegalComponents";

export function Footer() {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <>
            {/* mb-9 = 36px pushes the Footer's bottom edge above the 32px AllianceTicker's
                top edge, so the two 95%-opaque backgrounds no longer visually overlap
                at page-bottom. */}
            <footer class="flex flex-wrap justify-between items-center mt-auto mb-9 border-t-2 border-t-neutral-200 dark:border-t-slate-700 px-5 py-2 pb-4 md:pb-3 gap-2 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm relative">
                <div class="flex gap-4">
                    <a 
                        class="text-brand hover:underline flex items-center gap-1" 
                        href="https://twitter.com/papajimjams"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>🐦</span> Twitter
                    </a>
                    <a 
                        class="text-brand hover:underline flex items-center gap-1" 
                        href="https://t.me/+4Rbq7xHqFXQ5ZjM0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>✈️</span> Telegram
                    </a>
                    <a 
                        class="text-brand hover:underline flex items-center gap-1" 
                        href="/links"
                    >
                        <span>🔒</span> Contact
                    </a>
                </div>
                <div class="flex gap-4 text-sm text-gray-500 dark:text-slate-400">
                    <button 
                        onClick={() => setShowTerms(true)}
                        class="hover:text-gray-700 dark:hover:text-slate-200 hover:underline"
                    >
                        Terms
                    </button>
                    <button 
                        onClick={() => setShowPrivacy(true)}
                        class="hover:text-gray-700 dark:hover:text-slate-200 hover:underline"
                    >
                        Privacy
                    </button>
                </div>
            </footer>

            {/* Terms Modal */}
            <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" size="large">
                <TermsOfServiceContent />
            </Modal>

            {/* Privacy Modal */}
            <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" size="large">
                <PrivacyPolicyContent />
            </Modal>
        </>
    );
}
