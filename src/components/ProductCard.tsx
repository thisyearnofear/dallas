import type { Product } from "./products";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div class="border-2 border-gray-dark p-4 flex flex-col">
            <img src={product.image} alt={product.name} class="w-full h-48 object-cover mb-4" />
            <h2 class="text-2xl font-bold font-sans mb-2">{product.name}</h2>
            <p class="text-gray mb-4 flex-grow">{product.description}</p>
            <div class="flex justify-between items-center">
                <p class="text-xl font-bold text-brand">{product.price}</p>
                <a
                    href="#"
                    class="bg-brand text-white font-bold py-2 px-4 hover:bg-brand-accent transition-colors"
                >
                    View Details
                </a>
            </div>
        </div>
    );
}
