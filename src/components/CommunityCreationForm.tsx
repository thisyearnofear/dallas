import { useState } from "preact/hooks";
import { TokenImage, getTokenImageUrl } from "./TokenImageManager";
import { useWallet } from "../context/WalletContext";
import { attentionTokenService } from "../services/AttentionTokenService";
import { CATEGORY_INFO, CommunityCategory } from "../types/community";

// Interactive Alliance Creation Form Component
export function CommunityCreationForm() {
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
            setError("Please connect your wallet first.");
            setStatus("error");
            return;
        }

        if (!name.trim()) {
            setError("Please enter an alliance name.");
            setStatus("error");
            return;
        }

        if (!description.trim()) {
            setError("Please enter a description.");
            setStatus("error");
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
            console.log("🎉 Alliance created!", result);
        } catch (err: any) {
            console.error("Failed to create alliance:", err);
            setError(err.message || "Failed to create alliance");
            setStatus("error");
        }
    };

    if (status === "success" && createdMint) {
        return (
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-500 dark:border-green-600">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-3xl font-black mb-4 text-slate-900 dark:text-white">
                        Alliance Created!
                    </h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">
                        Your alliance token is live and ready for members to
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
                    Launch an Alliance
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
                    Alliance Name *
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

            {/* Image URL */}
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                    Token Image URL (optional)
                </label>
                <input
                    type="url"
                    value={imageUrl}
                    onInput={(e) =>
                        setImageUrl((e.target as HTMLInputElement).value)
                    }
                    placeholder="https://example.com/token-image.png"
                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
                {imageUrl && (
                    <div class="mt-2 flex items-center gap-3">
                        <TokenImage
                            symbol="PREVIEW"
                            size="sm"
                        />
                        <span class="text-xs text-slate-500 dark:text-slate-400">
                            Preview
                        </span>
                    </div>
                )}
            </div>

            {/* Social Toggle */}
            <div class="mb-8 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">
                        Enable Social Features
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                        Allow members to discuss and share within the alliance
                    </div>
                </div>
                <button
                    onClick={() => setSocialEnabled(!socialEnabled)}
                    class={`w-12 h-6 rounded-full transition-all ${
                        socialEnabled
                            ? "bg-blue-600"
                            : "bg-slate-300 dark:bg-slate-600"
                    }`}
                >
                    <div
                        class={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            socialEnabled
                                ? "translate-x-6"
                                : "translate-x-0.5"
                        }`}
                    />
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div class="flex items-center gap-2">
                        <span class="text-red-500">⚠️</span>
                        <span class="text-sm text-red-700 dark:text-red-300">
                            {error}
                        </span>
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
                    ? "⏳ Creating Alliance..."
                    : !wallet.publicKey
                      ? "🔒 Connect Wallet to Launch"
                      : "🚀 Launch Alliance (Free)"}
            </button>

            {/* Info Banner */}
            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <strong>ℹ️ What happens next:</strong> Your alliance token will
                be created via Bags API bonding curve. Members can join by
                buying your token, and you'll earn 1% of all trading volume
                forever.
            </div>
        </div>
    );
}
