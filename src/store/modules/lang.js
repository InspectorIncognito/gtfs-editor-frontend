import {LANGUAGE_KEY} from '@/utils/consts.js';


export default {
  namespaced: true,
  state: {
    defaultLanguage: 'en',
    currentLanguage: null,
    supportedLocaleList: ["es", "en"],
    flagByLocaleDict: {
      'es': '🇪🇸',
      'en': '🇺🇸'
    }
  },
  mutations: {
    setCurrentLang(state, lang) {
      state.currentLanguage = lang;
      localStorage.setItem(LANGUAGE_KEY, lang);
    }
  },
  actions: {
    loadLanguage({commit, state}, i18n) {
      let currentLang = localStorage.getItem(LANGUAGE_KEY);
      if (['undefined', 'null', '', null, undefined].indexOf(currentLang) >= 0) {
        currentLang = state.defaultLanguage;
      }
      i18n.locale = currentLang;
      commit('setCurrentLang', currentLang);
    },
    changeLanguage({commit}, {i18n, locale}) {
      if (i18n.locale !== locale) {
        i18n.locale = locale;
        commit('setCurrentLang', locale);
      }
    }
  },
  getters: {
    getCurrentLanguage(state) {
      return state.currentLanguage;
    },
    getCurrentFlag(state) {
      return state.flagByLocaleDict(state.currentLanguage);
    },
    getFlagByLocaleDict(state) {
      return state.flagByLocaleDict;
    },
    getSupportedLocaleList(state) {
      return state.supportedLocaleList;
    },
    getDefaultLanguage(state) {
      return state.defaultLanguage;
    }
  }
}
