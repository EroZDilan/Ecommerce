"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const agency_model_1 = require("../models/agency.model");
const errors_1 = require("../utils/errors");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const enviroment_1 = require("../config/enviroment");
const global_1 = require("../global");
class UserService {
    async createSuperAdmin(userData) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        // Verificar si ya existe un super admin
        const superAdminCount = await userRepository.count({
            where: { role: user_model_1.UserRole.SUPER_ADMIN },
        });
        // Solo permitir crear un número limitado de super admins (3 según los requisitos)
        if (superAdminCount >= 3) {
            throw new errors_1.BadRequestError('Ya se ha alcanzado el límite máximo de administradores principales');
        }
        // Crear usuario con rol de super admin
        return this.createUser({
            ...userData,
            role: user_model_1.UserRole.SUPER_ADMIN,
        });
    }
    async createAgencyAdmin(userData, agencyId) {
        const agencyRepository = (0, global_1.getRepository)(agency_model_1.AgencyModel);
        // Verificar que la agencia existe
        const agency = await agencyRepository.findOne({
            where: { id: agencyId },
        });
        if (!agency) {
            throw new errors_1.NotFoundError('La agencia especificada no existe');
        }
        // Crear usuario con rol de admin de agencia
        return this.createUser({
            ...userData,
            role: user_model_1.UserRole.AGENCY_ADMIN,
            agencyId,
        });
    }
    async createAgencyUser(userData, agencyId) {
        const agencyRepository = (0, global_1.getRepository)(agency_model_1.AgencyModel);
        // Verificar que la agencia existe
        const agency = await agencyRepository.findOne({
            where: { id: agencyId },
        });
        if (!agency) {
            throw new errors_1.NotFoundError('La agencia especificada no existe');
        }
        // Crear usuario con rol de usuario de agencia
        return this.createUser({
            ...userData,
            role: user_model_1.UserRole.AGENCY_USER,
            agencyId,
        });
    }
    async createCustomer(userData) {
        // Crear usuario con rol de cliente
        return this.createUser({
            ...userData,
            role: user_model_1.UserRole.CUSTOMER,
        });
    }
    async createUser(userData) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        // Verificar si el email ya existe
        const existingUser = await userRepository.findOne({
            where: { email: userData.email },
        });
        if (existingUser) {
            throw new errors_1.BadRequestError('El email ya está registrado');
        }
        // Encriptar la contraseña
        if (userData.password) {
            userData.password = await (0, bcrypt_1.hash)(userData.password, 10);
        }
        // Crear el usuario
        const newUser = userRepository.create(userData);
        return userRepository.save(newUser);
    }
    async authenticate(email, password) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        // Buscar usuario incluyendo el campo password que normalmente está excluido
        const user = await userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
        if (!user) {
            throw new errors_1.UnauthorizedError('Credenciales incorrectas');
        }
        if (!user.activo) {
            throw new errors_1.UnauthorizedError('La cuenta está desactivada');
        }
        // Verificar contraseña
        const isPasswordValid = await (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Credenciales incorrectas');
        }
        // Actualizar último login
        user.lastLogin = new Date();
        await userRepository.save(user);
        // Generar token JWT
        const token = this.generateToken(user);
        // Crear un objeto de usuario sin la contraseña para devolver
        const userWithoutPassword = { ...user };
        // Eliminar la propiedad password pero manejarla como opcional
        if ('password' in userWithoutPassword) {
            delete userWithoutPassword.password;
        }
        return { user: userWithoutPassword, token };
    }
    generateToken(user) {
        return (0, jsonwebtoken_1.sign)({
            userId: user.id,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId,
        }, enviroment_1.config.jwtSecret, { expiresIn: enviroment_1.config.jwtExpiresIn });
    }
    async verifyToken(token) {
        try {
            return (0, jsonwebtoken_1.verify)(token, enviroment_1.config.jwtSecret);
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Token inválido o expirado');
        }
    }
    async getUserById(id) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await userRepository.findOne({
            where: { id },
            relations: ['agency'],
        });
        if (!user) {
            throw new errors_1.NotFoundError('Usuario no encontrado');
        }
        return user;
    }
    async updateUser(id, userData) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await this.getUserById(id);
        // Si se intenta actualizar el email, verificar que no exista ya
        if (userData.email && userData.email !== user.email) {
            const existingUser = await userRepository.findOne({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new errors_1.BadRequestError('El email ya está registrado');
            }
        }
        // Si hay cambio de contraseña, encriptarla
        if (userData.password) {
            userData.password = await (0, bcrypt_1.hash)(userData.password, 10);
        }
        // No permitir cambiar el rol aquí
        if ('role' in userData) {
            delete userData.role;
        }
        // Actualizar datos
        Object.assign(user, userData);
        return userRepository.save(user);
    }
    async changeUserRole(id, role, requestingUserId) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await this.getUserById(id);
        const requestingUser = await this.getUserById(requestingUserId);
        // Verificar permisos según la jerarquía de roles
        if (requestingUser.role === user_model_1.UserRole.SUPER_ADMIN) {
            // Super admin puede cambiar cualquier rol excepto a otro super admin
            if (role === user_model_1.UserRole.SUPER_ADMIN) {
                throw new errors_1.UnauthorizedError('No se puede asignar el rol de Super Admin');
            }
        }
        else if (requestingUser.role === user_model_1.UserRole.AGENCY_ADMIN) {
            // Admin de agencia solo puede modificar usuarios de su agencia y no puede convertirlos en admin
            if (user.agencyId !== requestingUser.agencyId) {
                throw new errors_1.UnauthorizedError('No tienes permisos para modificar usuarios de otra agencia');
            }
            if (role === user_model_1.UserRole.SUPER_ADMIN || role === user_model_1.UserRole.AGENCY_ADMIN) {
                throw new errors_1.UnauthorizedError('No puedes asignar este rol');
            }
        }
        else {
            throw new errors_1.UnauthorizedError('No tienes permisos para cambiar roles');
        }
        // Actualizar rol
        user.role = role;
        return userRepository.save(user);
    }
    async deactivateUser(id) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await this.getUserById(id);
        user.activo = false;
        return userRepository.save(user);
    }
    async activateUser(id) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await this.getUserById(id);
        user.activo = true;
        return userRepository.save(user);
    }
    async getAllUsers(filters) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
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
                queryBuilder.andWhere('(user.nombre LIKE :search OR user.apellidos LIKE :search OR user.email LIKE :search)', { search: `%${filters.search}%` });
            }
        }
        return queryBuilder.getMany();
    }
    async getAgencyUsers(agencyId) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        return userRepository.find({
            where: { agencyId },
            relations: ['agency'],
        });
    }
    async requestPasswordReset(email) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            // No informar si el email existe o no por seguridad
            return;
        }
        // Generar token para reset
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1); // Token válido por 1 hora
        // Guardar token y expiración
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await userRepository.save(user);
        // Aquí se enviaría un email con el token (implementar según necesidades)
        // sendResetEmail(user.email, resetToken);
    }
    async resetPassword(token, newPassword) {
        const userRepository = (0, global_1.getRepository)(user_model_1.UserModel);
        const now = new Date();
        const user = await userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: await userRepository
                    .createQueryBuilder()
                    .where('resetPasswordExpires > :now', { now })
                    .getOne(),
            },
        });
        if (!user) {
            throw new errors_1.BadRequestError('Token inválido o expirado');
        }
        // Cambiar contraseña
        user.password = await (0, bcrypt_1.hash)(newPassword, 10);
        user.resetPasswordToken = ''; // Usar string vacía en lugar de null
        user.resetPasswordExpires = new Date(0); // Usar fecha antigua en lugar de null
        await userRepository.save(user);
    }
}
exports.UserService = UserService;
exports.default = new UserService();
