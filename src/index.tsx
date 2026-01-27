import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";
import { WalletProvider } from "./context/WalletContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";

// Import polyfills for browser compatibility
import "./polyfills";

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
import { useConsent } from "./hooks/useConsent";
import { useState, useEffect } from "preact/hooks";

import { Home } from "./pages/home";
import { Products } from "./pages/products";
import { Links } from "./pages/links";
import { Donate } from "./pages/donate";
import { Membership } from "./pages/membership";
import { Achievements } from "./pages/achievements";
import { Testimonials } from "./pages/testimonials";
import { Referrals } from "./pages/referrals";
import { Underground } from "./pages/underground";
import { Experiences } from "./pages/experiences";
import { Validators } from "./pages/validators";
import { AttentionTokens } from "./pages/attention-tokens";
import { NotFound } from "./pages/_404";

import "./style.css";

export function App() {
    const { notification, showNotification } = useNotification();
    const { termsAccepted, acceptTerms, needsTermsUpdate, isLoading } = useConsent();

    // Show terms modal if not accepted or needs update
    const showTermsModal = !isLoading && (!termsAccepted || needsTermsUpdate);

    return (
        <ThemeProvider>
        <SettingsProvider>
        <WalletProvider>
            <LocationProvider>
                <SwipeGestures>
                    {/* Legal: Terms acceptance modal (first-time or version update) */}
                    <TermsAcceptanceModal isOpen={showTermsModal} onAccept={acceptTerms} />

                    {/* Mobile Progress & Live Counter */}
                    <ProgressTracker />
                    <LiveCounter />

                    <Header />
                    <div class="flex flex-1 relative items-stretch px-2 sm:px-7">
                        <Navbar />
                        <div class="w-full p-4 sm:p-10">
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
                                <Route path="/testimonials" component={Testimonials} />
                                <Route path="/referrals" component={Referrals} />
                                <Route path="/underground" component={Underground} />
                                <Route default component={NotFound} />
                            </Router>
                        </div>
                    </div>
                    <Footer />

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
                </SwipeGestures>
            </LocationProvider>
        </WalletProvider>
        </SettingsProvider>
        </ThemeProvider>
    );
}

render(<App />, document.getElementById("app"));
