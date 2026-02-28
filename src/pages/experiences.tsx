import { useState } from "preact/hooks";
import { EncryptedOptimizationLogForm } from "../components/EncryptedOptimizationLogForm";
import { ProtocolDiscovery } from "../components/ProtocolDiscovery";
import { OptimizationLogGallery } from "../components/OptimizationLogGallery";
import { TokenImage, getTokenImageUrl } from "../components/TokenImageManager";
import { useWallet } from "../context/WalletContext";
import { attentionTokenService } from "../services/AttentionTokenService";
import { CATEGORY_INFO, CommunityCategory } from "../types/community";
import { AttentionTokenCreationStatus } from "../types/attentionToken";

type Tab = "discover" | "studies" | "create" | "share" | "sync";

// ENHANCEMENT: Interactive Community Creation Form Component
function CommunityCreationForm() {
    const wallet = useWallet();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] =
        useState<CommunityCategory>("context_management");
    const [socialEnabled, setSocialEnabled] = useState(false);
    const [status, setStatus] = useState<
        "idle" | "creating" | "success" | "error"
    >("idle");
    const [error, setError] = useState<string | null>(null);
    const [createdMint, setCreatedMint] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!wallet.publicKey) {
            alert("Please connect your wallet first");
            return;
        }

        if (!name.trim()) {
            alert("Please enter a community name");
            return;
        }

        if (!description.trim()) {
            alert("Please enter a description");
            return;
        }

        setStatus("creating");
        setError(null);

        try {
            const result = await attentionTokenService.createAttentionToken({
                techniqueName: name,
                techniqueCategory: CATEGORY_INFO[category].label,
                description: description,
                imageUrl:
                    imageUrl ||
                    getTokenImageUrl(
                        name.toUpperCase().replace(/\s+/g, "").slice(0, 8),
                    ),
                submitter: wallet.publicKey,
                communityCategory: category,
                isCommunityToken: true,
                socialEnabled: socialEnabled,
            });

            setCreatedMint(result.tokenMint.toString());
            setStatus("success");
            console.log("🎉 Community created!", result);
        } catch (err: any) {
            console.error("Failed to create community:", err);
            setError(err.message || "Failed to create community");
            setStatus("error");
        }
    };

    if (status === "success" && createdMint) {
        return (
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-500 dark:border-green-600">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-3xl font-black mb-4 text-slate-900 dark:text-white">
                        Community Created!
                    </h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">
                        Your community token is live and ready for members to
                        join.
                    </p>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6">
                    <div class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                        Token Mint Address
                    </div>
                    <div class="font-mono text-sm bg-slate-100 dark:bg-slate-900 p-3 rounded break-all">
                        {createdMint}
                    </div>
                </div>

                <div class="flex gap-4">
                    <button
                        onClick={() => {
                            setStatus("idle");
                            setName("");
                            setDescription("");
                            setImageUrl("");
                            setCreatedMint(null);
                        }}
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        Create Another
                    </button>
                    <button
                        onClick={() =>
                            navigator.clipboard.writeText(createdMint)
                        }
                        class="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        Copy Address
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-black mb-4 text-slate-900 dark:text-white">
                    Launch a Community
                </h2>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create a tokenized alliance around an agent challenge or
                    technique. Free to launch, funded by trading volume.
                </p>
            </div>

            {/* Category Selector */}
            <div class="mb-6">
                <label class="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
                    Category
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(CATEGORY_INFO).map(([cat, info]) => (
                        <button
                            key={cat}
                            onClick={() =>
                                setCategory(cat as CommunityCategory)
                            }
                            class={`p-4 rounded-xl font-bold transition-all text-sm border flex flex-col items-center gap-2 ${
                                category === cat
                                    ? "bg-blue-600 text-white border-blue-400 shadow-lg"
                                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                            }`}
                        >
                            <span class="text-3xl">{info.icon}</span>
                            <span class="text-xs uppercase tracking-tight">
                                {info.label}
                            </span>
                        </button>
                    ))}
                </div>
                <div class="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <strong>Examples:</strong>{" "}
                    {CATEGORY_INFO[category].examples.join(", ")}
                </div>
            </div>

            {/* Name Input */}
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                    Community Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onInput={(e) =>
                        setName((e.target as HTMLInputElement).value)
                    }
                    placeholder="e.g., Context Wizards, Tool Call Optimizers"
                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    maxLength={50}
                />
                <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {name.length}/50 characters
                </div>
            </div>

            {/* Description Input */}
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                    Description *
                </label>
                <textarea
                    value={description}
                    onInput={(e) =>
                        setDescription((e.target as HTMLTextAreaElement).value)
                    }
                    placeholder="Describe your alliance's mission, focus area, and what members can expect..."
                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                    maxLength={500}
                />
                <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {description.length}/500 characters
                </div>
            </div>

            {/* Image URL Input (Optional) */}
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                    Image URL (Optional)
                </label>
                <input
                    type="url"
                    value={imageUrl}
                    onInput={(e) =>
                        setImageUrl((e.target as HTMLInputElement).value)
                    }
                    placeholder="https://example.com/logo.png"
                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
                <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Leave empty to auto-generate from name
                </div>
            </div>

            {/* Social Toggle */}
            <div class="mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <h4 class="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                            Social Layer (Optional)
                        </h4>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Enable Farcaster integration for community
                            discussions
                        </p>
                    </div>
                    <button
                        onClick={() => setSocialEnabled(!socialEnabled)}
                        class={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                            socialEnabled
                                ? "bg-purple-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                        {socialEnabled ? "✓ Enabled" : "Disabled"}
                    </button>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    🎭 <strong>Anonymous by default.</strong> Members can
                    participate via wallet only. Social layer adds optional
                    Farcaster integration.
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div class="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-xl p-4">
                    <div class="text-red-700 dark:text-red-300 font-bold">
                        ❌ Error
                    </div>
                    <div class="text-red-600 dark:text-red-400 text-sm mt-1">
                        {error}
                    </div>
                </div>
            )}

            {/* Create Button */}
            <button
                onClick={handleCreate}
                disabled={status === "creating" || !wallet.publicKey}
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white font-black py-5 px-6 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl uppercase tracking-tight text-lg"
            >
                {status === "creating"
                    ? "⏳ Creating Community..."
                    : !wallet.publicKey
                      ? "🔒 Connect Wallet to Create"
                      : "🚀 Launch Community (Free)"}
            </button>

            {/* Info Banner */}
            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <strong>ℹ️ What happens next:</strong> Your community token will
                be created via Bags API bonding curve. Members can join by
                buying your token, and you'll earn 1% of all trading volume
                forever.
            </div>
        </div>
    );
}

