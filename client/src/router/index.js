import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Tournaments from '../views/Tournaments.vue'
import TournamentPage from '../views/generic/TournamentPage.vue'
import Page404 from '../views/generic/Page404.vue'
import Page403 from '../views/generic/Page403.vue'
import store from "../store"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: "/tournaments",
    name: "Tournaments",
    component: Tournaments,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: "/tournaments/:tournamentID",
    name: "Tournament",
    component: TournamentPage,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/admin*",
    meta: {
      requiresAuth: true,
      requiredRole: "admin"
    }
  },
  {
    path: '/admin/users/unconfirmed',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "about" */ '../views/generic/Page404.vue')
  },
  {
    path: "*",
    name: "404",
    component: Page404
  },
  {
    path: "/restricted",
    name: "Restricted",
    component: Page403
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (store.getters.isLoggedIn && (to.name === "Login" || to.name === "Register")) return next("/");
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      return next();
    }

    next("/login");
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  const user = Vue.$jwt.decode();
  if (to.matched.some(record => record.meta.requiredRole)) {
    if (user.roles.includes(to.meta.requiredRole)) {
      return next();
    }

    next("/restricted");
  } else {
    next();
  }
});

export default router
