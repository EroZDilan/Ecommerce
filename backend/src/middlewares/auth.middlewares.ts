// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import userService from "../services/user.service";
import { UserRole } from "../models/user.model";

// Extender la interfaz Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      currentUser?: any;
    }
  }
}

// Middleware básico de autenticación
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "No se proporcionó un token de autenticación"
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await userService.verifyToken(token);

    req.currentUser = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError("Autenticación fallida"));
  }
};

// Middleware para verificar si el usuario es Super Admin
export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser || req.currentUser.role !== UserRole.SUPER_ADMIN) {
    return next(
      new UnauthorizedError("Acceso denegado: se requiere ser Super Admin")
    );
  }
  next();
};

// Middleware para verificar si el usuario es Admin de Agencia
export const isAgencyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser || req.currentUser.role !== UserRole.AGENCY_ADMIN) {
    return next(
      new UnauthorizedError("Acceso denegado: se requiere ser Admin de Agencia")
    );
  }
  next();
};

// Middleware para verificar si el usuario es Super Admin o Admin de Agencia
export const isAdminOrAgencyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.currentUser ||
    (req.currentUser.role !== UserRole.SUPER_ADMIN &&
      req.currentUser.role !== UserRole.AGENCY_ADMIN)
  ) {
    return next(
      new UnauthorizedError(
        "Acceso denegado: se requiere privilegios de administrador"
      )
    );
  }
  next();
};

// Middleware para verificar si el usuario pertenece a la agencia especificada
export const belongsToAgency = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const agencyId = req.params.agencyId || req.body.agencyId;

  if (!req.currentUser) {
    return next(new UnauthorizedError("Usuario no autenticado"));
  }

  // Super admin puede acceder a cualquier agencia
  if (req.currentUser.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Verificar si el usuario pertenece a la agencia
  if (req.currentUser.agencyId !== agencyId) {
    return next(
      new UnauthorizedError("No tienes permisos para acceder a esta agencia")
    );
  }

  next();
};

// Middleware para verificar si el usuario puede gestionar precios
export const canManagePrices = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return next(new UnauthorizedError("Usuario no autenticado"));
  }

  // Super admin y agency admin pueden gestionar precios
  if (
    req.currentUser.role === UserRole.SUPER_ADMIN ||
    req.currentUser.role === UserRole.AGENCY_ADMIN
  ) {
    return next();
  }

  return next(
    new UnauthorizedError("No tienes permisos para gestionar precios")
  );
};

// Middleware para verificar si el usuario puede ver precios de agencia
export const canViewAgencyPrices = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return next(new UnauthorizedError("Usuario no autenticado"));
  }

  // Super admin puede ver todos los precios
  if (req.currentUser.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Agency admin y agency user pueden ver precios de su agencia
  if (
    (req.currentUser.role === UserRole.AGENCY_ADMIN ||
      req.currentUser.role === UserRole.AGENCY_USER) &&
    req.currentUser.agencyId
  ) {
    return next();
  }

  return next(
    new UnauthorizedError("No tienes permisos para ver precios de agencia")
  );
};
