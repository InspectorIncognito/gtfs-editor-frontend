<template>
  <ul class="language-switch">
    <li v-for="locale in locales" :key="locale" @click="switchLocale(locale)"
        :class="{active: locale === currentLanguage}">
      <span>{{ getFlag(locale) }} {{ locale }}</span>
    </li>
  </ul>
</template>


<script>

export default {
  name: 'LocaleSwitcher',
  computed: {
    locales() {
      return this.$store.getters['lang/getSupportedLocaleList'];
    },
    currentLanguage() {
      return this.$store.getters['lang/getCurrentLanguage'];
    }
  },
  methods: {
    switchLocale(locale) {
      this.$store.dispatch("lang/changeLanguage", {
        i18n: this.$i18n,
        locale: locale
      });
    },
    getFlag(locale) {
      return this.$store.getters["lang/getFlagByLocaleDict"][locale];
    }
  }
}
</script>

<style scoped>
li {
  text-decoration: underline;
  color: #459CE7;
  cursor: pointer;
}

li.active {
  font-weight: 500;
  color: white;
  opacity: 1
}
</style>
