import { products } from "../components/products";
import { ProductCard } from "../components/ProductCard";

export function Products() {
    return (
        <>
            {/* Header Section */}
            <div class="text-center mb-12">
                <h1 class="text-4xl lg:text-5xl font-bold mb-6 text-gray-dark">Our Products</h1>
                <p class="text-xl mb-8 max-w-3xl mx-auto">
                    A selection of the finest, unapproved treatments from around the world. We take risks so you don't have to.
                </p>
                
                {/* Category Filter Buttons */}
                <div class="flex flex-wrap justify-center gap-3 mb-8">
                    <button class="bg-brand text-white px-6 py-2 rounded-full font-semibold hover:bg-brand-accent transition-all duration-300 transform hover:scale-105">
                        All Products
                    </button>
                    <button class="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        High Potency
                    </button>
                    <button class="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        FDA Unapproved
                    </button>
                    <button class="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105">
                        Limited Supply
                    </button>
                </div>

                {/* Quick Stats */}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                    <div class="bg-gradient-to-br from-brand/10 to-brand/5 p-4 rounded-lg border border-brand/20">
                        <div class="text-2xl font-bold text-brand">{products.length}</div>
                        <div class="text-sm text-gray-600">Products Available</div>
                    </div>
                    <div class="bg-gradient-to-br from-brand/10 to-brand/5 p-4 rounded-lg border border-brand/20">
                        <div class="text-2xl font-bold text-brand">24/7</div>
                        <div class="text-sm text-gray-600">Access</div>
                    </div>
                    <div class="bg-gradient-to-br from-brand/10 to-brand/5 p-4 rounded-lg border border-brand/20">
                        <div class="text-2xl font-bold text-brand">100%</div>
                        <div class="text-sm text-gray-600">Unregulated</div>
                    </div>
                    <div class="bg-gradient-to-br from-brand/10 to-brand/5 p-4 rounded-lg border border-brand/20">
                        <div class="text-2xl font-bold text-brand">⚠️</div>
                        <div class="text-sm text-gray-600">High Risk</div>
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
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 rounded-lg">
                    <h2 class="text-3xl font-bold mb-4">⚠️ Important Notice</h2>
                    <p class="text-lg mb-6 max-w-2xl mx-auto">
                        These products are experimental and unapproved by regulatory authorities. 
                        Use at your own risk. The Dallas Buyers Club operates in legal gray areas.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <a 
                            href="/donate" 
                            class="bg-brand text-white font-bold py-3 px-6 rounded hover:bg-brand-accent transition-colors"
                        >
                            💰 Support the Club
                        </a>
                        <a 
                            href="/links" 
                            class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-gray-900 transition-colors"
                        >
                            📖 Learn More
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
