// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserModel, UserRole } from '../models/user.model';
import userService from '../services/user.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export class UserController {
  // Autenticación
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BadRequestError('Email y contraseña son requeridos');
      }

      const result = await userService.authenticate(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Registro de clientes
  async registerCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const newUser = await userService.createCustomer(userData);

      // No devolver la contraseña
      const userResponse = { ...newUser } as any;
      if (userResponse.password) {
        userResponse.password = undefined;
      }

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Crear super admin - Solo disponible en desarrollo o a través de seeding
  async createSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      // Verificar si la solicitud viene de una fuente confiable (por ejemplo, un token especial)
      // Esto debería implementarse según las necesidades específicas de seguridad

      const userData = req.body;
      const newUser = await userService.createSuperAdmin(userData);

      // No devolver la contraseña
      const userResponse = { ...newUser } as any;
      if (userResponse.password) {
        userResponse.password = undefined;
      }

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Crear admin de agencia (solo super admin)
  async createAgencyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { agencyId } = req.params;
      const userData = req.body;

      // Verificar que quien hace la solicitud es super admin (debería hacerse en middleware)
      if (req.currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new UnauthorizedError('Solo los super admins pueden crear admins de agencia');
      }

      const newUser = await userService.createAgencyAdmin(userData, agencyId);

      // No devolver la contraseña
      const userResponse = { ...newUser } as any;
      if (userResponse.password) {
        userResponse.password = undefined;
      }

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Crear usuario de agencia (solo admin de agencia o super admin)
  async createAgencyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { agencyId } = req.params;
      const userData = req.body;

      // Verificar permisos (debería hacerse en middleware)
      if (
        req.currentUser.role !== UserRole.SUPER_ADMIN &&
        (req.currentUser.role !== UserRole.AGENCY_ADMIN || req.currentUser.agencyId !== agencyId)
      ) {
        throw new UnauthorizedError('No tienes permisos para crear usuarios en esta agencia');
      }

      const newUser = await userService.createAgencyUser(userData, agencyId);

      // No devolver la contraseña
      const userResponse = { ...newUser } as any;
      if (userResponse.password) {
        userResponse.password = undefined;
      }

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.userId;
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Actualizar perfil del usuario autenticado
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.userId;
      const userData = req.body;

      // No permitir cambiar el rol o la agencia desde aquí
      delete userData.role;
      delete userData.agencyId;

      const updatedUser = await userService.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña del usuario autenticado
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Se requiere la contraseña actual y la nueva');
      }

      // Verificar contraseña actual primero
      await userService.authenticate(req.currentUser.email, currentPassword);

      // Actualizar contraseña
      await userService.updateUser(userId, { password: newPassword });

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  // Listar todos los usuarios (con filtros, solo para admins)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;

      // Si es admin de agencia, restringir a usuarios de su agencia
      if (req.currentUser.role === UserRole.AGENCY_ADMIN) {
        filters.agencyId = req.currentUser.agencyId;
      }

      const users = await userService.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      // Si es admin de agencia, solo puede ver usuarios de su agencia
      if (
        req.currentUser.role === UserRole.AGENCY_ADMIN &&
        user.agencyId !== req.currentUser.agencyId
      ) {
        throw new UnauthorizedError('No tienes permisos para ver este usuario');
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Actualizar usuario por ID (solo admins)
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Obtener usuario para verificar permisos
      const user = await userService.getUserById(id);

      // Verificar permisos
      if (req.currentUser.role === UserRole.AGENCY_ADMIN) {
        // Admin de agencia solo puede modificar usuarios de su agencia
        if (user.agencyId !== req.currentUser.agencyId) {
          throw new UnauthorizedError('No tienes permisos para modificar este usuario');
        }

        // No permitir cambiar el rol o la agencia
        delete userData.role;
        delete userData.agencyId;
      }

      const updatedUser = await userService.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Cambiar el rol de un usuario (solo super admin o admin de agencia con restricciones)
  async changeUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        throw new BadRequestError('Se requiere especificar el rol');
      }

      const updatedUser = await userService.changeUserRole(id, role, req.currentUser.userId);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Activar usuario
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Obtener usuario para verificar permisos
      const user = await userService.getUserById(id);

      // Verificar permisos
      if (
        req.currentUser.role === UserRole.AGENCY_ADMIN &&
        user.agencyId !== req.currentUser.agencyId
      ) {
        throw new UnauthorizedError('No tienes permisos para activar este usuario');
      }

      const activatedUser = await userService.activateUser(id);
      res.json(activatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Desactivar usuario
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Obtener usuario para verificar permisos
      const user = await userService.getUserById(id);

      // Verificar permisos
      if (
        req.currentUser.role === UserRole.AGENCY_ADMIN &&
        user.agencyId !== req.currentUser.agencyId
      ) {
        throw new UnauthorizedError('No tienes permisos para desactivar este usuario');
      }

      const deactivatedUser = await userService.deactivateUser(id);
      res.json(deactivatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new BadRequestError('Se requiere el email');
      }

      await userService.requestPasswordReset(email);

      // Siempre devolver éxito por seguridad, aunque el email no exista
      res.json({
        message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña',
      });
    } catch (error) {
      next(error);
    }
  }

  // Restablecer contraseña con token
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new BadRequestError('Se requiere el token y la nueva contraseña');
      }

      await userService.resetPassword(token, newPassword);
      res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
