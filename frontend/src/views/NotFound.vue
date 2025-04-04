<!-- src/views/NotFound.vue -->
<template>
  <div class="not-found-page">
    <div class="container text-center">
      <div class="error-container">
        <h1 class="display-1">404</h1>
        <h2 class="mb-4">Página no encontrada</h2>
        <p class="lead mb-4">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <router-link to="/" class="btn btn-primary btn-lg">
          Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found-page {
  padding: 80px 0;
}

.error-container {
  max-width: 600px;
  margin: 0 auto;
}

.display-1 {
  font-size: 6rem;
  font-weight: 700;
  color: #dc3545;
}
</style>
