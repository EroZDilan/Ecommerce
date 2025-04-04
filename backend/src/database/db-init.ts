// src/database/db-init.ts
import { DataSource } from 'typeorm';
import { config } from '../config/enviroment';
import path from 'path';
import fs from 'fs';

// Crear el DataSource para la conexión a la base de datos
export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: config.nodeEnv === 'development', // Solo en desarrollo
  logging: config.nodeEnv === 'development' ? ['error', 'query', 'schema'] : ['error'],
  entities: [path.join(__dirname, '../models/**/*.{ts,js}')],
  migrations: [path.join(__dirname, './migrations/**/*.{ts,js}')],
  subscribers: [path.join(__dirname, './subscribers/**/*.{ts,js}')],
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z', // UTC
  // Opciones adicionales para MariaDB
  extra: {
    connectionLimit: 10,
  },
});

// Función para inicializar la base de datos
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('📦 Base de datos conectada correctamente');

    // Ejecutar migraciones si hay
    if (config.nodeEnv === 'production' || process.env.RUN_MIGRATIONS === 'true') {
      console.log('🔄 Ejecutando migraciones...');
      await AppDataSource.runMigrations();
      console.log('✅ Migraciones ejecutadas correctamente');
    }
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    throw error;
  }
};

// Función para crear la base de datos si no existe
export const createDatabaseIfNotExists = async (): Promise<void> => {
  try {
    // Conectar a MariaDB sin especificar la base de datos
    const tempDataSource = new DataSource({
      type: 'mariadb',
      host: config.dbHost,
      port: config.dbPort,
      username: config.dbUser,
      password: config.dbPassword,
      logging: false,
    });

    await tempDataSource.initialize();

    // Verificar si la base de datos existe, si no, crearla
    await tempDataSource.query(`CREATE DATABASE IF NOT EXISTS ${config.dbName} 
                              CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    console.log(`✅ Base de datos '${config.dbName}' verificada/creada correctamente`);

    // Cerrar la conexión temporal
    await tempDataSource.destroy();
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error);
    throw error;
  }
};

// Crear directorios de migraciones si no existen
export const ensureMigrationDirectories = (): void => {
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('✅ Directorio de migraciones creado');
  }
};

// Función principal para preparar la base de datos
export const prepareDatabase = async (): Promise<void> => {
  try {
    // Asegurar que los directorios necesarios existen
    ensureMigrationDirectories();

    // Crear la base de datos si no existe
    await createDatabaseIfNotExists();

    // Inicializar la conexión
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Error al preparar la base de datos:', error);
    process.exit(1);
  }
};
