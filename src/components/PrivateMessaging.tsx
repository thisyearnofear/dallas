/**
 * PrivateMessaging - Wallet-to-Wallet Encrypted Messaging Component
 * 
 * Replaces the fake email contact with genuinely private messaging.
 * Uses Solana wallet keys for encryption - no email servers, no plaintext.
 * 
 * Features:
 * - Send encrypted messages to any Solana address
 * - Messages encrypted with recipient's public key
 * - Only recipient can decrypt with their private key
 * - Local storage with optional Arcium MPC for committee access
 * - Retro underground aesthetic matching DBC theme
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { 
  privateMessagingService, 
  EncryptedMessage,
  DecryptedMessage,
  MessageThread,
  SendMessageInput,
  MESSAGE_TYPE_OPTIONS,
  MESSAGING_CONFIG,
} from '../services/privacy/PrivateMessagingService';

// Message type badge colors
const TYPE_COLORS: Record<string, string> = {
  general: 'bg-slate-500',
  support: 'bg-red-500',
  treatment: 'bg-green-500',
  validator: 'bg-blue-500',
  research: 'bg-purple-500',
};

interface PrivateMessagingProps {
  compact?: boolean;
  initialRecipient?: string;
}

export function PrivateMessaging({ compact = false, initialRecipient = '' }: PrivateMessagingProps) {
  const { publicKey, signMessage, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox' | 'sent'>('compose');
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, DecryptedMessage>>(new Map());
  
  // Form state
  const [recipient, setRecipient] = useState(initialRecipient);
  const [messageType, setMessageType] = useState<SendMessageInput['type']>('general');
  const [content, setContent] = useState('');
  const [useCommittee, setUseCommittee] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });

  // Initialize service when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      privateMessagingService.initialize(publicKey);
      refreshMessages();
    }
  }, [connected, publicKey]);

  // Refresh messages
  const refreshMessages = useCallback(() => {
    if (!connected || !publicKey) return;
    
    const allMessages = privateMessagingService.getMessages();
    setMessages(allMessages);
    setThreads(privateMessagingService.getThreads());
  }, [connected, publicKey]);

  // Send message
  const handleSend = async () => {
    if (!connected || !publicKey || !signMessage) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    // Validate recipient
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient.trim());
    } catch {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }

    // Validate content
    if (!content.trim()) {
      setStatus({ type: 'error', message: 'Message cannot be empty' });
      return;
    }

    if (content.length > MESSAGING_CONFIG.maxMessageLength) {
      setStatus({ type: 'error', message: `Message too long (max ${MESSAGING_CONFIG.maxMessageLength} chars)` });
      return;
    }

    setIsSending(true);
    setStatus({ type: 'info', message: 'Encrypting message...' });

    try {
      await privateMessagingService.sendMessage(
        {
          recipient: recipientPubkey,
          content: content.trim(),
          type: messageType,
          useCommittee,
        },
        signMessage
      );

      setStatus({ type: 'success', message: 'Message encrypted and sent!' });
      setContent('');
      refreshMessages();
      
      // Switch to sent tab after successful send
      setTimeout(() => setActiveTab('sent'), 1000);
    } catch (error) {
      setStatus({ type: 'error', message: `Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsSending(false);
    }
  };

  // Decrypt a message
  const handleDecrypt = async (message: EncryptedMessage) => {
    if (!signMessage) return;

    try {
      const decrypted = await privateMessagingService.decryptMessage(message, signMessage);
      if (decrypted) {
        setDecryptedMessages(prev => new Map(prev).set(message.id, decrypted));
      } else {
        setStatus({ type: 'error', message: 'Failed to decrypt message' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Compact mode - just show the compose form
  if (compact) {
    return (
      <div class="bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">🔒</span>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Secure Messaging</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Encrypted with your wallet</p>
          </div>
        </div>

        {!connected ? (
          <div class="text-center py-4">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Connect wallet to send encrypted messages</p>
          </div>
        ) : (
          <div class="space-y-3">
            <input
              type="text"
              placeholder="Recipient Solana address..."
              value={recipient}
              onInput={(e) => setRecipient((e.target as HTMLInputElement).value)}
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono focus:border-brand focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Type your encrypted message..."
              value={content}
              onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
              rows={3}
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none focus:border-brand focus:outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !recipient || !content}
              class="w-full bg-brand hover:bg-brand/90 disabled:bg-slate-400 text-white font-black py-2 px-4 rounded-lg transition-all uppercase tracking-wider text-xs"
            >
              {isSending ? '🔐 Encrypting...' : '🔒 Send Encrypted'}
            </button>
          </div>
        )}

        {status.type && (
          <div class={`mt-3 p-2 rounded text-xs font-bold ${
            status.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            status.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    );
  }

  // Full mode with tabs
  return (
    <div class="bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div class="bg-slate-200 dark:bg-slate-800 p-4 border-b-2 border-slate-300 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔒</span>
            <div>
              <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Private Messaging</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Wallet-to-wallet encryption</p>
            </div>
          </div>
          {connected && (
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                {privateMessagingService.getUnreadCount()} unread
              </span>
            </div>
          )}
        </div>
      </div>

      {!connected ? (
        <div class="p-8 text-center">
          <span class="text-4xl mb-4 block">🔐</span>
          <h4 class="font-black text-slate-900 dark:text-white mb-2">Connect Wallet to Access</h4>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Private messaging uses your Solana wallet keys for encryption.
            <br />No email. No servers. Just math.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div class="flex border-b-2 border-slate-300 dark:border-slate-700">
            {(['compose', 'inbox', 'sent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                class={`flex-1 py-3 px-4 font-black text-xs uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'bg-brand text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'compose' && '✏️ Compose'}
                {tab === 'inbox' && `📥 Inbox (${privateMessagingService.getInbox().length})`}
                {tab === 'sent' && `📤 Sent (${privateMessagingService.getSent().length})`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div class="p-4">
            {status.type && (
              <div class={`mb-4 p-3 rounded-lg text-sm font-bold ${
                status.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                status.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {status.message}
              </div>
            )}

            {activeTab === 'compose' && (
              <div class="space-y-4">
                {/* Recipient */}
                <div>
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Solana wallet address..."
                    value={recipient}
                    onInput={(e) => setRecipient((e.target as HTMLInputElement).value)}
                    class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm focus:border-brand focus:outline-none transition-colors"
                  />
                </div>

                {/* Message Type */}
                <div>
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Message Type
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    {MESSAGE_TYPE_OPTIONS.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setMessageType(type.value as SendMessageInput['type'])}
                        class={`p-3 rounded-lg border-2 text-left transition-all ${
                          messageType === type.value
                            ? 'border-brand bg-brand/10 dark:bg-brand/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div class="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span class="font-bold text-sm">{type.label}</span>
                        </div>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Message Content
                  </label>
                  <textarea
                    placeholder="Type your encrypted message..."
                    value={content}
                    onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
                    rows={5}
                    maxLength={MESSAGING_CONFIG.maxMessageLength}
                    class="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none focus:border-brand focus:outline-none transition-colors"
                  />
                  <p class="text-[10px] text-slate-400 mt-1 text-right">
                    {content.length} / {MESSAGING_CONFIG.maxMessageLength}
                  </p>
                </div>

                {/* Committee Option */}
                <div class="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="useCommittee"
                    checked={useCommittee}
                    onChange={(e) => setUseCommittee((e.target as HTMLInputElement).checked)}
                    class="w-4 h-4 accent-brand"
                  />
                  <label htmlFor="useCommittee" class="flex-1 cursor-pointer">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">Require Committee Approval</span>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400">
                      Use Arcium MPC - validators must approve to decrypt
                    </p>
                  </label>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={isSending || !recipient || !content}
                  class="w-full bg-brand hover:bg-brand/90 disabled:bg-slate-400 text-white font-black py-4 px-6 rounded-lg transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <span class="animate-spin">🔐</span>
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      Send Encrypted Message
                    </>
                  )}
                </button>

                {/* Privacy Info */}
                <div class="text-center">
                  <p class="text-[10px] text-slate-400 uppercase tracking-widest">
                    🔐 Encrypted with Curve25519 XSalsa20 Poly1305
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div class="space-y-3">
                {privateMessagingService.getInbox().length === 0 ? (
                  <div class="text-center py-8">
                    <span class="text-3xl mb-2 block">📭</span>
                    <p class="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
                  </div>
                ) : (
                  privateMessagingService.getInbox().map((message) => {
                    const decrypted = decryptedMessages.get(message.id);
                    const isRead = message.status === 'read';

                    return (
                      <div
                        key={message.id}
                        class={`p-4 rounded-lg border-2 transition-all ${
                          isRead
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-800 border-brand/50 shadow-sm'
                        }`}
                      >
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <span class={`w-2 h-2 rounded-full ${TYPE_COLORS[message.type] || 'bg-slate-500'}`}></span>
                            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              {MESSAGE_TYPE_OPTIONS.find(t => t.value === message.type)?.label || message.type}
                            </span>
                            {!isRead && (
                              <span class="px-2 py-0.5 bg-brand text-white text-[10px] font-black rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <span class="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
                        </div>

                        <div class="mb-2">
                          <p class="text-xs text-slate-500 dark:text-slate-400">
                            From: <span class="font-mono">{truncateAddress(message.sender.toString())}</span>
                          </p>
                        </div>

                        {decrypted ? (
                          <div class="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                            <p class="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{decrypted.content}</p>
                          </div>
                        ) : (
                          <div class="flex items-center justify-between">
                            <p class="text-sm text-slate-400 italic">🔐 Encrypted message</p>
                            <button
                              onClick={() => handleDecrypt(message)}
                              class="px-3 py-1 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold rounded-full transition-colors"
                            >
                              🔓 Decrypt
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div class="space-y-3">
                {privateMessagingService.getSent().length === 0 ? (
                  <div class="text-center py-8">
                    <span class="text-3xl mb-2 block">📤</span>
                    <p class="text-sm text-slate-500 dark:text-slate-400">No sent messages</p>
                  </div>
                ) : (
                  privateMessagingService.getSent().map((message) => (
                    <div
                      key={message.id}
                      class="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <span class={`w-2 h-2 rounded-full ${TYPE_COLORS[message.type] || 'bg-slate-500'}`}></span>
                          <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {MESSAGE_TYPE_OPTIONS.find(t => t.value === message.type)?.label || message.type}
                          </span>
                        </div>
                        <span class="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
                      </div>

                      <div class="mb-2">
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                          To: <span class="font-mono">{truncateAddress(message.recipient.toString())}</span>
                        </p>
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="text-xs">🔐</span>
                        <span class="text-xs text-slate-400">Encrypted and delivered</span>
                        {message.metadata?.requiresCommittee && (
                          <span class="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded">
                            MPC Protected
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PrivateMessaging;
