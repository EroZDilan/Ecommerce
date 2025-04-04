"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepository = exports.initializeDatabase = exports.AppDataSource = void 0;
// src/config/database.ts
const typeorm_1 = require("typeorm");
const enviroment_1 = require("./enviroment");
const path_1 = require("path");
// Configuración para la conexión a la base de datos
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mariadb",
    host: enviroment_1.config.dbHost,
    port: enviroment_1.config.dbPort,
    username: enviroment_1.config.dbUser,
    password: enviroment_1.config.dbPassword,
    database: enviroment_1.config.dbName,
    synchronize: enviroment_1.config.nodeEnv === "development", // Solo en desarrollo
    logging: enviroment_1.config.nodeEnv === "development" ? ["error", "query", "schema"] : ["error"],
    entities: [(0, path_1.join)(__dirname, "../models/**/*.{ts,js}")],
    migrations: [(0, path_1.join)(__dirname, "../database/migrations/**/*.{ts,js}")],
    subscribers: [(0, path_1.join)(__dirname, "../database/subscribers/**/*.{ts,js}")],
    charset: "utf8mb4_unicode_ci",
    timezone: "Z", // UTC
    // Opciones adicionales para MariaDB
    extra: {
        connectionLimit: 10,
    },
});
// Inicializar la conexión a la base de datos
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("📦 Base de datos conectada correctamente");
    }
    catch (error) {
        console.error("❌ Error al conectar a la base de datos:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
// Exportar repositorios para uso en la aplicación
const getRepository = (entity) => {
    return exports.AppDataSource.getRepository(entity);
};
exports.getRepository = getRepository;
