/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        status: {
          open: '#2563eb',      // Blue
          inProgress: '#d97706',// Yellow/Amber
          resolved: '#16a34a',  // Green
          closed: '#4b5563'     // Gray
        },
        priority: {
          low: '#6b7280',     // Gray
          medium: '#2563eb',  // Blue
          high: '#f97316',    // Orange
          urgent: '#dc2626'   // Red
        }
      }
    },
  },
  plugins: [],
}