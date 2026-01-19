import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export const RetroPrivacyMeter: FunctionalComponent = () => {
  const [privacyScore, setPrivacyScore] = useState(75);
  const [scoreLevel, setScoreLevel] = useState('GOOD');
  const [scoreColor, setScoreColor] = useState('text-yellow-400');

  // Calculate privacy score level
  useEffect(() => {
    if (privacyScore >= 90) {
      setScoreLevel('EXCELLENT');
      setScoreColor('text-green-400');
    } else if (privacyScore >= 70) {
      setScoreLevel('GOOD');
      setScoreColor('text-yellow-400');
    } else if (privacyScore >= 50) {
      setScoreLevel('FAIR');
      setScoreColor('text-orange-400');
    } else {
      setScoreLevel('POOR');
      setScoreColor('text-red-400');
    }
  }, [privacyScore]);

  // Simulate privacy score changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Random small fluctuations to simulate real usage
      setPrivacyScore(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        return Math.min(100, Math.max(50, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div class="bg-gray-900 border-2 border-green-500 rounded-lg p-4 w-full max-w-sm">
      <div class="text-center mb-3">
        <h3 class="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
          <span>🛡️</span>
          PRIVACY HEALTH SCORE
          <span>🛡️</span>
        </h3>
      </div>

      {/* Retro Meter Display */}
      <div class="bg-black border-4 border-gray-700 rounded-lg p-4 mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-red-500 text-sm font-bold">POOR</span>
          <span class="text-yellow-500 text-sm font-bold">FAIR</span>
          <span class="text-green-500 text-sm font-bold">GOOD</span>
          <span class="text-blue-500 text-sm font-bold">EXCELLENT</span>
        </div>

        {/* Analog Meter */}
        <div class="relative h-24 flex items-end justify-center mb-3">
          <div class="absolute inset-0 flex flex-col justify-between py-2 px-8 text-xs text-gray-500">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Meter Arc */}
          <div class="relative w-32 h-16">
            <svg class="w-full h-full" viewBox="0 0 100 50">
              {/* Meter background */}
              <path d="M 10 40 A 40 40 0 0 1 90 40" stroke="#333" stroke-width="8" fill="none" />
              {/* Meter fill */}
              <path 
                d="M 10 40 A 40 40 0 0 1 90 40"
                stroke="#4ade80"
                stroke-width="8"
                fill="none"
                stroke-dasharray="251"
                stroke-dashoffset={251 - (privacyScore * 2.51)}
                stroke-linecap="round"
              />
              {/* Needle */}
              <line 
                x1="50" y1="40" 
                x2={50 + 35 * Math.cos((privacyScore * 1.8 - 90) * Math.PI / 180)}
                y2={40 + 35 * Math.sin((privacyScore * 1.8 - 90) * Math.PI / 180)}
                stroke="#ef4444" 
                stroke-width="3"
              />
              {/* Needle center */}
              <circle cx="50" cy="40" r="4" fill="#ef4444" />
            </svg>
          </div>
        </div>

        {/* Digital Display */}
        <div class="bg-gray-800 border-2 border-gray-600 rounded p-2 text-center">
          <span class="text-2xl font-mono font-bold" style={`color: ${scoreColor.replace('text-', '')}`}>
            {privacyScore.toString().padStart(3, '0')}
          </span>
        </div>

        {/* Status Light */}
        <div class="flex justify-center mt-3">
          <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full border-2 border-red-500"></div>
            <div class="w-3 h-3 rounded-full border-2 border-yellow-500"></div>
            <div class={`w-3 h-3 rounded-full ${scoreColor.replace('text-', 'bg-')}`}></div>
            <div class="w-3 h-3 rounded-full border-2 border-green-500"></div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div class="text-xs space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-400">Light Protocol:</span>
          <span class="text-green-400">+25 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Noir/Aztec:</span>
          <span class="text-green-400">+20 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Arcium MPC:</span>
          <span class="text-green-400">+15 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Privacy Cash:</span>
          <span class="text-green-400">+10 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Your Activity:</span>
          <span class="text-blue-400">+5 pts</span>
        </div>
      </div>

      {/* Status Message */}
      <div class="mt-3 p-2 bg-gray-800 rounded border border-gray-700 text-center">
        <span class={`font-bold ${scoreColor}`}>{scoreLevel}</span>
        <span class="text-gray-400 text-xs ml-2">Privacy Protection</span>
      </div>

      {/* Retro Controls */}
      <div class="flex justify-center gap-2 mt-3">
        <button 
          onClick={() => setPrivacyScore(prev => Math.min(100, prev + 5))}
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
        >
          ▲ IMPROVE
        </button>
        <button 
          onClick={() => setPrivacyScore(prev => Math.max(0, prev - 5))}
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
        >
          ▼ DEGRADE
        </button>
      </div>
    </div>
  );
};