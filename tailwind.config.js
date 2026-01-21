/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                field: "#2E7D32", // Field Green
                deepBlack: "#121212", // Deep Black
                contrastWhite: "#FFFFFF",
                whistle: "#E0E0E0", // Whistle Silver
                alert: "#D32F2F", // Alert Red
                warning: "#FBC02D", // Warning Yellow
                cardParams: "#1E1E1E", // Card Background (Dark)
                screenBg: "#121212", // Screen Background (Dark)
            },
        },
    },
    plugins: [],
}
