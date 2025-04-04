<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <div class="row mt-4">
      <div class="col-md-4 mb-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">Usuarios</h5>
            <p class="card-text display-4">{{ stats.userCount || 0 }}</p>
            <router-link
              to="/users"
              class="btn btn-light"
              v-if="canManageUsers"
            >
              Ver Usuarios
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">Productos</h5>
            <p class="card-text display-4">{{ stats.productCount || 0 }}</p>
            <router-link to="/products" class="btn btn-light">
              Ver Productos
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <h5 class="card-title">Agencias</h5>
            <p class="card-text display-4">{{ stats.agencyCount || 0 }}</p>
            <router-link
              to="/agencies"
              class="btn btn-light"
              v-if="isSuperAdmin"
            >
              Ver Agencias
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header bg-dark text-white">
            Información de Usuario
          </div>
          <div class="card-body">
            <p>
              <strong>Nombre:</strong> {{ user.nombre }} {{ user.apellidos }}
            </p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Rol:</strong> {{ formatRole(user.role) }}</p>
            <p v-if="user.agencyId">
              <strong>Agencia:</strong>
              {{ user.agency?.nombre || "No disponible" }}
            </p>
            <p>
              <strong>Último login:</strong> {{ formatDate(user.lastLogin) }}
            </p>
            <router-link to="/profile" class="btn btn-primary">
              Editar Perfil
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header bg-dark text-white">Actividad Reciente</div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <div v-else-if="activities.length === 0" class="text-center">
              <p>No hay actividades recientes</p>
            </div>
            <ul v-else class="list-group">
              <li
                v-for="(activity, index) in activities"
                :key="index"
                class="list-group-item"
              >
                {{ activity.action }} - {{ formatDate(activity.date) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Dashboard",
  data() {
    return {
      stats: {
        userCount: 0,
        productCount: 0,
        agencyCount: 0,
      },
      activities: [],
      loading: true,
    };
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    isSuperAdmin() {
      return this.$store.getters.isSuperAdmin;
    },
    isAgencyAdmin() {
      return this.$store.getters.isAgencyAdmin;
    },
    canManageUsers() {
      return this.isSuperAdmin || this.isAgencyAdmin;
    },
  },
  methods: {
    formatRole(role) {
      const roles = {
        super_admin: "Super Administrador",
        agency_admin: "Administrador de Agencia",
        agency_user: "Usuario de Agencia",
        customer: "Cliente",
      };
      return roles[role] || role;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    async fetchStats() {
      try {
        // En una implementación real, obtendrías estos datos de tu API
        // const response = await axios.get('/api/stats');
        // this.stats = response.data;

        // Simulación para este ejemplo
        this.stats = {
          userCount: 5,
          productCount: 10,
          agencyCount: 2,
        };
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    },
    async fetchActivities() {
      try {
        // En una implementación real, obtendrías estos datos de tu API
        // const response = await axios.get('/api/activities');
        // this.activities = response.data;

        // Simulación para este ejemplo
        this.activities = [
          { action: "Inicio de sesión", date: new Date() },
          {
            action: "Producto actualizado",
            date: new Date(Date.now() - 3600000),
          },
          { action: "Usuario creado", date: new Date(Date.now() - 86400000) },
        ];
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.fetchStats();
    this.fetchActivities();
  },
};
</script>
