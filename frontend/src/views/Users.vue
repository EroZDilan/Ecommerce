<!-- src/views/Users.vue -->
<template>
  <div class="users-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Gestión de Usuarios</h1>
      <button class="btn btn-primary" @click="showCreateUserModal">
        Nuevo Usuario
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="form-group">
              <label for="roleFilter" class="form-label">Rol</label>
              <select
                id="roleFilter"
                class="form-select"
                v-model="filters.role"
              >
                <option value="">Todos</option>
                <option value="super_admin" v-if="isSuperAdmin">
                  Super Admin
                </option>
                <option value="agency_admin">Admin de Agencia</option>
                <option value="agency_user">Usuario de Agencia</option>
                <option value="customer">Cliente</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="agencyFilter" class="form-label">Agencia</label>
              <select
                id="agencyFilter"
                class="form-select"
                v-model="filters.agencyId"
              >
                <option value="">Todas</option>
                <option
                  v-for="agency in agencies"
                  :key="agency.id"
                  :value="agency.id"
                >
                  {{ agency.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="statusFilter" class="form-label">Estado</label>
              <select
                id="statusFilter"
                class="form-select"
                v-model="filters.activo"
              >
                <option value="">Todos</option>
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="searchFilter" class="form-label">Buscar</label>
              <input
                type="text"
                id="searchFilter"
                class="form-control"
                placeholder="Nombre, apellido o email"
                v-model="filters.search"
              />
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12 text-end">
            <button class="btn btn-primary me-2" @click="applyFilters">
              Filtrar
            </button>
            <button class="btn btn-secondary" @click="resetFilters">
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-else-if="users.length === 0" class="text-center py-5">
          <p class="mb-0">No se encontraron usuarios</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Agencia</th>
                <th>Estado</th>
                <th>Último login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.nombre }} {{ user.apellidos }}</td>
                <td>{{ user.email }}</td>
                <td>{{ formatRole(user.role) }}</td>
                <td>{{ user.agency?.nombre || "N/A" }}</td>
                <td>
                  <span
                    :class="
                      user.activo ? 'badge bg-success' : 'badge bg-danger'
                    "
                  >
                    {{ user.activo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td>{{ formatDate(user.lastLogin) }}</td>
                <td>
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="editUser(user)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(user)"
                    >
                      Eliminar
                    </button>
                    <button
                      v-if="!user.activo"
                      class="btn btn-sm btn-outline-success"
                      @click="activateUser(user)"
                    >
                      Activar
                    </button>
                    <button
                      v-else
                      class="btn btn-sm btn-outline-warning"
                      @click="deactivateUser(user)"
                    >
                      Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <div class="modal fade" id="userModal" tabindex="-1" ref="userModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Editar Usuario" : "Nuevo Usuario" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="currentUser.nombre"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="apellidos" class="form-label">Apellidos</label>
                <input
                  type="text"
                  class="form-control"
                  id="apellidos"
                  v-model="currentUser.apellidos"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="currentUser.email"
                  required
                  :disabled="isEditing"
                />
              </div>

              <div class="mb-3" v-if="!isEditing || changePassword">
                <label for="password" class="form-label">
                  {{ isEditing ? "Nueva Contraseña" : "Contraseña" }}
                </label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="currentUser.password"
                  :required="!isEditing"
                  autocomplete="new-password"
                />
              </div>

              <div class="mb-3" v-if="isEditing">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="changePassword"
                    v-model="changePassword"
                  />
                  <label class="form-check-label" for="changePassword">
                    Cambiar contraseña
                  </label>
                </div>
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">Teléfono</label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="currentUser.phone"
                />
              </div>

              <div class="mb-3">
                <label for="role" class="form-label">Rol</label>
                <select
                  id="role"
                  class="form-select"
                  v-model="currentUser.role"
                  required
                >
                  <option value="super_admin" v-if="isSuperAdmin">
                    Super Admin
                  </option>
                  <option value="agency_admin">Admin de Agencia</option>
                  <option value="agency_user">Usuario de Agencia</option>
                  <option value="customer">Cliente</option>
                </select>
              </div>

              <div
                class="mb-3"
                v-if="
                  currentUser.role !== 'super_admin' &&
                  currentUser.role !== 'customer'
                "
              >
                <label for="agencyId" class="form-label">Agencia</label>
                <select
                  id="agencyId"
                  class="form-select"
                  v-model="currentUser.agencyId"
                  required
                >
                  <option
                    v-for="agency in agencies"
                    :key="agency.id"
                    :value="agency.id"
                  >
                    {{ agency.nombre }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="lang" class="form-label">Idioma</label>
                <select
                  id="lang"
                  class="form-select"
                  v-model="currentUser.lang"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="activo"
                  v-model="currentUser.activo"
                />
                <label class="form-check-label" for="activo">
                  Usuario activo
                </label>
              </div>

              <div class="alert alert-danger" v-if="error">
                {{ error }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveUser"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar eliminación</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar a este usuario?</p>
            <p class="mb-0">
              <strong
                >{{ userToDelete?.nombre }}
                {{ userToDelete?.apellidos }}</strong
              >
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteUser"
              :disabled="deleting"
            >
              <span
                v-if="deleting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import axios from "axios";

export default {
  name: "Users",
  data() {
    return {
      users: [],
      agencies: [],
      loading: true,
      filters: {
        role: "",
        agencyId: "",
        activo: "",
        search: "",
      },
      currentUser: {
        id: null,
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        phone: "",
        role: "customer",
        agencyId: "",
        lang: "es",
        activo: true,
      },
      isEditing: false,
      changePassword: false,
      error: null,
      saving: false,
      userToDelete: null,
      deleting: false,
      userModal: null,
      deleteModal: null,
    };
  },
  computed: {
    isSuperAdmin() {
      return this.$store.getters.isSuperAdmin;
    },
    isAgencyAdmin() {
      return this.$store.getters.isAgencyAdmin;
    },
    currentAgencyId() {
      return this.$store.getters.user?.agencyId;
    },
  },
  methods: {
    formatRole(role) {
      const roles = {
        super_admin: "Super Admin",
        agency_admin: "Admin Agencia",
        agency_user: "Usuario Agencia",
        customer: "Cliente",
      };
      return roles[role] || role;
    },
    formatDate(dateString) {
      if (!dateString) return "Nunca";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    async fetchUsers() {
      this.loading = true;
      try {
        // En una implementación real, llamarías a tu API
        // const response = await axios.get('/api/users', { params: this.filters });
        // this.users = response.data;

        // Simulación para este ejemplo
        this.users = [
          {
            id: "1",
            nombre: "Admin",
            apellidos: "Sistema",
            email: "admin@ejemplo.com",
            role: "super_admin",
            activo: true,
            lastLogin: new Date(),
            agencyId: null,
            agency: null,
          },
          {
            id: "2",
            nombre: "Admin",
            apellidos: "Agencia",
            email: "admin-agencia@ejemplo.com",
            role: "agency_admin",
            activo: true,
            lastLogin: new Date(Date.now() - 86400000),
            agencyId: "1",
            agency: { id: "1", nombre: "Agencia Principal" },
          },
          {
            id: "3",
            nombre: "Usuario",
            apellidos: "Prueba",
            email: "usuario@ejemplo.com",
            role: "agency_user",
            activo: true,
            lastLogin: null,
            agencyId: "1",
            agency: { id: "1", nombre: "Agencia Principal" },
          },
          {
            id: "4",
            nombre: "Cliente",
            apellidos: "Ejemplo",
            email: "cliente@ejemplo.com",
            role: "customer",
            activo: false,
            lastLogin: new Date(Date.now() - 604800000),
            agencyId: null,
            agency: null,
          },
        ];

        // Si eres admin de agencia, filtra solo tus usuarios
        if (this.isAgencyAdmin && !this.isSuperAdmin) {
          this.users = this.users.filter(
            (user) => user.agencyId === this.currentAgencyId
          );
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchAgencies() {
      try {
        // En una implementación real, llamarías a tu API
        // const response = await axios.get('/api/agencies');
        // this.agencies = response.data;

        // Simulación para este ejemplo
        this.agencies = [
          { id: "1", nombre: "Agencia Principal" },
          { id: "2", nombre: "Agencia Secundaria" },
        ];

        // Si eres admin de agencia, solo muestra tu agencia
        if (this.isAgencyAdmin && !this.isSuperAdmin) {
          this.agencies = this.agencies.filter(
            (agency) => agency.id === this.currentAgencyId
          );
        }
      } catch (error) {
        console.error("Error al obtener agencias:", error);
      }
    },
    applyFilters() {
      this.fetchUsers();
    },
    resetFilters() {
      this.filters = {
        role: "",
        agencyId: "",
        activo: "",
        search: "",
      };
      this.fetchUsers();
    },
    showCreateUserModal() {
      this.isEditing = false;
      this.changePassword = false;
      this.error = null;

      // Resetear el formulario
      this.currentUser = {
        id: null,
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        phone: "",
        role: "customer",
        agencyId: this.isAgencyAdmin ? this.currentAgencyId : "",
        lang: "es",
        activo: true,
      };

      this.userModal.show();
    },
    editUser(user) {
      this.isEditing = true;
      this.changePassword = false;
      this.error = null;

      // Clonar el usuario para editar
      this.currentUser = { ...user, password: "" };

      this.userModal.show();
    },
    async saveUser() {
      this.saving = true;
      this.error = null;

      try {
        // En una implementación real, llamarías a tu API
        /*
        let response;
        if (this.isEditing) {
          const userData = { ...this.currentUser };
          if (!this.changePassword) {
            delete userData.password;
          }
          response = await axios.put(`/api/users/${this.currentUser.id}`, userData);
        } else {
          response = await axios.post('/api/users', this.currentUser);
        }
        */

        // Simulación de guardado exitoso
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refrescar lista de usuarios
        this.fetchUsers();

        // Cerrar modal
        this.userModal.hide();

        // Mostrar mensaje de éxito
        alert(
          `Usuario ${this.isEditing ? "actualizado" : "creado"} correctamente`
        );
      } catch (error) {
        console.error("Error al guardar usuario:", error);
        this.error =
          error.response?.data?.message || "Error al guardar el usuario";
      } finally {
        this.saving = false;
      }
    },
    confirmDelete(user) {
      this.userToDelete = user;
      this.deleteModal.show();
    },
    async deleteUser() {
      this.deleting = true;

      try {
        // En una implementación real, llamarías a tu API
        // await axios.delete(`/api/users/${this.userToDelete.id}`);

        // Simulación de eliminación exitosa
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refrescar lista de usuarios
        this.fetchUsers();

        // Cerrar modal
        this.deleteModal.hide();

        // Mostrar mensaje de éxito
        alert("Usuario eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar el usuario");
      } finally {
        this.deleting = false;
        this.userToDelete = null;
      }
    },
    async activateUser(user) {
      try {
        // En una implementación real, llamarías a tu API
        // await axios.put(`/api/users/${user.id}/activate`);

        // Simulación de activación exitosa
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Actualizar usuario localmente
        user.activo = true;

        // Mostrar mensaje de éxito
        alert("Usuario activado correctamente");
      } catch (error) {
        console.error("Error al activar usuario:", error);
        alert("Error al activar el usuario");
      }
    },
    async deactivateUser(user) {
      try {
        // En una implementación real, llamarías a tu API
        // await axios.put(`/api/users/${user.id}/deactivate`);

        // Simulación de desactivación exitosa
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Actualizar usuario localmente
        user.activo = false;

        // Mostrar mensaje de éxito
        alert("Usuario desactivado correctamente");
      } catch (error) {
        console.error("Error al desactivar usuario:", error);
        alert("Error al desactivar el usuario");
      }
    },
  },
  mounted() {
    // Inicializar modales de Bootstrap
    this.userModal = new Modal(this.$refs.userModal);
    this.deleteModal = new Modal(this.$refs.deleteModal);

    // Cargar datos iniciales
    this.fetchAgencies();
    this.fetchUsers();
  },
};
</script>
