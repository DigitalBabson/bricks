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
        brickBabsonGrey: "#464646",
      },
      fontFamily: {
        // Shown in the SocialBar component as font-open-sans
        oswald: '"Oswald", sans-serif',
        zilla: '"Zilla Slab", serif',
      },
      fontSize: {
        brickL: "2rem",
      },
      boxShadow: {
        brickCard: "1px 1px 5px 1px rgb(0 0 0 / 10%)",
      },
      maxWidth: {
        brickMWL: '1170px',
      },
      spacing: {
        brick3: "1.7rem",
        brick5: "2.4rem",
        brick9: "3.2rem",
        brick10: "3.4rem",
        brick20: "3.7rem",
        brick30: "4rem",
        brick35: "4.5rem",
        brick40: "5.2rem",
        brick50: "6rem",
        brick60: "7.5rem",
        brick80: "10rem",
      },
      gap: {
        13: "3.4rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
