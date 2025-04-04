<!-- src/views/Products.vue -->
<template>
  <div class="products-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Gestión de Productos</h1>
      <button class="btn btn-primary" @click="showCreateProductModal">
        Nuevo Producto
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="form-group">
              <label for="typeFilter" class="form-label"
                >Tipo de Producto</label
              >
              <select
                id="typeFilter"
                class="form-select"
                v-model="filters.tipoProducto"
              >
                <option value="">Todos</option>
                <option value="physical">Físico</option>
                <option value="digital">Digital</option>
                <option value="service">Servicio</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="departmentFilter" class="form-label"
                >Departamento</label
              >
              <select
                id="departmentFilter"
                class="form-select"
                v-model="filters.departamentoId"
              >
                <option value="">Todos</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.nombre }}
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
                placeholder="Nombre, descripción..."
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

    <!-- Lista de productos -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-else-if="products.length === 0" class="text-center py-5">
          <p class="mb-0">No se encontraron productos</p>
        </div>
        <div v-else>
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div class="col" v-for="product in products" :key="product.id">
              <div class="card h-100">
                <img
                  :src="
                    product.imagenes && product.imagenes.length
                      ? product.imagenes[0].url
                      : 'https://via.placeholder.com/300x200'
                  "
                  class="card-img-top"
                  alt="Imagen del producto"
                />
                <div class="card-body">
                  <h5 class="card-title">{{ product.nombre }}</h5>

                  <div class="mb-2">
                    <span class="badge bg-primary me-1">{{
                      formatProductType(product.tipoProducto)
                    }}</span>
                    <span
                      :class="
                        product.activo ? 'badge bg-success' : 'badge bg-danger'
                      "
                    >
                      {{ product.activo ? "Activo" : "Inactivo" }}
                    </span>
                  </div>

                  <p class="card-text">
                    {{ truncateText(product.descripcion, 100) }}
                  </p>

                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span class="fw-bold">{{
                      formatPrice(product.basePrice)
                    }}</span>
                    <div class="btn-group">
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="editProduct(product)"
                      >
                        Editar
                      </button>
                      <button
                        class="btn btn-sm btn-outline-success"
                        @click="viewPrices(product)"
                      >
                        Precios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar producto -->
    <div class="modal fade" id="productModal" tabindex="-1" ref="productModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Editar Producto" : "Nuevo Producto" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    type="text"
                    class="form-control"
                    id="nombre"
                    v-model="currentProduct.nombre"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label for="nombreTraducido" class="form-label"
                    >Nombre (Traducido)</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="nombreTraducido"
                    v-model="currentProduct.nombreTraducido"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="marca" class="form-label">Marca</label>
                  <input
                    type="text"
                    class="form-control"
                    id="marca"
                    v-model="currentProduct.marca"
                  />
                </div>

                <div class="col-md-4 mb-3">
                  <label for="tipoProducto" class="form-label"
                    >Tipo de Producto</label
                  >
                  <select
                    id="tipoProducto"
                    class="form-select"
                    v-model="currentProduct.tipoProducto"
                    required
                  >
                    <option value="physical">Físico</option>
                    <option value="digital">Digital</option>
                    <option value="service">Servicio</option>
                  </select>
                </div>

                <div class="col-md-4 mb-3">
                  <label for="departamentoId" class="form-label"
                    >Departamento</label
                  >
                  <select
                    id="departamentoId"
                    class="form-select"
                    v-model="currentProduct.departamentoId"
                  >
                    <option value="">Sin departamento</option>
                    <option
                      v-for="dept in departments"
                      :key="dept.id"
                      :value="dept.id"
                    >
                      {{ dept.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea
                  class="form-control"
                  id="descripcion"
                  rows="3"
                  v-model="currentProduct.descripcion"
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="descripcionTraducida" class="form-label"
                  >Descripción (Traducida)</label
                >
                <textarea
                  class="form-control"
                  id="descripcionTraducida"
                  rows="3"
                  v-model="currentProduct.descripcionTraducida"
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="peso" class="form-label">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    id="peso"
                    v-model="currentProduct.peso"
                  />
                </div>

                <div class="col-md-8 mb-3">
                  <label for="etiquetas" class="form-label"
                    >Etiquetas (separadas por coma)</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="etiquetas"
                    v-model="tagsInput"
                    placeholder="ej: nuevo,oferta,premium"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Inventario</label>
                <div class="row">
                  <div class="col-md-6">
                    <select
                      class="form-select"
                      v-model="currentProduct.tipoInventario"
                    >
                      <option value="simple">Simple (cantidad)</option>
                      <option value="attribute_based">
                        Basado en atributos
                      </option>
                      <option value="unlimited">Ilimitado</option>
                    </select>
                  </div>
                  <div
                    class="col-md-6"
                    v-if="currentProduct.tipoInventario === 'simple'"
                  >
                    <input
                      type="number"
                      min="0"
                      class="form-control"
                      placeholder="Cantidad"
                      v-model="currentProduct.cantidadInventario"
                    />
                  </div>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="disponibleParaCombo"
                      v-model="currentProduct.disponibleParaCombo"
                    />
                    <label class="form-check-label" for="disponibleParaCombo">
                      Disponible para combo
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="activo"
                      v-model="currentProduct.activo"
                    />
                    <label class="form-check-label" for="activo">
                      Producto activo
                    </label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="notas" class="form-label">Notas</label>
                <textarea
                  class="form-control"
                  id="notas"
                  rows="2"
                  v-model="currentProduct.notas"
                ></textarea>
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
              @click="saveProduct"
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

    <!-- Modal para precios -->
    <div class="modal fade" id="pricesModal" tabindex="-1" ref="pricesModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Precios: {{ selectedProduct?.nombre }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-end mb-3">
              <button class="btn btn-sm btn-primary" @click="addPrice">
                Añadir Precio
              </button>
            </div>

            <div v-if="loadingPrices" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando precios...</span>
              </div>
            </div>
            <div v-else-if="prices.length === 0" class="text-center py-4">
              <p>No hay precios definidos para este producto</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Moneda</th>
                    <th>Agencia</th>
                    <th>Visible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="price in prices" :key="price.id">
                    <td>{{ formatPriceType(price.audienceType) }}</td>
                    <td>{{ price.value }}</td>
                    <td>{{ price.currency.toUpperCase() }}</td>
                    <td>{{ price.agency?.nombre || "N/A" }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="
                          price.visibleClientes ? 'bg-success' : 'bg-danger'
                        "
                      >
                        {{ price.visibleClientes ? "Visible" : "No visible" }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button
                          class="btn btn-sm btn-outline-primary"
                          @click="editPrice(price)"
                        >
                          Editar
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="deletePrice(price)"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
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
  name: "Products",
  data() {
    return {
      products: [],
      departments: [],
      loading: true,
      filters: {
        tipoProducto: "",
        departamentoId: "",
        activo: "",
        search: "",
      },
      currentProduct: {
        id: null,
        nombre: "",
        nombreTraducido: "",
        marca: "",
        tipoProducto: "physical",
        departamentoId: "",
        etiquetas: [],
        descripcion: "",
        descripcionTraducida: "",
        peso: 0,
        imagenes: [],
        disponibleParaCombo: false,
        activo: true,
        tipoInventario: "simple",
        cantidadInventario: 0,
        notas: "",
      },
      tagsInput: "",
      isEditing: false,
      error: null,
      saving: false,
      productModal: null,

      // Para precios
      selectedProduct: null,
      prices: [],
      loadingPrices: false,
      pricesModal: null,
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
    formatProductType(type) {
      const types = {
        physical: "Físico",
        digital: "Digital",
        service: "Servicio",
      };
      return types[type] || type;
    },
    formatPriceType(type) {
      const types = {
        public: "Público",
        agency: "Agencia",
        customer: "Cliente",
      };
      return types[type] || type;
    },
    formatPrice(price) {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(price || 0);
    },
    truncateText(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },
    async fetchProducts() {
      this.loading = true;
      try {
        // En una implementación real, llamarías a tu API
        // const response = await axios.get('/api/products', { params: this.filters });
        // this.products = response.data;

        // Simulación para este ejemplo
        await new Promise((resolve) => setTimeout(resolve, 800));

        this.products = [
          {
            id: "1",
            nombre: "Producto Físico de Ejemplo",
            nombreTraducido: "Example Physical Product",
            marca: "MarcaTest",
            tipoProducto: "physical",
            departamentoId: "1",
            departamento: { id: "1", nombre: "Electrónica" },
            etiquetas: ["nuevo", "oferta"],
            descripcion:
              "Este es un producto físico de ejemplo para la tienda.",
            descripcionTraducida:
              "This is an example physical product for the store.",
            peso: 1.5,
            imagenes: [
              { url: "https://via.placeholder.com/300x200", isPrimary: true },
            ],
            disponibleParaCombo: true,
            activo: true,
            tipoInventario: "simple",
            cantidadInventario: 100,
            notas: "",
            basePrice: 99.99,
          },
          {
            id: "2",
            nombre: "Servicio Premium",
            nombreTraducido: "Premium Service",
            marca: "ServiciosTest",
            tipoProducto: "service",
            departamentoId: "2",
            departamento: { id: "2", nombre: "Servicios" },
            etiquetas: ["premium", "exclusivo"],
            descripcion: "Servicio premium con atención personalizada.",
            descripcionTraducida:
              "Premium service with personalized attention.",
            peso: 0,
            imagenes: [],
            disponibleParaCombo: false,
            activo: true,
            tipoInventario: "unlimited",
            cantidadInventario: 0,
            notas: "Disponible solo por reserva",
            basePrice: 199.99,
          },
          {
            id: "3",
            nombre: "Producto Digital",
            nombreTraducido: "Digital Product",
            marca: "DigitalTest",
            tipoProducto: "digital",
            departamentoId: "3",
            departamento: { id: "3", nombre: "Digital" },
            etiquetas: ["digital", "descarga"],
            descripcion: "Producto digital para descarga inmediata.",
            descripcionTraducida: "Digital product for immediate download.",
            peso: 0,
            imagenes: [
              { url: "https://via.placeholder.com/300x200", isPrimary: true },
            ],
            disponibleParaCombo: true,
            activo: false,
            tipoInventario: "unlimited",
            cantidadInventario: 0,
            notas: "",
            basePrice: 29.99,
          },
        ];
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchDepartments() {
      try {
        // En una implementación real, llamarías a tu API
        // const response = await axios.get('/api/departments');
        // this.departments = response.data;

        // Simulación para este ejemplo
        this.departments = [
          { id: "1", nombre: "Electrónica" },
          { id: "2", nombre: "Servicios" },
          { id: "3", nombre: "Digital" },
          { id: "4", nombre: "Hogar" },
        ];
      } catch (error) {
        console.error("Error al obtener departamentos:", error);
      }
    },
    applyFilters() {
      this.fetchProducts();
    },
    resetFilters() {
      this.filters = {
        tipoProducto: "",
        departamentoId: "",
        activo: "",
        search: "",
      };
      this.fetchProducts();
    },
    showCreateProductModal() {
      this.isEditing = false;
      this.error = null;
      this.tagsInput = "";

      // Resetear el formulario
      this.currentProduct = {
        id: null,
        nombre: "",
        nombreTraducido: "",
        marca: "",
        tipoProducto: "physical",
        departamentoId: "",
        etiquetas: [],
        descripcion: "",
        descripcionTraducida: "",
        peso: 0,
        imagenes: [],
        disponibleParaCombo: false,
        activo: true,
        tipoInventario: "simple",
        cantidadInventario: 0,
        notas: "",
      };

      this.productModal.show();
    },
    editProduct(product) {
      this.isEditing = true;
      this.error = null;

      // Clonar el producto para editar
      this.currentProduct = { ...product };

      // Preparar etiquetas
      this.tagsInput = Array.isArray(this.currentProduct.etiquetas)
        ? this.currentProduct.etiquetas.join(",")
        : "";

      this.productModal.show();
    },
    async saveProduct() {
      this.saving = true;
      this.error = null;

      try {
        // Procesar etiquetas
        if (this.tagsInput) {
          this.currentProduct.etiquetas = this.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
        } else {
          this.currentProduct.etiquetas = [];
        }

        // En una implementación real, llamarías a tu API
        /*
          let response;
          if (this.isEditing) {
            response = await axios.put(`/api/products/${this.currentProduct.id}`, this.currentProduct);
          } else {
            response = await axios.post('/api/products', this.currentProduct);
          }
          */

        // Simulación de guardado exitoso
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refrescar lista de productos
        this.fetchProducts();

        // Cerrar modal
        this.productModal.hide();

        // Mostrar mensaje de éxito
        alert(
          `Producto ${this.isEditing ? "actualizado" : "creado"} correctamente`
        );
      } catch (error) {
        console.error("Error al guardar producto:", error);
        this.error =
          error.response?.data?.message || "Error al guardar el producto";
      } finally {
        this.saving = false;
      }
    },
    async viewPrices(product) {
      this.selectedProduct = product;
      this.loadingPrices = true;

      try {
        // En una implementación real, llamarías a tu API
        // const response = await axios.get(`/api/prices/product/${product.id}`);
        // this.prices = response.data;

        // Simulación para este ejemplo
        await new Promise((resolve) => setTimeout(resolve, 600));

        this.prices = [
          {
            id: "1",
            productId: product.id,
            audienceType: "public",
            value: 99.99,
            currency: "eur",
            agencyId: null,
            agency: null,
            visibleClientes: true,
            activo: true,
          },
          {
            id: "2",
            productId: product.id,
            audienceType: "agency",
            value: 79.99,
            currency: "eur",
            agencyId: "1",
            agency: { id: "1", nombre: "Agencia Principal" },
            visibleClientes: true,
            activo: true,
          },
        ];
      } catch (error) {
        console.error("Error al obtener precios:", error);
      } finally {
        this.loadingPrices = false;
        this.pricesModal.show();
      }
    },
    addPrice() {
      // Aquí implementarías la lógica para añadir un precio
      alert("Funcionalidad para añadir precio no implementada en este ejemplo");
    },
    editPrice(price) {
      // Aquí implementarías la lógica para editar un precio
      alert("Funcionalidad para editar precio no implementada en este ejemplo");
    },
    deletePrice(price) {
      // Aquí implementarías la lógica para eliminar un precio
      alert(
        "Funcionalidad para eliminar precio no implementada en este ejemplo"
      );
    },
  },
  mounted() {
    // Inicializar modales de Bootstrap
    this.productModal = new Modal(this.$refs.productModal);
    this.pricesModal = new Modal(this.$refs.pricesModal);

    // Cargar datos iniciales
    this.fetchDepartments();
    this.fetchProducts();
  },
};
</script>
