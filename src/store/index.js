import Vue from 'vue';
import Vuex from 'vuex';
import auth from '@/store/modules/auth';
import project from '@/store/modules/project';
import lang from '@/store/modules/lang';

Vue.use(Vuex)


export default new Vuex.Store({
  modules: {
    auth,
    project,
    lang
  }
})
