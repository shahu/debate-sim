/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pm': '#3B82F6',
        'pm-light': '#DBEAFE',
        'lo': '#EF4444',
        'lo-light': '#FEE2E2',
        'mo': '#F97316',
        'mo-light': '#FFEDD5',
        'pw': '#22C55E',
        'pw-light': '#DCFCE7',
      },
    },
  },
  plugins: [],
}
