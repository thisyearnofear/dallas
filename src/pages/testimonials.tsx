import { TestimonialsGrid } from "../components/TestimonialsGrid";

export function Testimonials() {
    return (
        <>
            <div class="text-center mb-8">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark">Club Success Stories</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Real people, real results. When the system fails, we fight back.
                </p>
            </div>

            <TestimonialsGrid />
        </>
    );
}
