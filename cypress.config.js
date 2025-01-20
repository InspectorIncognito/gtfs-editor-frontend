const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:8080",
    env: {
      VUE_APP_I18N_LOCALE: "es",
      VUE_APP_BASE_URL: "http://localhost:8080",
    },
    supportFile: 'cypress/support/index.js',
  },
})
