import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import greeting from "../helpers/greeting";
import router from "../router";
import VueJWT from "vuejs-jwt";
import moment from "moment";
import VuexPersistence from "vuex-persist";

import autoscoring from "./autoscoringModule";

Vue.use(Vuex);
Vue.use(VueJWT, {
  keyName: "token"
});
const APIURL = process.env.VUE_APP_APIURL;
const vuexLocal = new VuexPersistence({
  reducer: state => ({
    autoscoring: {
      changedPlayers: state.autoscoring.changedPlayers,
      lastUpdate: state.autoscoring.lastUpdate
    }
  })
});

export default new Vuex.Store({
  modules: {
    autoscoring
  },
  state: {
    now: new Date(),
    status: "",
    token: localStorage.getItem("token"),
    user: Vue.$jwt.decode(localStorage.getItem("token")),
    preferences: null,
    tokenExpiry: null,
    tokenTimer: null,
    updateTimer: null,
    snackbar: {
      type: "",
      message: ""
    }
  },
  mutations: {
    updateDate(state) {
      state.now = moment(state.now)
        .add(1, "minutes")
        .toDate();
    },
    setDate(state, date) {
      state.now = moment(date).toDate();
    },
    AUTH_REQUEST(state) {
      state.status = "pending";
    },
    AUTH_SUCCESS(state, token) {
      state.status = "success";
      state.token = token;
      state.user = Vue.$jwt.decode(token);
    },
    AUTH_ERROR(state) {
      state.status = "error";
    },
    tokenUpdate(state, token) {
      state.tokenExpiry = Vue.$jwt.decode(token).exp;
    },
    timerUpdate(state, timer) {
      state.tokenTimer = timer;
    },
    setUserPreferences(state, preferences) {
      state.preferences = preferences;
    },
    logout(state) {
      state.status = "";
      state.token = "";
      state.user = null;
      state.preferences = null;
      clearInterval(state.tokenTimer);
      state.tokenTimer = null;
    },
    snackbarMessage(state, { type, message }) {
      state.snackbar.type = type;
      state.snackbar.message = message;
    }
  },
  actions: {
    login({ commit, dispatch, state }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios
          .post(`${APIURL}/auth`, user)
          .then(response => {
            if (response.status >= 400) {
              if (response.data.type === "not-verified") {
                return reject(response.data.message);
              } else {
                return reject(response);
              }
            }

            dispatch("getUserPreferences");
            const token = response.data.token;
            const user = response.data.user;
            commit("tokenUpdate", token);
            localStorage.setItem("token", token);
            window.clearInterval(state.updateTimer);
            state.updateTimer = null;
            commit("setDate", response.headers.date);
            state.updateTimer = window.setInterval(() => {
              commit("updateDate");
            }, 1000 * 60);
            const timer = dispatch("renewTokenTask");
            commit("timerUpdate", timer);
            axios.defaults.headers.common["x-auth-token"] = token;
            commit("AUTH_SUCCESS", token);
            // eslint-disable-next-line no-console
            console.log(greeting(user.nickname));
            resolve(response);
          })
          .catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    register({ commit, dispatch }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios
          .post(`${APIURL}/users/`, user)
          .then(response => {
            if (response.status >= 400) {
              if (response.type === "not-verified") {
                return reject(response.message);
              } else {
                return reject(response);
              }
            }

            resolve(response.data);
          })
          .catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    getUserPreferences({ commit }) {
      return new Promise((resolve, reject) => {
        const token = axios.defaults.headers.common["x-auth-token"];
        axios
          .get(`${APIURL}/users/me?fields=preferences`)
          .then(response => {
            const user = response.data;
            commit("setUserPreferences", user.preferences);
            resolve(response);
          })
          .catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    renewTokenTask({ dispatch, state }) {
      let now = state.now;
      if (!now) now = new Date();
      now = now.getTime() / 1000;
      const expiry = state.tokenExpiry;
      let refreshTimeout = expiry - now;
      if (expiry - now > 65) refreshTimeout -= 60;
      else refreshTimeout = 0;
      const timer = setTimeout(() => dispatch("renewToken"), refreshTimeout * 1000);
      return timer;
    },

    renewToken({ commit, dispatch, state }) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios
          .get(`${APIURL}/auth/renew`)
          .then(response => {
            if (!state.preferences) dispatch("getUserPreferences");
            const token = response.data;
            window.clearInterval(state.updateTimer);
            state.updateTimer = null;
            commit("setDate", response.headers.date);
            state.updateTimer = window.setInterval(() => {
              commit("updateDate");
            }, 1000 * 60);
            commit("tokenUpdate", token);
            localStorage.setItem("token", token);
            const timer = dispatch("renewTokenTask");
            commit("timerUpdate", timer);
            axios.defaults.headers.common["x-auth-token"] = token;
            commit("AUTH_SUCCESS", token);
            resolve(response);
          })
          .catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    logout({ commit }) {
      return new Promise((resolve, reject) => {
        commit("logout");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["x-auth-token"];
        router.push("/login");
        resolve();
      });
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    permissions: state => (state.user ? [...new Set(state.user.roles.map(role => role.permissions).flat())] : []),
    hasPermission: (state, getters) => permissionRequired => {
      return getters.permissions.includes(permissionRequired);
    },
    hasAnyPermission: (state, getters) => permissionsArray => {
      return permissionsArray.some(permission => getters.hasPermission(permission));
    }
  },
  plugins: [vuexLocal.plugin]
});
