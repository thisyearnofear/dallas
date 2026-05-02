import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";
import { WalletProvider } from "./context/WalletContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";

// Import polyfills for browser compatibility
import "./polyfills";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ViralSidebar } from "./components/ViralSidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import {
    FloatingActionButton,
    ScrollToTop,
    LiveCounter,
    ProgressTracker,
    SwipeGestures,
    NotificationToast,
    useNotification
} from "./components/MobileEnhancements";
import { InfomercialPopup } from "./components/RetroAesthetics";
import { Authentic90sPopups, LiveActivityNotifications, WinnerPopup } from "./components/Authentic90sPopups";
import { TermsAcceptanceModal, DisclaimerBanner } from "./components/SharedUIComponents";
import { PrivacyOnboardingModal } from "./components/PrivacyOnboardingModal";
import { MobileNav } from "./components/MobileNav";
import { useConsent } from "./hooks/useConsent";
import { useState, useEffect } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { ChainConfigBanner } from "./components/ChainConfigBanner";

// Route-level code splitting: keep initial bundle small.
const Home: any = lazy(() => import("./pages/home").then((m) => ({ default: m.Home })));
const Experiences: any = lazy(() => import("./pages/experiences").then((m) => ({ default: m.Experiences })));
const Validators: any = lazy(() => import("./pages/validators").then((m) => ({ default: m.default })));
const AttentionTokens: any = lazy(() => import("./pages/attention-tokens").then((m) => ({ default: m.default })));
const Products: any = lazy(() => import("./pages/products").then((m) => ({ default: m.Products })));
const Links: any = lazy(() => import("./pages/links").then((m) => ({ default: m.Links })));
const Donate: any = lazy(() => import("./pages/donate").then((m) => ({ default: m.Donate })));
const Membership: any = lazy(() => import("./pages/membership").then((m) => ({ default: m.Membership })));
const Achievements: any = lazy(() => import("./pages/achievements").then((m) => ({ default: m.Achievements })));
const Referrals: any = lazy(() => import("./pages/referrals").then((m) => ({ default: m.Referrals })));
const Underground: any = lazy(() => import("./pages/underground").then((m) => ({ default: m.default })));
const FleetPage: any = lazy(() => import("./pages/agents").then((m) => ({ default: m.default })));
const PilotDashboard: any = lazy(() => import("./pages/pilot").then((m) => ({ default: m.default })));
const NotFound: any = lazy(() => import("./pages/_404").then((m) => ({ default: m.NotFound })));

import "./style.css";

export function App() {
    const { notification, showNotification } = useNotification();
    const { termsAccepted, acceptTerms, needsTermsUpdate, isLoading } = useConsent();
    const [showPrivacyOnboarding, setShowPrivacyOnboarding] = useState(false);

    // Show terms modal if not accepted or needs update
    const showTermsModal = !isLoading && (!termsAccepted || needsTermsUpdate);

    // Show privacy onboarding after terms are accepted (first time only)
    useEffect(() => {
        if (termsAccepted && !isLoading) {
            const hasSeenPrivacyOnboarding = localStorage.getItem('dbc-privacy-onboarding');
            if (!hasSeenPrivacyOnboarding) {
                // Small delay to let terms modal close first
                const timer = setTimeout(() => {
                    setShowPrivacyOnboarding(true);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [termsAccepted, isLoading]);

    return (
        <ThemeProvider>
            <SettingsProvider>
                <WalletProvider>
                    <ToastProvider>
                        <LocationProvider>
                            <SwipeGestures>
                            {/* Legal: Terms acceptance modal (first-time or version update) */}
                            <TermsAcceptanceModal isOpen={showTermsModal} onAccept={acceptTerms} />

                            {/* Privacy onboarding (first-time users) */}
                            <PrivacyOnboardingModal
                                isOpen={showPrivacyOnboarding}
                                onComplete={() => setShowPrivacyOnboarding(false)}
                            />

                            {/* Mobile Progress & Live Counter */}
                            <ProgressTracker />
                            <LiveCounter />

                            <ErrorBoundary>
                                <ChainConfigBanner />
                                <Header />
                            </ErrorBoundary>
                            <div class="flex flex-1 relative items-stretch">
                                {/* Desktop Navbar - only render on large screens */}
                                <ErrorBoundary>
                                    <Navbar />
                                </ErrorBoundary>

                                {/* Mobile Bottom Navigation */}
                                <ErrorBoundary>
                                    <MobileNav />
                                </ErrorBoundary>

                                <div class="w-full p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10">
                                    <ErrorBoundary>
                                        <Suspense
                                            fallback={
                                                <div class="min-h-[60vh] flex items-center justify-center">
                                                    <div class="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                        Loading…
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <Router>
                                                <Route path="/" component={Home} />
                                                <Route path="/experiences" component={Experiences} />
                                                <Route path="/validators" component={Validators} />
                                                <Route path="/attention-tokens" component={AttentionTokens} />
                                                <Route path="/products" component={Products} />
                                                <Route path="/links" component={Links} />
                                                <Route path="/donate" component={Donate} />
                                                <Route path="/membership" component={Membership} />
                                                <Route path="/achievements" component={Achievements} />
                                                <Route path="/referrals" component={Referrals} />
                                                <Route path="/underground" component={Underground} />
                                                <Route path="/agents" component={FleetPage} />
                                                <Route path="/pilot" component={PilotDashboard} />
                                                <Route default component={NotFound} />
                                            </Router>
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                            </div>
                            <ErrorBoundary>
                                <Footer />
                            </ErrorBoundary>

                            {/* Mobile Enhancements */}
                            <FloatingActionButton />
                            <ScrollToTop />
                            <NotificationToast notification={notification} />

                            {/* Authentic 90s Experience */}
                            <Authentic90sPopups />
                            <LiveActivityNotifications />
                            <WinnerPopup />

                            {/* Settings */}
                            <SettingsPanel />

                            {/* Legal: Persistent disclaimer banner */}
                            {termsAccepted && <DisclaimerBanner variant="minimal" />}
                            <ToastContainer />
                        </SwipeGestures>
                        </LocationProvider>
                    </ToastProvider>
                </WalletProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}

render(<App />, document.getElementById("app"));
