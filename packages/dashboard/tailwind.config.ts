import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Public Sans'", "sans-serif"],
      },
      colors: {
        ink: "#0b0f14",
        fog: "#f6f4ef",
        ember: "#f36f3e",
        ocean: "#1c5d99",
        lime: "#b5e48c",
      },
      boxShadow: {
        glow: "0 0 40px rgba(243, 111, 62, 0.35)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(243, 111, 62, 0.35), rgba(11, 15, 20, 0.9) 55%)",
        "mesh":
          "radial-gradient(circle at 20% 20%, rgba(28, 93, 153, 0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(181, 228, 140, 0.35), transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
