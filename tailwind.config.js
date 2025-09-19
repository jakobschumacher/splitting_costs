module.exports = {
  content: ["./src/**/*.{html,js}", "./public/**/*.html"],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}