import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "match-all": "rgb(138, 0, 184)",
        'match-all-bg': 'rgb(170, 100, 250)',
        'match-genre' : 'rgb(0 55 184)',
        'match-genre-bg': 'rgb(100 150 250)',
        'base-color': '#2a475e'
      },
    },
  },
  mode: "jit",
  plugins: [],
};
export default config;
