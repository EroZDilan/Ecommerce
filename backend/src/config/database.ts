// src/config/database.ts
import { DataSource } from "typeorm";
import { config } from "./enviroment";
import { join } from "path";

// Configuración para la conexión a la base de datos
export const AppDataSource = new DataSource({
  type: "mariadb",
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: config.nodeEnv === "development", // Solo en desarrollo
  logging:
    config.nodeEnv === "development" ? ["error", "query", "schema"] : ["error"],
  entities: [join(__dirname, "../models/**/*.{ts,js}")],
  migrations: [join(__dirname, "../database/migrations/**/*.{ts,js}")],
  subscribers: [join(__dirname, "../database/subscribers/**/*.{ts,js}")],
  charset: "utf8mb4_unicode_ci",
  timezone: "Z", // UTC
  // Opciones adicionales para MariaDB
  extra: {
    connectionLimit: 10,
  },
});

// Inicializar la conexión a la base de datos
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Base de datos conectada correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    throw error;
  }
};

// Exportar repositorios para uso en la aplicación
export const getRepository = (entity: any) => {
  return AppDataSource.getRepository(entity);
};
