module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2933',
        muted: '#52606D',
        paper: '#F7F8FA',
        line: '#D5DAE1',
        route: { DEFAULT: '#1D4ED8', dark: '#1E3A8A' },
        violet: { DEFAULT: '#5B21B6' },
        lane: '#F2B705',
        bar: '#64748B',
      },
      fontFamily: {
        sans: ['Overpass', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
