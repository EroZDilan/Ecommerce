"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_model_1 = require("../models/user.model");
const user_service_1 = __importDefault(require("../services/user.service"));
const errors_1 = require("../utils/errors");
class UserController {
    // Autenticación
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errors_1.BadRequestError('Email y contraseña son requeridos');
            }
            const result = await user_service_1.default.authenticate(email, password);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Registro de clientes
    async registerCustomer(req, res, next) {
        try {
            const userData = req.body;
            const newUser = await user_service_1.default.createCustomer(userData);
            // No devolver la contraseña
            const userResponse = { ...newUser };
            if (userResponse.password) {
                userResponse.password = undefined;
            }
            res.status(201).json(newUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Crear super admin - Solo disponible en desarrollo o a través de seeding
    async createSuperAdmin(req, res, next) {
        try {
            // Verificar si la solicitud viene de una fuente confiable (por ejemplo, un token especial)
            // Esto debería implementarse según las necesidades específicas de seguridad
            const userData = req.body;
            const newUser = await user_service_1.default.createSuperAdmin(userData);
            // No devolver la contraseña
            const userResponse = { ...newUser };
            if (userResponse.password) {
                userResponse.password = undefined;
            }
            res.status(201).json(newUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Crear admin de agencia (solo super admin)
    async createAgencyAdmin(req, res, next) {
        try {
            const { agencyId } = req.params;
            const userData = req.body;
            // Verificar que quien hace la solicitud es super admin (debería hacerse en middleware)
            if (req.currentUser.role !== user_model_1.UserRole.SUPER_ADMIN) {
                throw new errors_1.UnauthorizedError('Solo los super admins pueden crear admins de agencia');
            }
            const newUser = await user_service_1.default.createAgencyAdmin(userData, agencyId);
            // No devolver la contraseña
            const userResponse = { ...newUser };
            if (userResponse.password) {
                userResponse.password = undefined;
            }
            res.status(201).json(newUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Crear usuario de agencia (solo admin de agencia o super admin)
    async createAgencyUser(req, res, next) {
        try {
            const { agencyId } = req.params;
            const userData = req.body;
            // Verificar permisos (debería hacerse en middleware)
            if (req.currentUser.role !== user_model_1.UserRole.SUPER_ADMIN &&
                (req.currentUser.role !== user_model_1.UserRole.AGENCY_ADMIN || req.currentUser.agencyId !== agencyId)) {
                throw new errors_1.UnauthorizedError('No tienes permisos para crear usuarios en esta agencia');
            }
            const newUser = await user_service_1.default.createAgencyUser(userData, agencyId);
            // No devolver la contraseña
            const userResponse = { ...newUser };
            if (userResponse.password) {
                userResponse.password = undefined;
            }
            res.status(201).json(newUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener perfil del usuario autenticado
    async getProfile(req, res, next) {
        try {
            const userId = req.currentUser.userId;
            const user = await user_service_1.default.getUserById(userId);
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar perfil del usuario autenticado
    async updateProfile(req, res, next) {
        try {
            const userId = req.currentUser.userId;
            const userData = req.body;
            // No permitir cambiar el rol o la agencia desde aquí
            delete userData.role;
            delete userData.agencyId;
            const updatedUser = await user_service_1.default.updateUser(userId, userData);
            res.json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Cambiar contraseña del usuario autenticado
    async changePassword(req, res, next) {
        try {
            const userId = req.currentUser.userId;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new errors_1.BadRequestError('Se requiere la contraseña actual y la nueva');
            }
            // Verificar contraseña actual primero
            await user_service_1.default.authenticate(req.currentUser.email, currentPassword);
            // Actualizar contraseña
            await user_service_1.default.updateUser(userId, { password: newPassword });
            res.json({ message: 'Contraseña actualizada correctamente' });
        }
        catch (error) {
            next(error);
        }
    }
    // Listar todos los usuarios (con filtros, solo para admins)
    async getAllUsers(req, res, next) {
        try {
            const filters = req.query;
            // Si es admin de agencia, restringir a usuarios de su agencia
            if (req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN) {
                filters.agencyId = req.currentUser.agencyId;
            }
            const users = await user_service_1.default.getAllUsers(filters);
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener usuario por ID
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.getUserById(id);
            // Si es admin de agencia, solo puede ver usuarios de su agencia
            if (req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN &&
                user.agencyId !== req.currentUser.agencyId) {
                throw new errors_1.UnauthorizedError('No tienes permisos para ver este usuario');
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar usuario por ID (solo admins)
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const userData = req.body;
            // Obtener usuario para verificar permisos
            const user = await user_service_1.default.getUserById(id);
            // Verificar permisos
            if (req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN) {
                // Admin de agencia solo puede modificar usuarios de su agencia
                if (user.agencyId !== req.currentUser.agencyId) {
                    throw new errors_1.UnauthorizedError('No tienes permisos para modificar este usuario');
                }
                // No permitir cambiar el rol o la agencia
                delete userData.role;
                delete userData.agencyId;
            }
            const updatedUser = await user_service_1.default.updateUser(id, userData);
            res.json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Cambiar el rol de un usuario (solo super admin o admin de agencia con restricciones)
    async changeUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!role) {
                throw new errors_1.BadRequestError('Se requiere especificar el rol');
            }
            const updatedUser = await user_service_1.default.changeUserRole(id, role, req.currentUser.userId);
            res.json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Activar usuario
    async activateUser(req, res, next) {
        try {
            const { id } = req.params;
            // Obtener usuario para verificar permisos
            const user = await user_service_1.default.getUserById(id);
            // Verificar permisos
            if (req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN &&
                user.agencyId !== req.currentUser.agencyId) {
                throw new errors_1.UnauthorizedError('No tienes permisos para activar este usuario');
            }
            const activatedUser = await user_service_1.default.activateUser(id);
            res.json(activatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Desactivar usuario
    async deactivateUser(req, res, next) {
        try {
            const { id } = req.params;
            // Obtener usuario para verificar permisos
            const user = await user_service_1.default.getUserById(id);
            // Verificar permisos
            if (req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN &&
                user.agencyId !== req.currentUser.agencyId) {
                throw new errors_1.UnauthorizedError('No tienes permisos para desactivar este usuario');
            }
            const deactivatedUser = await user_service_1.default.deactivateUser(id);
            res.json(deactivatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    // Solicitar restablecimiento de contraseña
    async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new errors_1.BadRequestError('Se requiere el email');
            }
            await user_service_1.default.requestPasswordReset(email);
            // Siempre devolver éxito por seguridad, aunque el email no exista
            res.json({
                message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Restablecer contraseña con token
    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                throw new errors_1.BadRequestError('Se requiere el token y la nueva contraseña');
            }
            await user_service_1.default.resetPassword(token, newPassword);
            res.json({ message: 'Contraseña restablecida correctamente' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.default = new UserController();
