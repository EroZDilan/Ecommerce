// src/store/index.js
import { createStore } from "vuex";
import axios from "axios";

// Configurar Axios
axios.defaults.baseURL = "http://localhost:3000/api";

const store = createStore({
  state: {
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "{}"),
    loading: false,
    error: null,
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    user: (state) => state.user,
    isSuperAdmin: (state) => state.user?.role === "super_admin",
    isAgencyAdmin: (state) => state.user?.role === "agency_admin",
    isAgencyUser: (state) => state.user?.role === "agency_user",
    isCustomer: (state) => state.user?.role === "customer",
    authStatus: (state) => state.status,
    loading: (state) => state.loading,
    error: (state) => state.error,
  },
  mutations: {
    AUTH_REQUEST(state) {
      state.loading = true;
      state.error = null;
    },
    AUTH_SUCCESS(state, { token, user }) {
      state.loading = false;
      state.token = token;
      state.user = user;
      state.error = null;
    },
    AUTH_ERROR(state, error) {
      state.loading = false;
      state.error = error;
    },
    LOGOUT(state) {
      state.token = "";
      state.user = {};
    },
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      commit("AUTH_REQUEST");

      try {
        // En una implementación real, esto sería una llamada al backend
        // const response = await axios.post('/login', credentials);
        // const { token, user } = response.data;

        // Simulación para este ejemplo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simular diferentes tipos de usuario según el email
        let user = {
          id: "1",
          nombre: "Admin",
          apellidos: "Sistema",
          email: credentials.email,
          role: "customer", // Por defecto
          activo: true,
        };

        if (credentials.email === "admin@ejemplo.com") {
          user.role = "super_admin";
        } else if (credentials.email === "admin-agencia@ejemplo.com") {
          user.role = "agency_admin";
          user.agencyId = "1";
          user.agency = { id: "1", nombre: "Agencia Principal" };
        } else if (credentials.email === "usuario@ejemplo.com") {
          user.role = "agency_user";
          user.agencyId = "1";
          user.agency = { id: "1", nombre: "Agencia Principal" };
        }

        const token =
          "token-simulado-" + Math.random().toString(36).substring(2);

        // Guardar token en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Establecer token en headers para futuras peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        commit("AUTH_SUCCESS", { token, user });
        return { token, user };
      } catch (error) {
        commit(
          "AUTH_ERROR",
          error.response?.data?.message || "Error de autenticación"
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw error;
      }
    },
    async register({ commit }, userData) {
      commit("AUTH_REQUEST");

      try {
        // En una implementación real, esto sería una llamada al backend
        // const response = await axios.post('/register', userData);
        // const { token, user } = response.data;

        // Simulación para este ejemplo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const user = {
          id: Date.now().toString(),
          nombre: userData.nombre,
          apellidos: userData.apellidos,
          email: userData.email,
          role: "customer",
          activo: true,
        };

        const token =
          "token-simulado-" + Math.random().toString(36).substring(2);

        // Guardar token en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Establecer token en headers para futuras peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        commit("AUTH_SUCCESS", { token, user });
        return { token, user };
      } catch (error) {
        commit(
          "AUTH_ERROR",
          error.response?.data?.message || "Error de registro"
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw error;
      }
    },
    async autoLogin({ commit }) {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (token && user?.id) {
        // En una implementación real, verificarías el token con el backend
        // Establecer token en headers para futuras peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        commit("AUTH_SUCCESS", { token, user });
      }
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        commit("LOGOUT");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        resolve();
      });
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    },
  },
});

export default store;
