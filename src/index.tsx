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
import { AllianceTicker } from "./components/LiveActivityFeed";
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
import { DisclaimerBanner } from "./components/LegalComponents";
import { ProgressiveOnboarding } from "./components/ProgressiveOnboarding";
import { RetryFlowBanners } from "./components/RetryFlowBanners";
import { MobileNav } from "./components/MobileNav";
import { useState, useEffect } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { ChainConfigBanner } from "./components/ChainConfigBanner";
import { useConsent } from "./hooks/useConsent";
import { useSettings } from "./context/SettingsContext";

// Route-level code splitting: keep initial bundle small.
const Home: any = lazy(() => import("./pages/home").then((m) => ({ default: m.Home })));
const AlliancesPage: any = lazy(() => import("./pages/alliances").then((m) => ({ default: m.default })));
const SubmitPage: any = lazy(() => import("./pages/submit").then((m) => ({ default: m.default })));
const Validators: any = lazy(() => import("./pages/validators").then((m) => ({ default: m.default })));
const AttentionTokens: any = lazy(() => import("./pages/attention-tokens").then((m) => ({ default: m.default })));
const Products: any = lazy(() => import("./pages/products").then((m) => ({ default: m.Products })));
const Links: any = lazy(() => import("./pages/links").then((m) => ({ default: m.Links })));
const Membership: any = lazy(() => import("./pages/membership").then((m) => ({ default: m.Membership })));
const Achievements: any = lazy(() => import("./pages/achievements").then((m) => ({ default: m.Achievements })));
const Referrals: any = lazy(() => import("./pages/referrals").then((m) => ({ default: m.Referrals })));
const Underground: any = lazy(() => import("./pages/underground").then((m) => ({ default: m.default })));
const FleetPage: any = lazy(() => import("./pages/agents").then((m) => ({ default: m.default })));
const Pricing: any = lazy(() => import("./pages/pricing").then((m) => ({ default: m.Pricing })));
const ApiDocs: any = lazy(() => import("./pages/api-docs").then((m) => ({ default: m.default })));
const NotFound: any = lazy(() => import("./pages/_404").then((m) => ({ default: m.NotFound })));

import "./style.css";

export function App() {
    const { notification, showNotification } = useNotification();
    const { settings } = useSettings();
    const funMode = settings.popupsEnabled;
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    // Show progressive onboarding on first visit
    useEffect(() => {
        const seen = localStorage.getItem('dbc-progressive-onboarding');
        if (!seen) {
            // Small delay to let app render first
            const timer = setTimeout(() => setShowOnboarding(true), 500);
            return () => clearTimeout(timer);
        } else {
            setOnboardingComplete(true);
        }
    }, []);

    return (
        <ThemeProvider>
            <SettingsProvider>
                <WalletProvider>
                    <ToastProvider>
                        <LocationProvider>
                            <SwipeGestures>
                            {/* Progressive onboarding (replaces Terms + Privacy modal stack) */}
                            <ProgressiveOnboarding
                                isOpen={showOnboarding}
                                onComplete={() => {
                                    setShowOnboarding(false);
                                    setOnboardingComplete(true);
                                }}
                            />

                            {/* Mobile Progress & Live Counter — fun-mode only (off by default) */}
                            {funMode && <ProgressTracker />}
                            {funMode && <LiveCounter />}

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

                                <div class="w-full p-4 sm:p-6 lg:p-10 pb-44 lg:pb-28">
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
                                                <Route path="/alliances" component={AlliancesPage} />
                                                <Route path="/submit" component={SubmitPage} />
                                                <Route path="/validators" component={Validators} />
                                                <Route path="/attention-tokens" component={AttentionTokens} />
                                                <Route path="/products" component={Products} />
                                                <Route path="/links" component={Links} />
                                                <Route path="/membership" component={Membership} />
                                                <Route path="/achievements" component={Achievements} />
                                                <Route path="/referrals" component={Referrals} />
                                                <Route path="/underground" component={Underground} />
                                                <Route path="/agents" component={FleetPage} />
                                                <Route path="/pricing" component={Pricing} />
                                                <Route path="/api-docs" component={ApiDocs} />
                                                <Route default component={NotFound} />
                                            </Router>
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                            </div>
                            <ErrorBoundary>
                                <AllianceTicker />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <Footer />
                            </ErrorBoundary>

                            {/* Mobile Enhancements — FAB is fun-mode only; ScrollToTop stays (utility) */}
                            {funMode && <FloatingActionButton />}
                            <ScrollToTop />
                            <NotificationToast notification={notification} />

                            {/* Retry flow banners for incomplete actions */}
                            <RetryFlowBanners />

                            {/* Authentic 90s Experience */}
                            <Authentic90sPopups />
                            <LiveActivityNotifications />
                            <WinnerPopup />

                            {/* Settings */}
                            <SettingsPanel />

                            {/* Legal: Persistent disclaimer banner */}
                            {onboardingComplete && <DisclaimerBanner variant="minimal" />}
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
