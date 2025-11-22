export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
}

export const products: Product[] = [
    {
        id: 1,
        name: "AZT",
        description: "The only approved drug. Handle with care. Or don't.",
        price: "Ƀ0.5",
        image: "https://placehold.co/400x400/282629/c9a383?text=AZT",
    },
    {
        id: 2,
        name: "Peptide T",
        description: "Straight from the lab. What the FDA doesn't want you to have.",
        price: "Ƀ0.2",
        image: "https://placehold.co/400x400/282629/c9a383?text=Peptide+T",
    },
    {
        id: 3,
        name: "DDC",
        description: "Highly potent, highly effective. Use at your own risk.",
        price: "Ƀ0.3",
        image: "https://placehold.co/400x400/282629/c9a383?text=DDC",
    },
    {
        id: 4,
        name: "Interferon",
        description: "The original game-changer. Limited supply.",
        price: "Ƀ0.8",
        image: "https://placehold.co/400x400/282629/c9a383?text=Interferon",
    },
];
