import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import PasswordReset from "../views/PasswordReset";
import ForgotPassword from "../views/ForgotPassword";
import EmailVerification from "../views/EmailVerification";
import Register from "../views/Register.vue";
import Calendar from "../views/Calendar.vue";
import Schedule from "../views/Schedule.vue";
import Teamkills from "../views/Teamkills.vue";
import ApexAutoscoring from "../views/ApexAutoscoring.vue";
import AboutMe from "../views/AboutMe.vue";
import Accounts from "../views/Accounts.vue";
import Codes from "../views/Codes.vue";
import Articles from "../views/Articles.vue";
import ArticlesCreate from "../views/ArticlesCreate.vue";
import Data from "../views/Data.vue";
import DataMonthPage from "../views/generic/DataMonthPage.vue";
import Series from "../views/Series.vue";
import SeriesPage from "../views/generic/SeriesPage.vue";
import Tournaments from "../views/Tournaments.vue";
import TournamentPage from "../views/generic/TournamentPage.vue";
import UserProfile from "../views/generic/UserProfile.vue";
import UserEdit from "../views/UserEdit.vue";
import ArticlePage from "../views/generic/ArticlePage.vue";
import Page404 from "../views/generic/Page404.vue";
import Page403 from "../views/generic/Page403.vue";
import ConfirmUsers from "../views/admin/ConfirmUsers.vue";
import Users from "../views/admin/Users.vue";
import Admin from "../views/admin/Admin.vue";
import TournamentCreate from "../views/admin/TournamentCreate.vue";
import SeriesCreate from "../views/admin/SeriesCreate.vue";
import DataCreate from "../views/admin/DataCreate.vue";
import AccountCreate from "../views/admin/AccountCreate.vue";
import CodeCreate from "../views/admin/CodeCreate.vue";
import Roles from "../views/admin/Roles.vue";

Vue.use(VueRouter);

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
    path: "/teamkills",
    name: "Teamkills",
    component: Teamkills,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/apex",
    name: "Apex Autoscoring",
    component: ApexAutoscoring,
    meta: {
      requiresAuth: true,
      requiredPermission: "general.isHost"
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
      requiredPermission: "general.isTL"
    }
  },
  {
    path: "/accounts",
    name: "Accounts",
    component: Accounts,
    meta: {
      requiresAuth: true,
      requiredPermission: "accounts.view"
    }
  },
  {
    path: "/codes",
    name: "Codes",
    component: Codes,
    meta: {
      requiresAuth: true,
      requiredPermission: "codes.view"
    }
  },
  {
    path: "/articles",
    name: "Articles",
    component: Articles,
    meta: {
      requiresAuth: true,
      requiredPermission: "articles.view"
    }
  },
  {
    path: "/articles/create",
    name: "Create an article",
    component: ArticlesCreate,
    meta: {
      requiresAuth: true,
      requiredPermission: "articles.create"
    }
  },
  {
    path: "/data",
    name: "Data",
    component: Data,
    meta: {
      requiresAuth: true,
      requiredPermission: "data.view"
    }
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: Calendar,
    meta: {
      requiresAuth: true,
      requiredPermission: "general.isHost"
    }
  },
  {
    path: "/data/:date",
    name: "Data month",
    component: DataMonthPage,
    meta: {
      requiresAuth: true,
      requiredPermission: "data.view"
    }
  },
  {
    path: "/users/:userID",
    component: UserProfile,
    meta: {
      requiresAuth: true,
      requiredPermission: "users.view"
    },
    props: true
  },

  {
    path: "/me",
    component: UserProfile,
    meta: {
      requiresAuth: true
    },
    props: {
      userID: store.state.user._id
    }
  },
  {
    path: "/me/edit",
    component: UserEdit,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/series",
    name: "Series",
    component: Series,
    meta: {
      requiresAuth: true,
      requiredPermission: "series.view"
    }
  },
  {
    path: "/series/:seriesID",
    component: SeriesPage,
    meta: {
      requiresAuth: true,
      requiredPermission: "series.view"
    }
  },
  {
    path: "/tournaments",
    name: "Tournaments",
    component: Tournaments,
    meta: {
      requiresAuth: true,
      requiredPermission: "tournaments.view"
    }
  },
  {
    path: "/tournaments/:tournamentID",
    name: "Tournament",
    component: TournamentPage,
    meta: {
      requiresAuth: true,
      requiredPermission: "tournaments.view"
    }
  },
  {
    path: "/articles/:articleID",
    name: "Article",
    component: ArticlePage,
    meta: {
      requiresAuth: true,
      requiredPermission: "articles.view"
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
      requiresAuth: true
    },
    component: Admin,
    children: [
      {
        path: "unconfirmed",
        name: "Confirm",
        component: ConfirmUsers,
        meta: {
          requiredPermission: "users.confirm"
        }
      },
      {
        path: "users",
        name: "Users",
        component: Users,
        meta: {
          requiredPermission: "users.update"
        }
      },
      {
        path: "tournaments",
        component: TournamentCreate,
        meta: {
          requiredPermission: "tournaments.create"
        }
      },
      {
        path: "accounts",
        component: AccountCreate,
        meta: {
          requiredPermission: "accounts.create"
        }
      },
      {
        path: "series",
        component: SeriesCreate,
        meta: {
          requiredPermission: "series.create"
        }
      },
      {
        path: "data",
        component: DataCreate,
        meta: {
          requiredPermission: "data.create"
        }
      },
      {
        path: "codes",
        component: CodeCreate,
        meta: {
          requiredPermission: "codes.create"
        }
      },
      {
        path: "roles",
        component: Roles,
        meta: {
          requiredPermission: "roles.view"
        }
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
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (store.getters.isLoggedIn && (to.name === "Login" || to.name === "Register" || to.name === "Password reset" || to.name === "Forgot password"))
    return next("/");
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
  if (to.matched.some(record => record.meta.requiredPermission)) {
    const {
      meta: { requiredPermission }
    } = to.matched.find(m => m.meta.requiredPermission);

    if (store.getters.hasPermission(requiredPermission)) {
      return next();
    }

    next("/restricted");
  } else {
    next();
  }
});

export default router;
