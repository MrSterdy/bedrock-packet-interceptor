/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    mode: "jit",
    theme: {
        extend: {
            fontFamily: {
                raleway: ["Raleway", "sans-serif"],
                quicksand: ["Quicksand", "sans-serif"],
                vt323: ["vt323", "sans-serif"]
            }
        }
    },
    plugins: []
};
