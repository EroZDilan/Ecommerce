// src/routes/price.routes.ts
import { Router } from "express";
import priceController from "../controllers/price.controller";
import {
  authenticate,
  isSuperAdmin,
  isAdminOrAgencyAdmin,
  canManagePrices,
  canViewAgencyPrices,
} from "../middlewares/auth.middlewares";

const router = Router();

// Rutas para gestión de precios (protegidas)
router.post("/", authenticate, canManagePrices, priceController.createPrice);
router.put("/:id", authenticate, canManagePrices, priceController.updatePrice);
router.get("/:id", authenticate, priceController.getPriceById);

// Rutas para consultar precios de productos
router.get(
  "/product/:productId",
  authenticate,
  priceController.getProductPrices
);

// Rutas para precios de agencias (solo admins)
router.get(
  "/agency/:agencyId",
  authenticate,
  canViewAgencyPrices,
  priceController.getAgencyPrices
);

// Rutas para visibilidad de precios
router.put(
  "/:id/customer-visible",
  authenticate,
  canManagePrices,
  priceController.setCustomerVisiblePrice
);
router.put(
  "/:id/agency-visible",
  authenticate,
  isSuperAdmin,
  priceController.setAgencyVisiblePrice
);

// Rutas para gestión de tasas de cambio (solo super admin)
router.post(
  "/currency-rate",
  authenticate,
  isSuperAdmin,
  priceController.setCurrencyRate
);
router.get("/currency-rates", authenticate, priceController.getCurrencyRates);

// Ruta para conversión de monedas (accesible para todos los usuarios autenticados)
router.post("/convert", authenticate, priceController.convertPrice);

export default router;
