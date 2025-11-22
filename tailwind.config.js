/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                "brand": "#c9a383",
                "brand-accent": "#ff007f",
                "gray-dark": "#282629",
                "white-secondary": "#f7f7f7",
                "gray-light": "#d4d4d4",
                "gray": "#333333",
            },
        },
        fontFamily: {
            "sans": "'Special Elite', cursive",
        }
    },
    plugins: [],
};
