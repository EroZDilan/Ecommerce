"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = (0, express_1.Router)();
// Rutas públicas
router.post("/login", user_controller_1.default.login);
router.post("/register", user_controller_1.default.registerCustomer);
router.post("/password-reset-request", user_controller_1.default.requestPasswordReset);
router.post("/password-reset", user_controller_1.default.resetPassword);
// Rutas protegidas - Perfil de usuario
router.get("/profile", auth_middlewares_1.authenticate, user_controller_1.default.getProfile);
router.put("/profile", auth_middlewares_1.authenticate, user_controller_1.default.updateProfile);
router.post("/change-password", auth_middlewares_1.authenticate, user_controller_1.default.changePassword);
// Rutas de administración - Super Admin
router.post("/super-admin", auth_middlewares_1.authenticate, auth_middlewares_1.isSuperAdmin, user_controller_1.default.createSuperAdmin);
router.get("/all", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.getAllUsers);
router.post("/agency/:agencyId/admin", auth_middlewares_1.authenticate, auth_middlewares_1.isSuperAdmin, user_controller_1.default.createAgencyAdmin);
// Rutas de administración - Admin de Agencia
router.post("/agency/:agencyId/user", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, auth_middlewares_1.belongsToAgency, user_controller_1.default.createAgencyUser);
// Rutas para gestión de usuarios específicos
router.get("/:id", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.getUserById);
router.put("/:id", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.updateUser);
router.put("/:id/role", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.changeUserRole);
router.put("/:id/activate", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.activateUser);
router.put("/:id/deactivate", auth_middlewares_1.authenticate, auth_middlewares_1.isAdminOrAgencyAdmin, user_controller_1.default.deactivateUser);
exports.default = router;
