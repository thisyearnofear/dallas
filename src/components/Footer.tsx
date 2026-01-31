import { useState } from "preact/hooks";
import { Modal, TermsOfServiceContent, PrivacyPolicyContent } from "./SharedUIComponents";

export function Footer() {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <>
            <footer class="flex flex-wrap justify-between items-center mt-auto border-t-2 border-t-neutral-200 px-5 py-2 pb-12 gap-2">
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
                        href="mailto:underground@dallasbuyers.club"
                    >
                        <span>📧</span> Contact
                    </a>
                </div>
                <div class="flex gap-4 text-sm text-gray-500">
                    <button 
                        onClick={() => setShowTerms(true)}
                        class="hover:text-gray-700 hover:underline"
                    >
                        Terms
                    </button>
                    <button 
                        onClick={() => setShowPrivacy(true)}
                        class="hover:text-gray-700 hover:underline"
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
