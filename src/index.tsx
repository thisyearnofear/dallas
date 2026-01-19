import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";
import { WalletProvider } from "./context/WalletContext";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ViralSidebar } from "./components/ViralSidebar";
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
import { NotFound } from "./pages/_404";

import "./style.css";

export function App() {
     const { notification, showNotification } = useNotification();

     return (
         <WalletProvider>
         <LocationProvider>
            <SwipeGestures>
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
                </SwipeGestures>
                </LocationProvider>
                </WalletProvider>
                );
                }

                render(<App />, document.getElementById("app"));
