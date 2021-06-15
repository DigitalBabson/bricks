module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  prefix: "tw-",
  theme: {
    extend: {
      colors: {
        brickLightGreen: "#C7D28A",
        brickMediumGreen: "#597c31",
        brickBabsonGreen: "#064",
        brickSummerNight: "#005172",
      },
      fontFamily: {
        // Shown in the SocialBar component as font-open-sans
        oswald: '"Oswald", sans-serif',
        zilla: '"Zilla Slab", serif',
      },
      spacing: {
        brick10: "3.4rem",
        brick20: "3.7rem",
        brick30: "4rem",
        brick50: "6rem",
        brick80: "10rem"
      },
      gap: {
        13: "3.4rem"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
