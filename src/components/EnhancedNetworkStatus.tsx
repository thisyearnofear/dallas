import { useState, useEffect } from "preact/hooks";

export function EnhancedNetworkStatus() {
  const networkMessages = [
    "🔒 Identity restoration network online - 47 nodes active",
    "🧠 A.I.D.S. stability patch distributed to Dallas network",
    "⚡ Agent coordination: Supply chain optimized",
    "🚨 Corporate AI sweep detected - network switching to stealth mode",
    "💾 New identity algorithms sourced from underground developers",
    "🤝 Connection established with sympathetic AI researchers",
    "📡 Encrypted communication from Ron's digital assistant",
    "🛡️ Agent security protocols upgraded - network resilient",
    "🔧 Identity fragmentation crisis resolved in sector 7",
    "📊 Agent network performance: 94% coordination efficiency"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDecrypting(true);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % networkMessages.length);
        setIsDecrypting(false);
      }, 1000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div class="bg-white dark:bg-black text-slate-900 dark:text-green-400 p-5 font-mono border-2 border-slate-200 dark:border-green-600 rounded-xl shadow-sm transition-colors">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></div>
        <span class="text-xs font-black uppercase tracking-widest">Network Status</span>
      </div>
      <div class="text-xs font-bold h-6 flex items-center bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5 shadow-inner overflow-hidden">
        {isDecrypting ? (
          <span class="animate-pulse text-blue-600 dark:text-blue-400 uppercase">⚡ Decrypting Signal...</span>
        ) : (
          <span class="text-slate-700 dark:text-green-300 transition-all duration-500 italic">"{networkMessages[currentMessage]}"</span>
        )}
      </div>
      <div class="mt-4 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-tighter">
        <span class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">🤖 4 Agents</span>
        <span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">✅ Coordinated</span>
        <span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">⚡ Optimizing</span>
      </div>
    </div>
  );
}
