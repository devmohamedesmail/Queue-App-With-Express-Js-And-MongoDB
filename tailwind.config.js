// tailwind.config.js
module.exports = {
    content: [
      './views/**/*.ejs',       // update based on your template files
      './public/**/*.js',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#ef4444',   // red-500
          secondary: '#3b82f6', // blue-500
        },
      },
    },
    plugins: [require('daisyui')],
  }
  