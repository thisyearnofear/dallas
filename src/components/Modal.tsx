export function AgentEnhancedModal({ isOpen, onClose, title, children, agentStatus, size = 'default', closeable = true }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  agentStatus?: 'analyzing' | 'coordinating' | 'complete';
  size?: 'default' | 'large' | 'full';
  closeable?: boolean;
}) {
  if (!isOpen) return null;

  const sizeClass = size === 'large' ? 'max-w-4xl' : size === 'full' ? 'max-w-6xl max-h-[90vh]' : 'max-w-2xl';

  return (
    <div class="fixed inset-0 bg-slate-900/80 dark:bg-black/80 z-50 flex items-center justify-center p-4 font-mono backdrop-blur-sm">
      <div class={`bg-slate-50 dark:bg-slate-900 border-4 border-slate-400 dark:border-slate-700 shadow-2xl ${sizeClass} w-full relative rounded-xl overflow-hidden transition-colors duration-300`}>
        <div class="bg-blue-700 dark:bg-blue-900 text-white px-4 py-3 flex justify-between items-center border-b-2 border-slate-300 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-white border border-black rounded-sm shadow-sm"></div>
            <span class="font-black text-xs uppercase tracking-widest">{title}</span>
            {agentStatus && (
              <span class="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                🤖 {agentStatus.toUpperCase()}
              </span>
            )}
          </div>
          {closeable && (
            <button
              onClick={onClose}
              class="bg-red-500 hover:bg-red-600 text-white font-black px-3 py-1 rounded border border-red-700 shadow-md transition-all active:scale-95"
            >
              ✕
            </button>
          )}
        </div>
        <div class={`p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 ${size === 'full' ? 'overflow-y-auto max-h-[calc(90vh-60px)]' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
