import {USER_ID_STORAGE_KEY, USER_TOKEN_STORAGE_KEY} from '@/utils/consts.js';
import auth from "@/api/user/auth";


export default {
  namespaced: true,
  state: {
    token: null,
    userId: null
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem(USER_TOKEN_STORAGE_KEY, token);
    },
    setUserId(state, userId) {
      state.userId = userId
      localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    },
    clearAuthData(state) {
      state.token = null;
      state.userId = null;
      localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
  },
  actions: {
    login({commit}, {username, password}) {
      return auth.login(username, password).then(response => {
        const token = response.data;
        commit('setUserId', username);
        commit('setToken', token);
      });
    },
    logout({commit}) {
      return auth.logout().then(() => {
        commit('clearAuthData');
      });
    },
    autologin({commit}) {
      const token = localStorage.getItem(USER_TOKEN_STORAGE_KEY);
      const userId = localStorage.getItem(USER_ID_STORAGE_KEY);

      if (token && userId) {
        commit('setToken', token);
        commit('setUserId', userId);
      }
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token && !!state.userId;
    },
    getUserId(state) {
      return state.userId;
    },
    getToken(state) {
      return state.token;
    },
  }
}
