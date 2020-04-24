import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import greeting from "../helpers/greeting";
import router from "../router"
import VueJWT from 'vuejs-jwt'

Vue.use(Vuex);
Vue.use(VueJWT, {
  keyName: "token"
});
const APIURL = process.env.VUE_APP_APIURL;

export default new Vuex.Store({
  state: {
    now: new Date(),
    status: "",
    token: localStorage.getItem("token"),
    tokenExpiry: null,
    tokenTimer: null,
    snackbar: {
      type: "",
      message: ""
    }
  },
  mutations: {
    updateDate(state) {
      state.now = new Date()
    },
    AUTH_REQUEST(state) {
      state.status = "pending";
    },
    AUTH_SUCCESS(state, token) {
      state.status = "success";
      state.token = token;
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
    logout(state) {
      state.status = "";
      state.token = "";
      state.tokenTimer = null;
    },
    snackbarMessage(state, {
      type,
      message
    }) {
      state.snackbar.type = type;
      state.snackbar.message = message;
    }
  },
  actions: {
    login({
      commit,
      dispatch
    }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios.post(`${APIURL}/auth`, user)
          .then(response => {
            if (response.type === "not-verified") {
              return reject(response.message);
            }

            const token = response.data.token;
            const user = response.data.user;
            commit("tokenUpdate", token);
            localStorage.setItem("token", token);
            const timer = dispatch("renewTokenTask");
            commit("timerUpdate", timer);
            axios.defaults.headers.common["x-auth-token"] = token;
            commit("AUTH_SUCCESS", token);
            // eslint-disable-next-line no-console
            console.log(greeting(user.nickname));
            resolve(response);
          }).catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    register({
      commit,
      dispatch
    }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios.post(`${APIURL}/users/`, user)
          .then(response => {
            resolve(response.data);
          }).catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    getUserData({
      commit
    }) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        const token = axios.defaults.headers.common["x-auth-token"];
        axios.get(`${APIURL}/users/me`)
          .then(response => {
            const user = response.data.user;
            commit("AUTH_SUCCESS", token);
            resolve(response);
          }).catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    renewTokenTask({
      dispatch,
      state
    }) {
      const now = new Date().getTime() / 1000;
      const expiry = state.tokenExpiry;
      let refreshTimeout = expiry - now;
      if (expiry - now > 65) refreshTimeout -= 60;
      else refreshTimeout = 0;
      const timer = setTimeout(() => dispatch("renewToken"), refreshTimeout * 1000);
      return timer;
    },

    renewToken({
      commit,
      dispatch
    }) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios.get(`${APIURL}/auth/renew`)
          .then(response => {
            const token = response.data;
            commit("tokenUpdate", token);
            localStorage.setItem("token", token);
            const timer = dispatch("renewTokenTask");
            commit("timerUpdate", timer);
            axios.defaults.headers.common["x-auth-token"] = token;
            commit("AUTH_SUCCESS", token);
            resolve(response);
          }).catch(error => {
            commit("AUTH_ERROR");
            localStorage.removeItem("token");
            reject(error);
          });
      });
    },

    logout({
      commit
    }) {
      return new Promise((resolve, reject) => {
        commit("logout");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["x-auth-token"];
        router.push("/login");
        resolve();
      })
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status
  }
})