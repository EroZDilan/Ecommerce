// src/database/seeds/index.ts
import { AppDataSource } from '../db-init';
import { hash } from 'bcrypt';
import { UserModel, UserRole, AgencyModel, AgencyType } from '../../models';

// Función principal para poblar la base de datos
export const seedDatabase = async (): Promise<void> => {
  try {
    // Inicializar la base de datos
    await AppDataSource.initialize();
    console.log('📦 Base de datos conectada para seeds');

    // Crear administradores iniciales
    await createInitialAdmins();

    // Crear agencias iniciales
    await createInitialAgencies();

    console.log('✅ Base de datos poblada correctamente');

    // Cerrar la conexión
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);

    // Cerrar la conexión en caso de error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(1);
  }
};

// Crear administradores iniciales
const createInitialAdmins = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(UserModel);

  // Verificar si ya hay administradores
  const adminCount = await userRepository.count({
    where: { role: UserRole.SUPER_ADMIN },
  });

  if (adminCount > 0) {
    console.log('ℹ️ Ya existen administradores, omitiendo creación');
    return;
  }

  // Crear administrador por defecto
  const hashedPassword = await hash('Admin123!', 10);

  const admin = userRepository.create({
    nombre: 'Admin',
    apellidos: 'Principal',
    email: 'admin@ejemplo.com',
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
    activo: true,
    emailVerified: true,
  });

  await userRepository.save(admin);
  console.log('✅ Administrador por defecto creado');
};

// Crear agencias iniciales
const createInitialAgencies = async (): Promise<void> => {
  const agencyRepository = AppDataSource.getRepository(AgencyModel);

  // Verificar si ya hay agencias
  const agencyCount = await agencyRepository.count();

  if (agencyCount > 0) {
    console.log('ℹ️ Ya existen agencias, omitiendo creación');
    return;
  }

  // Crear agencia de prueba
  const testAgency = agencyRepository.create({
    nombre: 'Agencia de Prueba',
    descripcion: 'Esta es una agencia de prueba para desarrollo',
    tipoAgencia: AgencyType.RETAILER,
    email: 'contacto@agencia.ejemplo.com',
    phone: '+1234567890',
    url: 'https://www.agencia-ejemplo.com',
    activa: true,
  });

  await agencyRepository.save(testAgency);

  // Crear administrador para la agencia
  const userRepository = AppDataSource.getRepository(UserModel);
  const hashedPassword = await hash('Agencia123!', 10);

  const agencyAdmin = userRepository.create({
    nombre: 'Admin',
    apellidos: 'Agencia',
    email: 'admin-agencia@ejemplo.com',
    password: hashedPassword,
    role: UserRole.AGENCY_ADMIN,
    agencyId: testAgency.id,
    activo: true,
    emailVerified: true,
  });

  await userRepository.save(agencyAdmin);
  console.log('✅ Agencia de prueba y su administrador creados');
};

// Ejecutar si este archivo se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🌱 Proceso de seeds completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el proceso de seeds:', error);
      process.exit(1);
    });
}
