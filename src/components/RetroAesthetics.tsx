import { useState, useEffect } from "preact/hooks";

// 80s/90s style modal system
export function RetroModal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;

    return (
        <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-mono">
            <div class="bg-gray-200 border-4 border-gray-400 shadow-2xl max-w-2xl w-full relative">
                {/* Title Bar */}
                <div class="bg-blue-800 text-white px-4 py-2 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-white border border-black"></div>
                        <span class="font-bold text-sm">{title}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        class="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs border border-black"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div class="p-6 bg-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}

// 80s style infomercial popup
export function InfomercialPopup({ show, onClose }: any) {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
        {
            title: "BREAKTHROUGH TREATMENT ACCESS!",
            text: "Doctors HATE this one simple trick! Access treatments the FDA doesn't want you to know about!",
            price: "NORMALLY $500... TODAY ONLY $49.95!",
            cta: "CALL NOW!"
        },
        {
            title: "DON'T WAIT - SUPPLIES LIMITED!",
            text: "This underground network has saved HUNDREDS of lives! But big pharma is trying to SHUT US DOWN!",
            price: "PLUS get FREE consultation with Dr. Vass in Mexico!",
            cta: "JOIN TODAY!"
        },
        {
            title: "BUT WAIT - THERE'S MORE!",
            text: "Join now and get access to our EXCLUSIVE member-only treatments from around the world!",
            price: "A $2000 value - ABSOLUTELY FREE!",
            cta: "BECOME A MEMBER!"
        }
    ];

    useEffect(() => {
        if (show) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [show]);

    if (!show) return null;

    const currentSlideData = slides[currentSlide];

    return (
        <div class="fixed top-4 right-4 z-50 font-mono">
            <div class="bg-yellow-300 border-4 border-red-600 shadow-lg max-w-sm animate-pulse">
                <div class="bg-red-600 text-white text-center py-1 font-bold text-xs">
                    ★ LIMITED TIME OFFER ★
                </div>
                
                <div class="p-4 text-center">
                    <h3 class="font-bold text-sm mb-2 text-red-800">
                        {currentSlideData.title}
                    </h3>
                    
                    <p class="text-xs mb-3 text-black leading-tight">
                        {currentSlideData.text}
                    </p>
                    
                    <div class="bg-yellow-400 border-2 border-red-600 p-2 mb-3">
                        <div class="font-bold text-xs text-red-800">
                            {currentSlideData.price}
                        </div>
                    </div>
                    
                    <button class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 border-2 border-black mb-2 w-full">
                        {currentSlideData.cta}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        class="text-xs text-gray-600 hover:text-black underline"
                    >
                        Close
                    </button>
                </div>
                
                <div class="bg-blue-800 text-white text-center py-1 text-xs">
                    Act fast! This offer expires in {60 - currentSlide * 20} minutes!
                </div>
            </div>
        </div>
    );
}

// 80s computer terminal aesthetic
export function RetroTerminal({ children }: any) {
    return (
        <div class="bg-black border-4 border-gray-600 p-4 font-mono shadow-2xl">
            <div class="bg-green-900 text-green-400 p-3 border-2 border-green-600">
                <div class="flex items-center gap-2 mb-2 text-xs">
                    <div class="w-2 h-2 bg-green-400 animate-pulse"></div>
                    <span>DALLAS_BUYERS_CLUB_v1.85</span>
                    <div class="ml-auto">SECURE_CONN</div>
                </div>
                <div class="text-xs opacity-75 mb-3">
                    C:\UNDERGROUND\NETWORK&gt; ACCESS_GRANTED
                </div>
                {children}
            </div>
        </div>
    );
}

// 80s style alert box
export function RetroAlert({ type, message, onClose }: any) {
    const getAlertStyle = () => {
        switch (type) {
            case 'warning': return 'bg-yellow-200 border-yellow-600 text-yellow-900';
            case 'error': return 'bg-red-200 border-red-600 text-red-900';
            case 'info': return 'bg-blue-200 border-blue-600 text-blue-900';
            default: return 'bg-gray-200 border-gray-600 text-gray-900';
        }
    };

    return (
        <div class={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${getAlertStyle()} border-4 shadow-lg font-mono max-w-md`}>
            <div class="bg-gray-400 px-3 py-1 flex justify-between items-center">
                <span class="font-bold text-sm">System Alert</span>
                <button 
                    onClick={onClose}
                    class="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs"
                >
                    X
                </button>
            </div>
            <div class="p-4">
                <p class="text-sm">{message}</p>
                <div class="mt-3 flex gap-2">
                    <button 
                        onClick={onClose}
                        class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-xs font-bold border-2 border-black"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

// 80s style loading screen
export function RetroLoading({ message = "LOADING..." }: any) {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div class="bg-black text-green-400 p-8 font-mono text-center border-4 border-green-600">
            <div class="text-xl mb-4">
                {message}{dots}
            </div>
            <div class="w-full bg-green-900 border-2 border-green-600 h-4 mb-4">
                <div class="bg-green-400 h-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <div class="text-xs opacity-75">
                Please wait while we establish secure connection...
            </div>
        </div>
    );
}

// 80s style button
export function RetroButton({ children, onClick, variant = 'primary', ...props }: any) {
    const getButtonStyle = () => {
        switch (variant) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 text-white border-red-800';
            case 'success': return 'bg-green-600 hover:bg-green-700 text-white border-green-800';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-black border-yellow-800';
            default: return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-800';
        }
    };

    return (
        <button 
            onClick={onClick}
            class={`
                ${getButtonStyle()} 
                font-mono font-bold px-4 py-2 border-4 shadow-lg 
                transition-all duration-100 active:shadow-none active:translate-x-1 active:translate-y-1
            `}
            {...props}
        >
            {children}
        </button>
    );
}

// 80s style notification badge
export function RetroBadge({ children, color = 'red' }: any) {
    const colorClass = {
        red: 'bg-red-600 text-white border-red-800',
        green: 'bg-green-600 text-white border-green-800',
        yellow: 'bg-yellow-400 text-black border-yellow-600',
        blue: 'bg-blue-600 text-white border-blue-800'
    }[color];

    return (
        <span class={`${colorClass} font-mono font-bold text-xs px-2 py-1 border-2 animate-pulse`}>
            {children}
        </span>
    );
}

// Audio effects component
export function AudioEffects() {
    const playSound = (soundType: string) => {
        // In a real implementation, you'd load and play audio files
        // For now, we'll use Web Audio API to create simple sounds
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        switch (soundType) {
            case 'beep':
                const beepOsc = audioContext.createOscillator();
                const beepGain = audioContext.createGain();
                beepOsc.connect(beepGain);
                beepGain.connect(audioContext.destination);
                beepOsc.frequency.setValueAtTime(800, audioContext.currentTime);
                beepGain.gain.setValueAtTime(0.1, audioContext.currentTime);
                beepGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                beepOsc.start();
                beepOsc.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'alert':
                const alertOsc = audioContext.createOscillator();
                const alertGain = audioContext.createGain();
                alertOsc.connect(alertGain);
                alertGain.connect(audioContext.destination);
                alertOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
                alertGain.gain.setValueAtTime(0.1, audioContext.currentTime);
                alertOsc.start();
                alertOsc.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'typing':
                // Simple click sound
                const clickOsc = audioContext.createOscillator();
                const clickGain = audioContext.createGain();
                clickOsc.connect(clickGain);
                clickGain.connect(audioContext.destination);
                clickOsc.frequency.setValueAtTime(400, audioContext.currentTime);
                clickGain.gain.setValueAtTime(0.05, audioContext.currentTime);
                clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                clickOsc.start();
                clickOsc.stop(audioContext.currentTime + 0.05);
                break;
        }
    };

    // Auto-play ambient sounds
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                playSound('beep');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="fixed bottom-4 left-4 z-30">
            <div class="bg-gray-800 text-green-400 font-mono text-xs p-2 border-2 border-gray-600">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-400 animate-pulse"></div>
                    <span>AUDIO_SYS_ACTIVE</span>
                </div>
            </div>
        </div>
    );
}