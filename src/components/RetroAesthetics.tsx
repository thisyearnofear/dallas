
import { Modal, Terminal } from './SharedUIComponents';

export const RetroModal = Modal;
export const RetroTerminal = (props: any) => <div className="border-4 border-gray-600 p-2 bg-black text-green-500 rounded font-mono"><Terminal {...props} />{props.children}</div>;

export const InfomercialPopup = ({ isOpen, onClose, children }: any) => (
    <Modal isOpen={isOpen} onClose={onClose} title="SPECIAL OFFER!">
        <div className="bg-yellow-300 text-black p-4 font-bold border-4 border-red-600 animate-pulse">
            {children}
        </div>
    </Modal>
);

export const RetroAlert = ({ type, message, onClose }: any) => (
    <div className={`fixed top-4 right-4 z-50 p-4 border-4 ${type === 'warning' ? 'bg-red-900 border-red-500 text-white' : 'bg-gray-900 border-gray-500'} font-mono shadow-xl`}>
        <div className="flex justify-between items-center gap-4">
            <span>{message}</span>
            <button onClick={onClose} className="font-bold">[X]</button>
        </div>
    </div>
);

export const RetroButton = ({ variant, onClick, children }: any) => {
    const colors = {
        primary: 'bg-blue-700 hover:bg-blue-600 text-white border-blue-900',
        success: 'bg-green-700 hover:bg-green-600 text-white border-green-900',
        danger: 'bg-red-700 hover:bg-red-600 text-white border-red-900',
        warning: 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-800'
    };
    const colorClass = colors[variant as keyof typeof colors] || colors.primary;

    return (
        <button
            onClick={onClick}
            className={`${colorClass} p-2 border-b-4 border-r-4 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all font-mono w-full h-full`}
        >
            {children}
        </button>
    );
};

export const RetroBadge = ({ color, children }: any) => {
    let classes = "px-2 py-0.5 text-xs font-bold border ";
    if (color === 'green') classes += "bg-green-900 text-green-400 border-green-600";
    else if (color === 'yellow') classes += "bg-yellow-900 text-yellow-400 border-yellow-600";
    else classes += "bg-gray-800 text-gray-400 border-gray-600";

    return <span className={classes}>{children}</span>;
};

export const AudioEffects = () => {
    // Placeholder for audio effects
    return null;
};
