import { products } from "../components/products";
import { ProductCard } from "../components/ProductCard";

export function Products() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            {/* Header Section */}
            <div class="text-center mb-12">
                <h1 class="text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Our Products</h1>
                <p class="text-xl mb-8 max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
                    A selection of the finest, unapproved treatments from around the world. We take risks so you don't have to.
                </p>
                
                {/* Category Filter Buttons */}
                <div class="flex flex-wrap justify-center gap-3 mb-8">
                    <button class="bg-brand text-white px-6 py-2 rounded-full font-semibold hover:bg-brand-accent transition-all duration-300 transform hover:scale-105 shadow-md">
                        All Products
                    </button>
                    <button class="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        High Potency
                    </button>
                    <button class="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        FDA Unapproved
                    </button>
                    <button class="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        Limited Supply
                    </button>
                </div>

                {/* Quick Stats */}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">{products.length}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Products Available</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">24/7</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Access</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">100%</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Unregulated</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">⚠️</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">High Risk</div>
                    </div>
                </div>
            </div>

            {/* Products Grid with Enhanced Layout */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div 
                        key={product.id}
                        class={`transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                            index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <ProductCard product={product} featured={index === 0} />
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <div class="mt-16 text-center">
                <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-10 rounded-2xl shadow-xl border border-slate-700">
                    <h2 class="text-3xl font-bold mb-4">⚠️ Important Notice</h2>
                    <p class="text-lg mb-8 max-w-2xl mx-auto text-slate-300">
                        These products are experimental and unapproved by regulatory authorities. 
                        Use at your own risk. The Dallas Buyers Club operates in legal gray areas.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <a 
                            href="/donate" 
                            class="bg-brand text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-accent transition-all transform hover:scale-105 shadow-lg"
                        >
                            💰 Support the Club
                        </a>
                        <a 
                            href="/links" 
                            class="border-2 border-white/30 text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-slate-900 transition-all transform hover:scale-105"
                        >
                            📖 Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
