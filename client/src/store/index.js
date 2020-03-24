import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import greeting from "../helpers/greeting";

Vue.use(Vuex);
const APIURL = process.env.VUE_APP_APIURL;

export default new Vuex.Store({
  state: {
    status: "",
    token: localStorage.getItem("token")
  },
  mutations: {
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
    logout(state) {
      state.status = "";
      state.token = "";
    },
  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios.post(`${APIURL}/auth`, user)
        .then(response => {
          const token = response.data.token;
          const user = response.data.user;
          localStorage.setItem("token", token);
          axios.defaults.headers.common["x-auth-token"] = token;
          commit("AUTH_SUCCESS", token);
          console.log(greeting(user.nickname));
          resolve(response);
        }).catch(error => {
          commit("AUTH_ERROR");
          localStorage.removeItem("token");
          reject(error);
        });
      });
    },

    register({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit("AUTH_REQUEST");
        axios.post(`${APIURL}/users/`, user)
        .then(response => {
          const token = response.headers["x-auth-token"];
          const user = response.data;
          localStorage.setItem("token", token);
          axios.defaults.headers.common["x-auth-token"] = token;
          commit("AUTH_SUCCESS", token);
          console.log(greeting(user.nickname));
          resolve(response);
        }).catch(error => {
          commit("AUTH_ERROR");
          localStorage.removeItem("token");
          reject(error);
        });
      });
    },

    getUserData({ commit }) {
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

    logout({ commit }) {
      return new Promise((resolve, reject) => {
        commit("logout");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["x-auth-token"];
        resolve();
      })
    }
  },
  modules: {
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    user: state => state.user
  }
})
