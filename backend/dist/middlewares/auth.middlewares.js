"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canViewAgencyPrices = exports.canManagePrices = exports.belongsToAgency = exports.isAdminOrAgencyAdmin = exports.isAgencyAdmin = exports.isSuperAdmin = exports.authenticate = void 0;
const errors_1 = require("../utils/errors");
const user_service_1 = __importDefault(require("../services/user.service"));
const user_model_1 = require("../models/user.model");
// Middleware básico de autenticación
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new errors_1.UnauthorizedError("No se proporcionó un token de autenticación");
        }
        const token = authHeader.split(" ")[1];
        const decoded = await user_service_1.default.verifyToken(token);
        req.currentUser = decoded;
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError("Autenticación fallida"));
    }
};
exports.authenticate = authenticate;
// Middleware para verificar si el usuario es Super Admin
const isSuperAdmin = (req, res, next) => {
    if (!req.currentUser || req.currentUser.role !== user_model_1.UserRole.SUPER_ADMIN) {
        return next(new errors_1.UnauthorizedError("Acceso denegado: se requiere ser Super Admin"));
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
// Middleware para verificar si el usuario es Admin de Agencia
const isAgencyAdmin = (req, res, next) => {
    if (!req.currentUser || req.currentUser.role !== user_model_1.UserRole.AGENCY_ADMIN) {
        return next(new errors_1.UnauthorizedError("Acceso denegado: se requiere ser Admin de Agencia"));
    }
    next();
};
exports.isAgencyAdmin = isAgencyAdmin;
// Middleware para verificar si el usuario es Super Admin o Admin de Agencia
const isAdminOrAgencyAdmin = (req, res, next) => {
    if (!req.currentUser ||
        (req.currentUser.role !== user_model_1.UserRole.SUPER_ADMIN &&
            req.currentUser.role !== user_model_1.UserRole.AGENCY_ADMIN)) {
        return next(new errors_1.UnauthorizedError("Acceso denegado: se requiere privilegios de administrador"));
    }
    next();
};
exports.isAdminOrAgencyAdmin = isAdminOrAgencyAdmin;
// Middleware para verificar si el usuario pertenece a la agencia especificada
const belongsToAgency = (req, res, next) => {
    const agencyId = req.params.agencyId || req.body.agencyId;
    if (!req.currentUser) {
        return next(new errors_1.UnauthorizedError("Usuario no autenticado"));
    }
    // Super admin puede acceder a cualquier agencia
    if (req.currentUser.role === user_model_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    // Verificar si el usuario pertenece a la agencia
    if (req.currentUser.agencyId !== agencyId) {
        return next(new errors_1.UnauthorizedError("No tienes permisos para acceder a esta agencia"));
    }
    next();
};
exports.belongsToAgency = belongsToAgency;
// Middleware para verificar si el usuario puede gestionar precios
const canManagePrices = (req, res, next) => {
    if (!req.currentUser) {
        return next(new errors_1.UnauthorizedError("Usuario no autenticado"));
    }
    // Super admin y agency admin pueden gestionar precios
    if (req.currentUser.role === user_model_1.UserRole.SUPER_ADMIN ||
        req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN) {
        return next();
    }
    return next(new errors_1.UnauthorizedError("No tienes permisos para gestionar precios"));
};
exports.canManagePrices = canManagePrices;
// Middleware para verificar si el usuario puede ver precios de agencia
const canViewAgencyPrices = (req, res, next) => {
    if (!req.currentUser) {
        return next(new errors_1.UnauthorizedError("Usuario no autenticado"));
    }
    // Super admin puede ver todos los precios
    if (req.currentUser.role === user_model_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    // Agency admin y agency user pueden ver precios de su agencia
    if ((req.currentUser.role === user_model_1.UserRole.AGENCY_ADMIN ||
        req.currentUser.role === user_model_1.UserRole.AGENCY_USER) &&
        req.currentUser.agencyId) {
        return next();
    }
    return next(new errors_1.UnauthorizedError("No tienes permisos para ver precios de agencia"));
};
exports.canViewAgencyPrices = canViewAgencyPrices;
