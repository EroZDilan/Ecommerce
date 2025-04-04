// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import store from "../store";

// Vistas
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Products from "../views/Products.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/products",
    name: "Products",
    component: Products,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navegación guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn;
  const isSuperAdmin = store.getters.isSuperAdmin;
  const isAgencyAdmin = store.getters.isAgencyAdmin;

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isLoggedIn) {
    next("/login");
  }
  // Si la ruta requiere ser admin y el usuario no es admin
  else if (to.meta.requiresAdmin && !(isSuperAdmin || isAgencyAdmin)) {
    next("/dashboard");
  }
  // Si la ruta es login y el usuario ya está logueado
  else if (to.path === "/login" && isLoggedIn) {
    next("/dashboard");
  }
  // En cualquier otro caso, continuar
  else {
    next();
  }
});

export default router;
