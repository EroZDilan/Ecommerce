// src/utils/errors.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capturar la pila de llamadas para el seguimiento de errores
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud incorrecta") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto en la solicitud") {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Error interno del servidor") {
    super(message, 500, false);
  }
}

// Handler global de errores
export const errorHandler = (err: any, req: any, res: any, next: any) => {
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
