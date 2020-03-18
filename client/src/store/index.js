import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import greeting from "../helpers/greeting";

Vue.use(Vuex);
const APIURL = process.env.VUE_APP_APIURL;

export default new Vuex.Store({
  state: {
    status: "",
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user"))
  },
  mutations: {
    AUTH_REQUEST(state) {
      state.status = "pending";
    },
    AUTH_SUCCESS(state, { token, user }) {
      state.status = "success";
      state.token = token;
      state.user = user;
    },
    AUTH_ERROR(state) {
      state.status = "error";
    },
    logout(state) {
      state.status = "";
      state.token = "";
      state.user = "";
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
          localStorage.setItem("user", JSON.stringify(user));
          axios.defaults.headers.common["x-auth-token"] = token;
          commit("AUTH_SUCCESS", { token, user });
          console.log(greeting(user.name));
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
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["x-auth-token"];
        resolve();
      })
    },
    getUserData({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get(`${APIURL}/users/me`)
        .then(response => {
          const user = response.data;
          localStorage.setItem("user", user);
          resolve(response);
        }).catch(error => {
          localStorage.removeItem("user");
          reject(error);
        })
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
