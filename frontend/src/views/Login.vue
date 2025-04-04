<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Iniciar Sesión</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="login">
              <div class="alert alert-danger" v-if="error">
                {{ error }}
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                  autocomplete="current-password"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: null,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;

      try {
        await this.$store.dispatch("login", {
          email: this.email,
          password: this.password,
        });

        // Redireccionar según el rol del usuario
        if (
          this.$store.getters.isSuperAdmin ||
          this.$store.getters.isAgencyAdmin
        ) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/products");
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al iniciar sesión";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  margin-top: 60px;
}
</style>
