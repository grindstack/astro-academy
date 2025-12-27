module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0B0D17',
        'nebula-1': '#2D0240',
        'nebula-2': '#4B2A6A',
        'starlight': '#F8FAFF',
        'accent-cyan': '#0DD3D3'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'glow-sm': '0 6px 18px rgba(13,211,211,0.08), 0 1px 0 rgba(255,255,255,0.02)'
      }
    }
  },
  plugins: []
}
