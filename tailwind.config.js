export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors:{
        bgDark:"#020617",        // page background
        card:"#0B1220",          // cards background
        border:"#1E293B",        // borders
        textMuted:"#94A3B8",     // gray text
        primary:"#22C55E",       // green buttons
        primaryHover:"#16A34A"   // button hover
      }
    },
  },
  plugins: [],
}