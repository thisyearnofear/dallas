import { products } from "../components/products";
import { ProductCard } from "../components/ProductCard";

export function Products() {
    return (
        <>
            <h1 class="text-3xl font-medium mb-5">Our Products</h1>
            <p class="text-xl mb-10">
                A selection of the finest, unapproved treatments from around the world. We take risks so you don't have to.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </>
    );
}
