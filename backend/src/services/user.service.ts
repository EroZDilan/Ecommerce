// src/services/user.service.ts
import { FindOneOptions } from 'typeorm';
import { UserModel, UserRole } from '../models/user.model';
import { AgencyModel } from '../models/agency.model';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../config/enviroment';
import { getRepository } from '../global';

export class UserService {
  async createSuperAdmin(userData: Partial<UserModel>): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    // Verificar si ya existe un super admin
    const superAdminCount = await userRepository.count({
      where: { role: UserRole.SUPER_ADMIN },
    });

    // Solo permitir crear un número limitado de super admins (3 según los requisitos)
    if (superAdminCount >= 3) {
      throw new BadRequestError(
        'Ya se ha alcanzado el límite máximo de administradores principales'
      );
    }

    // Crear usuario con rol de super admin
    return this.createUser({
      ...userData,
      role: UserRole.SUPER_ADMIN,
    });
  }

  async createAgencyAdmin(userData: Partial<UserModel>, agencyId: string): Promise<UserModel> {
    const agencyRepository = getRepository(AgencyModel);

    // Verificar que la agencia existe
    const agency = await agencyRepository.findOne({
      where: { id: agencyId },
    } as FindOneOptions<AgencyModel>);

    if (!agency) {
      throw new NotFoundError('La agencia especificada no existe');
    }

    // Crear usuario con rol de admin de agencia
    return this.createUser({
      ...userData,
      role: UserRole.AGENCY_ADMIN,
      agencyId,
    });
  }

  async createAgencyUser(userData: Partial<UserModel>, agencyId: string): Promise<UserModel> {
    const agencyRepository = getRepository(AgencyModel);

    // Verificar que la agencia existe
    const agency = await agencyRepository.findOne({
      where: { id: agencyId },
    } as FindOneOptions<AgencyModel>);

    if (!agency) {
      throw new NotFoundError('La agencia especificada no existe');
    }

    // Crear usuario con rol de usuario de agencia
    return this.createUser({
      ...userData,
      role: UserRole.AGENCY_USER,
      agencyId,
    });
  }

  async createCustomer(userData: Partial<UserModel>): Promise<UserModel> {
    // Crear usuario con rol de cliente
    return this.createUser({
      ...userData,
      role: UserRole.CUSTOMER,
    });
  }

  private async createUser(userData: Partial<UserModel>): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    // Verificar si el email ya existe
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    } as FindOneOptions<UserModel>);

    if (existingUser) {
      throw new BadRequestError('El email ya está registrado');
    }

    // Encriptar la contraseña
    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }

    // Crear el usuario
    const newUser = userRepository.create(userData);
    return userRepository.save(newUser) as Promise<UserModel>;
  }

  async authenticate(email: string, password: string): Promise<{ user: UserModel; token: string }> {
    const userRepository = getRepository(UserModel);

    // Buscar usuario incluyendo el campo password que normalmente está excluido
    const user = await userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    if (!user.activo) {
      throw new UnauthorizedError('La cuenta está desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await userRepository.save(user as UserModel);

    // Generar token JWT
    const token = this.generateToken(user as unknown as UserModel);

    // Crear un objeto de usuario sin la contraseña para devolver
    const userWithoutPassword = { ...user };
    // Eliminar la propiedad password pero manejarla como opcional
    if ('password' in userWithoutPassword) {
      delete (userWithoutPassword as any).password;
    }

    return { user: userWithoutPassword as UserModel, token };
  }

  private generateToken(user: UserModel): string {
    return sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return verify(token, config.jwtSecret);
    } catch (error) {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }

  async getUserById(id: string): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    const user = await userRepository.findOne({
      where: { id },
      relations: ['agency'],
    } as FindOneOptions<UserModel>);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return user as UserModel;
  }

  async updateUser(id: string, userData: Partial<UserModel>): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    const user = await this.getUserById(id);

    // Si se intenta actualizar el email, verificar que no exista ya
    if (userData.email && userData.email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      } as FindOneOptions<UserModel>);

      if (existingUser) {
        throw new BadRequestError('El email ya está registrado');
      }
    }

    // Si hay cambio de contraseña, encriptarla
    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }

    // No permitir cambiar el rol aquí
    if ('role' in userData) {
      delete (userData as any).role;
    }

    // Actualizar datos
    Object.assign(user, userData);
    return userRepository.save(user) as Promise<UserModel>;
  }

  async changeUserRole(id: string, role: UserRole, requestingUserId: string): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    const user = await this.getUserById(id);
    const requestingUser = await this.getUserById(requestingUserId);

    // Verificar permisos según la jerarquía de roles
    if (requestingUser.role === UserRole.SUPER_ADMIN) {
      // Super admin puede cambiar cualquier rol excepto a otro super admin
      if (role === UserRole.SUPER_ADMIN) {
        throw new UnauthorizedError('No se puede asignar el rol de Super Admin');
      }
    } else if (requestingUser.role === UserRole.AGENCY_ADMIN) {
      // Admin de agencia solo puede modificar usuarios de su agencia y no puede convertirlos en admin
      if (user.agencyId !== requestingUser.agencyId) {
        throw new UnauthorizedError('No tienes permisos para modificar usuarios de otra agencia');
      }

      if (role === UserRole.SUPER_ADMIN || role === UserRole.AGENCY_ADMIN) {
        throw new UnauthorizedError('No puedes asignar este rol');
      }
    } else {
      throw new UnauthorizedError('No tienes permisos para cambiar roles');
    }

    // Actualizar rol
    user.role = role;
    return userRepository.save(user);
  }

  async deactivateUser(id: string): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    const user = await this.getUserById(id);
    user.activo = false;
    return userRepository.save(user);
  }

  async activateUser(id: string): Promise<UserModel> {
    const userRepository = getRepository(UserModel);

    const user = await this.getUserById(id);
    user.activo = true;
    return userRepository.save(user);
  }

  async getAllUsers(filters?: any): Promise<UserModel[]> {
    const userRepository = getRepository(UserModel);

    const queryBuilder = userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.agency', 'agency');

    // Aplicar filtros
    if (filters) {
      if (filters.role) {
        queryBuilder.andWhere('user.role = :role', { role: filters.role });
      }

      if (filters.agencyId) {
        queryBuilder.andWhere('user.agencyId = :agencyId', {
          agencyId: filters.agencyId,
        });
      }

      if (filters.activo !== undefined) {
        queryBuilder.andWhere('user.activo = :activo', {
          activo: filters.activo,
        });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(user.nombre LIKE :search OR user.apellidos LIKE :search OR user.email LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    return queryBuilder.getMany() as Promise<UserModel[]>;
  }

  async getAgencyUsers(agencyId: string): Promise<UserModel[]> {
    const userRepository = getRepository(UserModel);

    return userRepository.find({
      where: { agencyId },
      relations: ['agency'],
    }) as Promise<UserModel[]>;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const userRepository = getRepository(UserModel);

    const user = await userRepository.findOne({
      where: { email },
    } as FindOneOptions<UserModel>);

    if (!user) {
      // No informar si el email existe o no por seguridad
      return;
    }

    // Generar token para reset
    const resetToken =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token válido por 1 hora

    // Guardar token y expiración
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await userRepository.save(user);

    // Aquí se enviaría un email con el token (implementar según necesidades)
    // sendResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userRepository = getRepository(UserModel);

    const now = new Date();

    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: await userRepository
          .createQueryBuilder()
          .where('resetPasswordExpires > :now', { now })
          .getOne(),
      },
    } as unknown as FindOneOptions<UserModel>);

    if (!user) {
      throw new BadRequestError('Token inválido o expirado');
    }

    // Cambiar contraseña
    user.password = await hash(newPassword, 10);
    user.resetPasswordToken = ''; // Usar string vacía en lugar de null
    user.resetPasswordExpires = new Date(0); // Usar fecha antigua en lugar de null
    await userRepository.save(user);
  }
}

export default new UserService();
