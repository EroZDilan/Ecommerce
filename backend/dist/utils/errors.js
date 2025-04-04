"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
// src/utils/errors.ts
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Capturar la pila de llamadas para el seguimiento de errores
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = "Solicitud incorrecta") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = "No autorizado") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "Recurso no encontrado") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Conflicto en la solicitud") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends AppError {
    constructor(message = "Error interno del servidor") {
        super(message, 500, false);
    }
}
exports.InternalServerError = InternalServerError;
// Handler global de errores
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Error interno del servidor";
    // Enviar respuesta de error en producción
    if (process.env.NODE_ENV === "production") {
        // Solo devolver información operacional en producción
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: "error",
                message: err.message,
            });
        }
        // Para errores no operacionales (bugs, errores de programación)
        console.error("ERROR 💥", err);
        return res.status(500).json({
            status: "error",
            message: "Algo salió mal",
        });
    }
    // En desarrollo, enviar detalles completos del error
    return res.status(err.statusCode).json({
        status: "error",
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
exports.errorHandler = errorHandler;
