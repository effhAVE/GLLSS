import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import About from '../views/About.vue'
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
    path: "/login",
    name: "Login",
    component: Login
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
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: "*",
    name: "404",
    component: About
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
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
  if (to.matched.some(record => record.meta.requiredRole)) {
    if (store.state.user.roles.includes(to.meta.requiredRole)) {
      return next();
    }

    next("/restricted");
  } else {
    next();
  }
});

export default router