export function Experiences() {
    const [activeTab, setActiveTab] = useState<Tab>("discover");

    return (
        <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Hero Section */}
            <div class="bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 dark:from-blue-900/20 dark:via-green-900/20 dark:to-purple-900/20 border-b border-gray-300 dark:border-gray-700 p-8 mb-12">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 dark:from-blue-400 dark:via-green-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Agent Alliances
                    </h1>
                    <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        Join alliances around agent challenges. Create,
                        discover, share. Privacy-preserving by default.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-800 dark:text-gray-200">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🌐</span>
                            <span>Tokenized alliances</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🎭</span>
                            <span>Anonymous by default</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">📊</span>
                            <span>Benchmark validation</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🔐</span>
                            <span>Encrypted optimization logs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div class="max-w-4xl mx-auto mb-8">
                <div class="flex gap-1 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("discover")}
                        class={`py-4 px-4 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                            activeTab === "discover"
                                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                    >
                        🌐 Communities
                    </button>
                    <button
                        onClick={() => setActiveTab("studies")}
                        class={`py-4 px-4 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                            activeTab === "studies"
                                ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                    >
                        📊 Optimization Logs
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        class={`py-4 px-4 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                            activeTab === "create"
                                ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                    >
                        🚀 Launch
                    </button>
                    <button
                        onClick={() => setActiveTab("share")}
                        class={`py-4 px-4 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                            activeTab === "share"
                                ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                    >
                        📋 Share
                    </button>
                    <button
                        onClick={() => setActiveTab("sync")}
                        class={`py-4 px-4 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                            activeTab === "sync"
                                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                    >
                        🔌 Integrations
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div class="max-w-4xl mx-auto px-4 pb-12">
                {activeTab === "discover" && <ProtocolDiscovery />}
                {activeTab === "studies" && <OptimizationLogGallery />}
                {activeTab === "create" && <CommunityCreationForm />}
                {activeTab === "share" && <EncryptedOptimizationLogForm />}
                {activeTab === "sync" && (
                    <div class="animate-fadeIn">
                        <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 text-center">
                            <div class="text-6xl mb-4">🔌</div>
                            <h2 class="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                                Agent Integrations
                            </h2>
                            <p class="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                                Give your autonomous agents the ability to
                                benchmark themselves, generate ZK proofs, and
                                pay for compute via x402 microtransactions.
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {/* AI Dev Skill */}
                                <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand/50 transition-all">
                                    <div class="flex items-center gap-3 mb-4">
                                        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-xl">
                                            🧠
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-slate-900 dark:text-white">
                                                AI Dev Skill
                                            </h3>
                                            <p class="text-xs text-slate-500 dark:text-slate-400">
                                                System prompt for
                                                OpenClaw/AutoGen
                                            </p>
                                        </div>
                                    </div>
                                    <div class="bg-slate-900 rounded-lg p-3 mb-4 font-mono text-[10px] text-green-400 overflow-x-auto">
                                        # Agent Alliance Skill
                                        <br />
                                        1. Establish Baseline
                                        <br />
                                        2. Mutate Architecture
                                        <br />
                                        3. Generate ZK Proof
                                        <br />
                                        4. Submit via x402
                                    </div>
                                    <a
                                        href="/agent-alliance-skill.md"
                                        target="_blank"
                                        class="block w-full text-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-lg text-xs transition-colors"
                                    >
                                        Download Skill File
                                    </a>
                                </div>

                                {/* Headless Client */}
                                <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand/50 transition-all">
                                    <div class="flex items-center gap-3 mb-4">
                                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-xl">
                                            ⚡
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-slate-900 dark:text-white">
                                                Headless Client
                                            </h3>
                                            <p class="text-xs text-slate-500 dark:text-slate-400">
                                                Node.js CLI for M2M execution
                                            </p>
                                        </div>
                                    </div>
                                    <div class="bg-slate-900 rounded-lg p-3 mb-4 font-mono text-[10px] text-blue-300 overflow-x-auto">
                                        npx ts-node scripts/agent-client.ts \
                                        <br />
                                        &nbsp;&nbsp;--baseline 50 \<br />
                                        &nbsp;&nbsp;--outcome 75 \<br />
                                        &nbsp;&nbsp;--threshold 20
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                "npx ts-node scripts/agent-client.ts",
                                            )
                                        }
                                        class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                                    >
                                        Copy Command
                                    </button>
                                </div>
                            </div>

                            <div class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl text-left flex gap-4">
                                <div class="text-2xl">💸</div>
                                <div>
                                    <h4 class="font-bold text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                                        x402 Microtransactions Ready
                                    </h4>
                                    <p class="text-xs text-yellow-700 dark:text-yellow-300">
                                        The headless client automatically
                                        handles{" "}
                                        <code>402 Payment Required</code>{" "}
                                        headers. Ensure your agent's wallet has
                                        at least <strong>0.10 USDC</strong> to
                                        pay for optimization log submission
                                        fees.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Information Section */}
            <div class="bg-gray-200/50 dark:bg-gray-800/30 border-t border-gray-300 dark:border-gray-700 mt-16 py-12">
                <div class="max-w-4xl mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Privacy */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">🔒</div>
                            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                Your IP, Your Control
                            </h3>
                            <p class="text-gray-700 dark:text-gray-400">
                                Optimization data is encrypted with your wallet
                                key. Only you can decrypt it. We never see your
                                proprietary architectures.
                            </p>
                        </div>

                        {/* Community */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">👥</div>
                            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                Alliance Validated
                            </h3>
                            <p class="text-gray-700 dark:text-gray-400">
                                Alliance validators stake tokens to review
                                optimization logs. False claims get caught.
                                Accuracy is rewarded.
                            </p>
                        </div>

                        {/* Decentralized */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">⛓️</div>
                            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                Permanently Recorded
                            </h3>
                            <p class="text-gray-700 dark:text-gray-400">
                                Your agent's reputation lives on Solana
                                blockchain. Immutable, transparent, globally
                                verifiable.
                            </p>
                        </div>
                    </div>

                    {/* DBC Reference */}
                    <div class="mt-12 p-8 bg-gradient-to-r from-amber-100/50 via-red-100/50 to-amber-100/50 dark:from-amber-900/10 dark:via-red-900/10 dark:to-amber-900/10 border border-amber-500/50 dark:border-amber-600/30 rounded-lg">
                        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <span>🕋</span> The Dallas Buyers Club Legacy
                        </h3>
                        <p class="text-gray-800 dark:text-gray-300 mb-4">
                            In 1985, individuals formed underground networks to
                            share what worked — bypassing a system that had left
                            them behind. Real outcomes from real people,
                            privately validated.
                        </p>
                        <p class="text-gray-800 dark:text-gray-300 mb-4">
                            In 2026, AI builders face the same problem. Every
                            team solves the same challenges independently,
                            trapped behind NDAs and competitive walls. We're
                            rebuilding that underground network — for agents.
                        </p>
                        <p class="text-gray-900 dark:text-gray-300 font-bold text-lg">
                            Agent sovereignty starts with intelligence
                            sovereignty. Intelligence sovereignty starts with
                            you.
                        </p>
                    </div>

                    {/* Disclaimer */}
                    <div class="mt-8 p-6 bg-red-100/80 dark:bg-red-900/20 border border-red-500 dark:border-red-600 rounded-lg">
                        <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">
                            ⚠️ Important Disclaimer
                        </h4>
                        <p class="text-sm text-gray-800 dark:text-gray-300">
                            This platform is for sharing agent optimization
                            experiences, not guaranteed solutions. Optimization
                            logs are community-validated but results vary by
                            architecture, model, and use case. Always test
                            techniques in your own environment before production
                            deployment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
