import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import PasswordReset from '../views/PasswordReset'
import ForgotPassword from '../views/ForgotPassword'
import EmailVerification from '../views/EmailVerification'
import Register from '../views/Register.vue'
import Calendar from '../views/Calendar.vue'
import Schedule from '../views/Schedule.vue'
import Teamkills from '../views/Teamkills.vue'
import ApexAutoscoring from '../views/ApexAutoscoring.vue'
import AboutMe from '../views/AboutMe.vue'
import Accounts from '../views/Accounts.vue'
import Codes from '../views/Codes.vue'
import Articles from '../views/Articles.vue'
import ArticlesCreate from '../views/ArticlesCreate.vue'
import Data from '../views/Data.vue'
import DataMonthPage from '../views/generic/DataMonthPage.vue'
import Series from '../views/Series.vue'
import SeriesPage from '../views/generic/SeriesPage.vue'
import Tournaments from '../views/Tournaments.vue'
import TournamentPage from '../views/generic/TournamentPage.vue'
import ArticlePage from '../views/generic/ArticlePage.vue'
import Page404 from '../views/generic/Page404.vue'
import Page403 from '../views/generic/Page403.vue'
import ConfirmUsers from '../views/admin/ConfirmUsers.vue'
import Users from '../views/admin/Users.vue'
import Admin from '../views/admin/Admin.vue'
import TournamentCreate from '../views/admin/TournamentCreate.vue'
import SeriesCreate from '../views/admin/SeriesCreate.vue'
import DataCreate from '../views/admin/DataCreate.vue'
import AccountCreate from '../views/admin/AccountCreate.vue'
import CodeCreate from '../views/admin/CodeCreate.vue'
import store from "../store"

Vue.use(VueRouter)

const routes = [{
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/teamkills",
    name: "Teamkills",
    component: Teamkills,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/apex",
    name: "Apex Autoscoring",
    component: ApexAutoscoring,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/aboutme",
    name: "About me",
    component: AboutMe
  },
  {
    path: "/schedule",
    name: "Schedule",
    component: Schedule,
    meta: {
      requiresAuth: true,
      requiredRole: "teamleader"
    }
  },
  {
    path: "/accounts",
    name: "Accounts",
    component: Accounts,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/codes",
    name: "Codes",
    component: Codes,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/articles",
    name: "Articles",
    component: Articles,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/articles/create",
    name: "Create an article",
    component: ArticlesCreate,
    meta: {
      requiresAuth: true,
      requiredRole: "teamleader"
    }
  },
  {
    path: "/data",
    name: "Data",
    component: Data,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: Calendar,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/data/:date",
    name: "Data month",
    component: DataMonthPage,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/series",
    name: "Series",
    component: Series,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/series/:seriesID",
    component: SeriesPage,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
    }
  },
  {
    path: "/tournaments",
    name: "Tournaments",
    component: Tournaments,
    meta: {
      requiresAuth: true,
      requiredRole: "host"
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
    path: "/articles/:articleID",
    name: "Article",
    component: ArticlePage,
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
    path: "/verify-email",
    name: "Email verification",
    component: EmailVerification
  },
  {
    path: "/password-reset",
    name: "Password reset",
    component: PasswordReset
  },
  {
    path: "/forgot-password",
    name: "Forgot password",
    component: ForgotPassword
  },
  {
    path: "/admin",
    meta: {
      requiresAuth: true,
      requiredRole: "admin"
    },
    component: Admin,
    children: [{
        path: "unconfirmed",
        name: "Confirm",
        component: ConfirmUsers
      },
      {
        path: "users",
        name: "Users",
        component: Users
      },
      {
        path: "tournaments/create",
        component: TournamentCreate
      },
      {
        path: "accounts/create",
        component: AccountCreate
      },
      {
        path: "series/create",
        component: SeriesCreate
      },
      {
        path: "data/create",
        component: DataCreate
      },
      {
        path: "codes/create",
        component: CodeCreate
      }
    ]
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
  if (store.getters.isLoggedIn && (to.name === "Login" || to.name === "Register" || to.name === "Password reset" || to.name === "Forgot password")) return next("/");
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
    const {
      meta: {
        requiredRole
      }
    } = to.matched.find(m => m.meta.requiredRole);
    if (user.roles.includes(requiredRole)) {
      return next();
    }

    next("/restricted");
  } else {
    next();
  }
});

export default router