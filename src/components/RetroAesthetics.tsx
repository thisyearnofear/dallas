
import { Modal, Terminal } from './SharedUIComponents';

export const RetroModal = Modal;
export const RetroTerminal = (props: any) => (
    <div class="border-4 border-slate-400 dark:border-gray-600 p-2 bg-slate-900 dark:bg-black text-green-500 rounded-xl font-mono shadow-2xl transition-colors">
        <Terminal {...props} />
        {props.children}
    </div>
);

export const InfomercialPopup = ({ isOpen, onClose, children }: any) => (
    <Modal isOpen={isOpen} onClose={onClose} title="!! SPECIAL OFFER !!">
        <div class="bg-yellow-300 dark:bg-yellow-400 text-black p-6 font-black border-4 border-red-600 animate-pulse rounded-xl shadow-2xl transform rotate-1">
            <div class="text-center text-2xl mb-4 tracking-tighter uppercase">Limited Time Only!</div>
            {children}
            <div class="text-center text-[10px] mt-4 opacity-70 tracking-widest uppercase">Operators are waiting...</div>
        </div>
    </Modal>
);

export const RetroAlert = ({ type, message, onClose }: any) => (
    <div class={`fixed top-6 right-6 z-[200] p-5 border-4 rounded-xl shadow-2xl font-mono animate-slideInRight ${
        type === 'warning' 
            ? 'bg-red-600 dark:bg-red-900 border-red-400 dark:border-red-500 text-white' 
            : 'bg-slate-800 dark:bg-gray-900 border-slate-600 dark:border-gray-500 text-white'
    }`}>
        <div class="flex justify-between items-center gap-6">
            <div class="flex items-center gap-3 font-black uppercase tracking-tighter text-sm">
                <span class="animate-pulse">⚠️</span>
                <span>{message}</span>
            </div>
            <button 
                onClick={onClose} 
                class="font-black bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-all active:scale-90"
            >
                [X]
            </button>
        </div>
    </div>
);

export const RetroButton = ({ variant, onClick, children }: any) => {
    const colors = {
        primary: 'bg-blue-600 dark:bg-blue-800 hover:bg-blue-500 dark:hover:bg-blue-700 text-white border-blue-800 dark:border-blue-950',
        success: 'bg-green-600 dark:bg-green-800 hover:bg-green-500 dark:hover:bg-green-700 text-white border-green-800 dark:border-green-950',
        danger: 'bg-red-600 dark:bg-red-800 hover:bg-red-500 dark:hover:bg-red-700 text-white border-red-800 dark:border-red-950',
        warning: 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-500 text-black border-yellow-700 dark:border-yellow-800'
    };
    const colorClass = colors[variant as keyof typeof colors] || colors.primary;

    return (
        <button
            onClick={onClick}
            class={`${colorClass} p-3 border-b-4 border-r-4 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all font-mono w-full h-full rounded-xl uppercase font-black text-xs tracking-widest shadow-md active:shadow-none`}
        >
            {children}
        </button>
    );
};

export const RetroBadge = ({ color, children }: any) => {
    let classes = "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 rounded-full shadow-sm ";
    if (color === 'green') classes += "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    else if (color === 'yellow') classes += "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    else classes += "bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-700";

    return <span class={classes}>{children}</span>;
};

export const AudioEffects = () => {
    // Placeholder for audio effects
    return null;
};
