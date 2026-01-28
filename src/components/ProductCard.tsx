import type { Product } from "./products";

interface ProductCardProps {
    product: Product;
    featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
    return (
        <div class={`
            relative group border-2 p-4 flex flex-col h-full rounded-lg
            hover:border-brand transition-all duration-300 hover:shadow-lg
            ${featured 
                ? 'border-brand bg-gradient-to-br from-brand/10 to-brand/20 dark:from-brand/20 dark:to-brand/30' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}
        `}>
            {/* Featured Badge */}
            {featured && (
                <div class="absolute -top-2 -right-2 bg-brand text-white px-3 py-1 text-sm font-bold rounded-full z-10 shadow-md">
                    🔥 FEATURED
                </div>
            )}
            
            {/* Product Image */}
            <div class="relative overflow-hidden mb-4 rounded shadow-inner bg-slate-100 dark:bg-slate-800">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    class={`
                        w-full object-cover group-hover:scale-110 transition-transform duration-500
                        ${featured ? 'h-64 lg:h-80' : 'h-48'}
                    `} 
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Overlay */}
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold shadow-lg border border-brand/30">
                        ⚠️ Use at your own risk
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div class="flex-grow">
                <h2 class={`font-bold font-sans mb-2 group-hover:text-brand transition-colors ${featured ? 'text-3xl' : 'text-2xl'} text-slate-900 dark:text-white`}>
                    {product.name}
                </h2>
                <p class={`text-slate-600 dark:text-slate-400 mb-4 flex-grow ${featured ? 'text-lg' : 'text-sm'}`}>
                    {product.description}
                </p>
            </div>

            {/* Price and Action */}
            <div class="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <p class={`font-bold text-brand ${featured ? 'text-2xl' : 'text-xl'}`}>
                    {product.price}
                </p>
                <div class="flex gap-2">
                    <a
                        href="#"
                        class={`
                            bg-brand text-white font-bold py-2 px-4 rounded shadow-md
                            hover:bg-brand-accent transition-all duration-300
                            hover:scale-105 active:scale-95
                            ${featured ? 'py-3 px-6 text-lg' : 'text-sm'}
                        `}
                    >
                        💊 Get Now
                    </a>
                    <button class="text-brand hover:text-brand-accent transition-all p-2 hover:bg-brand/10 rounded-full">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Product Tags */}
            <div class="mt-4 flex flex-wrap gap-1">
                <span class="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs px-2 py-1 rounded-full font-semibold border border-red-200 dark:border-red-800/50">
                    ⚠️ Unapproved
                </span>
                <span class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-2 py-1 rounded-full font-semibold border border-yellow-200 dark:border-yellow-800/50">
                    🧪 Experimental
                </span>
                {featured && (
                    <span class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full font-semibold border border-green-200 dark:border-green-800/50">
                        🌟 Popular
                    </span>
                )}
            </div>
        </div>
    );
}
