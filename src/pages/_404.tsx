export function NotFound() {
	return (
        <div class="flex flex-col items-center">
            <h1 class="text-3xl font-medium mb-5">404 - Page Not Found</h1>
            <p class="text-xl">"Sometimes I feel like I'm fighting for a life I ain't got time to live."</p>
            <p class="text-xl mt-5">
                Looks like you're lost, partner. Let's get you back home.
            </p>
            <p class="text-xl mt-5">
                <a
                    href="/"
                    class="text-brand hover:underline font-bold"
                >
                    Click here to go back to the homepage
                </a>
                .
            </p>
        </div>
    );
}
