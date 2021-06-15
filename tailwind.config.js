module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  prefix: "tw-",
  theme: {
    extend: {
      colors: {
        brickLightGreen: "#C7D28A",
      },
      fontFamily: {
        // Shown in the SocialBar component as font-open-sans
        oswald: '"Oswald", sans-serif',
        zilla: '"Zilla Slab", serif'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
