"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/price.routes.ts
const express_1 = require("express");
const price_controller_1 = __importDefault(require("../controllers/price.controller"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = (0, express_1.Router)();
// Rutas para gestión de precios (protegidas)
router.post("/", auth_middlewares_1.authenticate, auth_middlewares_1.canManagePrices, price_controller_1.default.createPrice);
router.put("/:id", auth_middlewares_1.authenticate, auth_middlewares_1.canManagePrices, price_controller_1.default.updatePrice);
router.get("/:id", auth_middlewares_1.authenticate, price_controller_1.default.getPriceById);
// Rutas para consultar precios de productos
router.get("/product/:productId", auth_middlewares_1.authenticate, price_controller_1.default.getProductPrices);
// Rutas para precios de agencias (solo admins)
router.get("/agency/:agencyId", auth_middlewares_1.authenticate, auth_middlewares_1.canViewAgencyPrices, price_controller_1.default.getAgencyPrices);
// Rutas para visibilidad de precios
router.put("/:id/customer-visible", auth_middlewares_1.authenticate, auth_middlewares_1.canManagePrices, price_controller_1.default.setCustomerVisiblePrice);
router.put("/:id/agency-visible", auth_middlewares_1.authenticate, auth_middlewares_1.isSuperAdmin, price_controller_1.default.setAgencyVisiblePrice);
// Rutas para gestión de tasas de cambio (solo super admin)
router.post("/currency-rate", auth_middlewares_1.authenticate, auth_middlewares_1.isSuperAdmin, price_controller_1.default.setCurrencyRate);
router.get("/currency-rates", auth_middlewares_1.authenticate, price_controller_1.default.getCurrencyRates);
// Ruta para conversión de monedas (accesible para todos los usuarios autenticados)
router.post("/convert", auth_middlewares_1.authenticate, price_controller_1.default.convertPrice);
exports.default = router;
