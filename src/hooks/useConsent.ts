// Consent management hook - Single source for legal consent state
// Following Core Principles: DRY, MODULAR, CLEAN

import { useState, useEffect, useCallback } from 'preact/hooks';
import { CONSENT_STORAGE_KEYS, LEGAL_CONFIG } from '../config/legal';

interface ConsentState {
  termsAccepted: boolean;
  termsVersion: string | null;
  submissionConsentGiven: boolean;
  isLoading: boolean;
}

interface ConsentActions {
  acceptTerms: () => void;
  giveSubmissionConsent: () => void;
  revokeConsent: () => void;
  needsTermsUpdate: boolean;
}

export function useConsent(): ConsentState & ConsentActions {
  const [isLoading, setIsLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVersion, setTermsVersion] = useState<string | null>(null);
  const [submissionConsentGiven, setSubmissionConsentGiven] = useState(false);

  // Load consent state from localStorage on mount
  useEffect(() => {
    try {
      const storedAccepted = localStorage.getItem(CONSENT_STORAGE_KEYS.termsAccepted);
      const storedVersion = localStorage.getItem(CONSENT_STORAGE_KEYS.termsVersion);
      const storedSubmission = localStorage.getItem(CONSENT_STORAGE_KEYS.submissionConsent);

      setTermsAccepted(storedAccepted === 'true');
      setTermsVersion(storedVersion);
      setSubmissionConsentGiven(storedSubmission === 'true');
    } catch {
      // localStorage may be unavailable
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if terms need re-acceptance (version mismatch)
  const needsTermsUpdate = termsAccepted && termsVersion !== LEGAL_CONFIG.version;

  const acceptTerms = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEYS.termsAccepted, 'true');
      localStorage.setItem(CONSENT_STORAGE_KEYS.termsVersion, LEGAL_CONFIG.version);
      setTermsAccepted(true);
      setTermsVersion(LEGAL_CONFIG.version);
    } catch {
      // Proceed without persistence
      setTermsAccepted(true);
      setTermsVersion(LEGAL_CONFIG.version);
    }
  }, []);

  const giveSubmissionConsent = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEYS.submissionConsent, 'true');
      setSubmissionConsentGiven(true);
    } catch {
      setSubmissionConsentGiven(true);
    }
  }, []);

  const revokeConsent = useCallback(() => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEYS.termsAccepted);
      localStorage.removeItem(CONSENT_STORAGE_KEYS.termsVersion);
      localStorage.removeItem(CONSENT_STORAGE_KEYS.submissionConsent);
    } catch {
      // Continue anyway
    }
    setTermsAccepted(false);
    setTermsVersion(null);
    setSubmissionConsentGiven(false);
  }, []);

  return {
    termsAccepted,
    termsVersion,
    submissionConsentGiven,
    isLoading,
    acceptTerms,
    giveSubmissionConsent,
    revokeConsent,
    needsTermsUpdate,
  };
}
