// src/routes/user.routes.ts
import { Router } from "express";
import userController from "../controllers/user.controller";
import {
  authenticate,
  isSuperAdmin,
  isAgencyAdmin,
  isAdminOrAgencyAdmin,
  belongsToAgency,
} from "../middlewares/auth.middlewares";

const router = Router();

// Rutas públicas
router.post("/login", userController.login);
router.post("/register", userController.registerCustomer);
router.post("/password-reset-request", userController.requestPasswordReset);
router.post("/password-reset", userController.resetPassword);

// Rutas protegidas - Perfil de usuario
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.post("/change-password", authenticate, userController.changePassword);

// Rutas de administración - Super Admin
router.post(
  "/super-admin",
  authenticate,
  isSuperAdmin,
  userController.createSuperAdmin
);
router.get(
  "/all",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.getAllUsers
);
router.post(
  "/agency/:agencyId/admin",
  authenticate,
  isSuperAdmin,
  userController.createAgencyAdmin
);

// Rutas de administración - Admin de Agencia
router.post(
  "/agency/:agencyId/user",
  authenticate,
  isAdminOrAgencyAdmin,
  belongsToAgency,
  userController.createAgencyUser
);

// Rutas para gestión de usuarios específicos
router.get(
  "/:id",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.getUserById
);
router.put(
  "/:id",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.updateUser
);
router.put(
  "/:id/role",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.changeUserRole
);
router.put(
  "/:id/activate",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.activateUser
);
router.put(
  "/:id/deactivate",
  authenticate,
  isAdminOrAgencyAdmin,
  userController.deactivateUser
);

export default router;
