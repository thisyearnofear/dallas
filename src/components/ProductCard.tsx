import type { Product } from "./products";

interface ProductCardProps {
    product: Product;
    featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
    return (
        <div class={`
            relative group border-2 border-gray-dark p-4 flex flex-col h-full
            hover:border-brand transition-all duration-300 hover:shadow-lg
            bg-gradient-to-br from-white to-gray-50
            ${featured ? 'border-brand bg-gradient-to-br from-brand/5 to-brand/10' : ''}
        `}>
            {/* Featured Badge */}
            {featured && (
                <div class="absolute -top-2 -right-2 bg-brand text-white px-3 py-1 text-sm font-bold rounded-full z-10">
                    🔥 FEATURED
                </div>
            )}
            
            {/* Product Image */}
            <div class="relative overflow-hidden mb-4 rounded">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    class={`
                        w-full object-cover group-hover:scale-110 transition-transform duration-500
                        ${featured ? 'h-64 lg:h-80' : 'h-48'}
                    `} 
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Overlay */}
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold">
                        ⚠️ Use at your own risk
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div class="flex-grow">
                <h2 class={`font-bold font-sans mb-2 group-hover:text-brand transition-colors ${featured ? 'text-3xl' : 'text-2xl'}`}>
                    {product.name}
                </h2>
                <p class={`text-gray mb-4 flex-grow ${featured ? 'text-lg' : ''}`}>
                    {product.description}
                </p>
            </div>

            {/* Price and Action */}
            <div class="flex justify-between items-center mt-auto">
                <p class={`font-bold text-brand ${featured ? 'text-2xl' : 'text-xl'}`}>
                    {product.price}
                </p>
                <div class="flex gap-2">
                    <a
                        href="#"
                        class={`
                            bg-brand text-white font-bold py-2 px-4 rounded
                            hover:bg-brand-accent transition-all duration-300
                            hover:scale-105 active:scale-95
                            ${featured ? 'py-3 px-6 text-lg' : ''}
                        `}
                    >
                        💊 Get Now
                    </a>
                    <button class="text-brand hover:text-brand-accent transition-colors p-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Product Tags */}
            <div class="mt-3 flex flex-wrap gap-1">
                <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    ⚠️ Unapproved
                </span>
                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    🧪 Experimental
                </span>
                {featured && (
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        🌟 Popular
                    </span>
                )}
            </div>
        </div>
    );
}
