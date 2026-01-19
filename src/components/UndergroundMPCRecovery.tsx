import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export const UndergroundMPCRecovery: FunctionalComponent = () => {
  const [recoveryMode, setRecoveryMode] = useState<'idle' | 'scanning' | 'recovering' | 'completed'>('idle');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [progress, setProgress] = useState(0);

  const handleRecover = () => {
    if (recoveryMode === 'idle') {
      setRecoveryMode('scanning');
      setTimeout(() => {
        setRecoveryMode('recovering');
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => setRecoveryMode('completed'), 500);
              return 100;
            }
            return prev + 5;
          });
        }, 200);
      }, 2000);
    }
  };

  return (
    <div class="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 w-full max-w-md">
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold text-yellow-400 flex items-center justify-center gap-2">
          <span>🔧</span>
          MPC SESSION RECOVERY
          <span>🔧</span>
        </h3>
        <p class="text-gray-400 text-sm mt-1">
          Arcium Threshold Decryption Recovery Terminal
        </p>
      </div>

      {recoveryMode === 'idle' && (
        <div class="space-y-4">
          <div class="bg-yellow-900/20 border border-yellow-700 p-3 rounded">
            <p class="text-yellow-300 mb-2">
              ⚠️ <strong>ATTENTION:</strong> MPC session interrupted. Initiate recovery protocol.
            </p>
            <p class="text-gray-300 text-sm">
              Your Arcium MPC decryption session was interrupted. Enter your recovery code to restore the session.
            </p>
          </div>

          <div>
            <label class="block text-sm font-bold mb-2 text-gray-300">
              RECOVERY CODE (from your validator)
            </label>
            <input
              type="text"
              value={recoveryCode}
              onInput={(e) => setRecoveryCode((e.target as HTMLInputElement).value)}
              placeholder="Enter 8-digit recovery code"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </div>

          <div class="bg-gray-800 p-3 rounded border border-gray-700">
            <p class="text-gray-300 text-sm mb-2">
              <strong>RECOVERY PROTOCOL:</strong>
            </p>
            <ol class="text-xs text-gray-400 space-y-1 ml-4">
              <li>1. Contact any validator who approved your request</li>
              <li>2. Request their 8-digit recovery code</li>
              <li>3. Enter the code above</li>
              <li>4. Click RECOVER SESSION</li>
              <li>5. Wait for Arcium MPC reconstruction</li>
            </ol>
          </div>

          <button
            onClick={handleRecover}
            disabled={!recoveryCode || recoveryCode.length !== 8}
            class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded"
          >
            🔄 RECOVER MPC SESSION
          </button>
        </div>
      )}

      {recoveryMode === 'scanning' && (
        <div class="text-center space-y-4">
          <div class="bg-yellow-900/20 border border-yellow-700 p-4 rounded">
            <p class="text-yellow-300 mb-2">
              🔍 <strong>SCANNING BLOCKCHAIN...</strong>
            </p>
            <p class="text-gray-300 text-sm">
              Searching for MPC session fragments on Solana...
            </p>
            <div class="mt-3">
              <div class="flex justify-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={`animation-delay: ${i * 100}ms`}></div>
                ))}
              </div>
            </div>
          </div>

          <div class="bg-gray-800 p-3 rounded border border-gray-700">
            <p class="text-gray-300 text-sm">
              <strong>SCANNING PROGRESS:</strong>
            </p>
            <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div class="bg-yellow-500 h-2 rounded-full" style="width: 75%;"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Found 3/5 validator shares... searching for remaining fragments...
            </p>
          </div>
        </div>
      )}

      {recoveryMode === 'recovering' && (
        <div class="text-center space-y-4">
          <div class="bg-green-900/20 border border-green-700 p-4 rounded">
            <p class="text-green-300 mb-2">
              🛠️ <strong>RECONSTRUCTING MPC SESSION...</strong>
            </p>
            <p class="text-gray-300 text-sm">
              Arcium MPC reconstruction in progress...
            </p>
            <div class="mt-3">
              <div class="text-2xl font-mono font-bold text-green-400">
                {progress}%
              </div>
            </div>
          </div>

          <div class="bg-gray-800 p-3 rounded border border-gray-700">
            <p class="text-gray-300 text-sm">
              <strong>RECONSTRUCTION STATUS:</strong>
            </p>
            <div class="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div class="bg-green-500 h-3 rounded-full" style={`width: ${progress}%`}></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Validating shares...</span>
              <span>Reconstructing key...</span>
              <span>Finalizing...</span>
            </div>
          </div>

          <div class="bg-blue-900/20 border border-blue-700 p-3 rounded">
            <p class="text-blue-300 text-sm">
              <strong>TECHNICAL DETAILS:</strong>
            </p>
            <div class="text-xs text-gray-400 space-y-1 mt-1">
              <div>• Session ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
              <div>• Shares recovered: 5/5</div>
              <div>• Arcium protocol: v2.1.0</div>
              <div>• Reconstruction time: ~30 seconds</div>
            </div>
          </div>
        </div>
      )}

      {recoveryMode === 'completed' && (
        <div class="text-center space-y-4">
          <div class="bg-green-900/30 border border-green-600 p-4 rounded">
            <p class="text-green-300 mb-2">
              ✅ <strong>MPC SESSION RECOVERED!</strong>
            </p>
            <p class="text-gray-300 text-sm">
              Your Arcium MPC decryption session has been successfully reconstructed.
            </p>
            <div class="mt-3 bg-green-800 p-2 rounded">
              <span class="text-green-300 font-bold">SESSION STATUS: ACTIVE</span>
            </div>
          </div>

          <div class="bg-gray-800 p-3 rounded border border-gray-700">
            <p class="text-gray-300 text-sm mb-2">
              <strong>RECOVERY SUMMARY:</strong>
            </p>
            <div class="text-xs text-gray-400 space-y-1">
              <div>• Recovery time: 28.4 seconds</div>
              <div>• Shares reconstructed: 5/5</div>
              <div>• Data integrity: VERIFIED</div>
              <div>• Session security: RESTORED</div>
            </div>
          </div>

          <div class="bg-blue-900/20 border border-blue-700 p-3 rounded">
            <p class="text-blue-300 text-sm mb-1">
              <strong>NEXT STEPS:</strong>
            </p>
            <ol class="text-xs text-gray-400 space-y-1 ml-4">
              <li>1. Return to your research dashboard</li>
              <li>2. Access the decrypted case study</li>
              <li>3. Continue your analysis</li>
              <li>4. Remember: privacy is power</li>
            </ol>
          </div>

          <button
            onClick={() => setRecoveryMode('idle')}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🚀 RETURN TO DASHBOARD
          </button>
        </div>
      )}

      {/* Underground Aesthetic Footer */}
      <div class="mt-6 pt-4 border-t border-gray-700 text-center">
        <p class="text-xs text-gray-500">
          ARCIUM MPC RECOVERY TERMINAL v1.2.4 | SOLANA BLOCKCHAIN
        </p>
        <p class="text-xs text-gray-600 mt-1">
          "In the underground, we don't lose data. We recover it." - Ron W., 1989
        </p>
      </div>
    </div>
  );
};