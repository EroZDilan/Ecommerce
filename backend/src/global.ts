// src/global.ts
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { config } from './config/enviroment';
import path from 'path';

// Variable global para almacenar la conexión a la base de datos
export let AppDataSource: DataSource;

/**
 * Inicializa la conexión a la base de datos
 * @returns La instancia de DataSource inicializada
 */
export async function initializeDataSource() {
  // Si ya hay una conexión inicializada, la devolvemos
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  // Configurar la conexión
  AppDataSource = new DataSource({
    type: 'mariadb',
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    synchronize: config.nodeEnv === 'development',
    logging: config.nodeEnv === 'development' ? ['error', 'query', 'schema'] : ['error'],
    entities: [path.join(__dirname, './models/**/*.{ts,js}')],
    migrations: [path.join(__dirname, './database/migrations/**/*.{ts,js}')],
    subscribers: [path.join(__dirname, './database/subscribers/**/*.{ts,js}')],
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z', // UTC
    // Opciones adicionales para MariaDB
    extra: {
      connectionLimit: 10,
    },
  });

  // Inicializar la conexión
  await AppDataSource.initialize();
  console.log('📦 Base de datos conectada correctamente');

  return AppDataSource;
}

/**
 * Obtiene un repositorio para la entidad especificada
 * @param entity Entidad para la que se quiere obtener el repositorio
 * @returns Repositorio tipado para la entidad
 */
export function getRepository<Entity extends ObjectLiteral>(entity: any): Repository<Entity> {
  if (!AppDataSource || !AppDataSource.isInitialized) {
    throw new Error('La base de datos no está inicializada. Llama a initializeDataSource primero.');
  }
  return AppDataSource.getRepository(entity);
}
