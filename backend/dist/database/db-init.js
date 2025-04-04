"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareDatabase = exports.ensureMigrationDirectories = exports.createDatabaseIfNotExists = exports.initializeDatabase = exports.AppDataSource = void 0;
// src/database/db-init.ts
const typeorm_1 = require("typeorm");
const enviroment_1 = require("../config/enviroment");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Crear el DataSource para la conexión a la base de datos
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mariadb',
    host: enviroment_1.config.dbHost,
    port: enviroment_1.config.dbPort,
    username: enviroment_1.config.dbUser,
    password: enviroment_1.config.dbPassword,
    database: enviroment_1.config.dbName,
    synchronize: enviroment_1.config.nodeEnv === 'development', // Solo en desarrollo
    logging: enviroment_1.config.nodeEnv === 'development' ? ['error', 'query', 'schema'] : ['error'],
    entities: [path_1.default.join(__dirname, '../models/**/*.{ts,js}')],
    migrations: [path_1.default.join(__dirname, './migrations/**/*.{ts,js}')],
    subscribers: [path_1.default.join(__dirname, './subscribers/**/*.{ts,js}')],
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z', // UTC
    // Opciones adicionales para MariaDB
    extra: {
        connectionLimit: 10,
    },
});
// Función para inicializar la base de datos
const initializeDatabase = async () => {
    try {
        // Inicializar la conexión a la base de datos
        await exports.AppDataSource.initialize();
        console.log('📦 Base de datos conectada correctamente');
        // Ejecutar migraciones si hay
        if (enviroment_1.config.nodeEnv === 'production' || process.env.RUN_MIGRATIONS === 'true') {
            console.log('🔄 Ejecutando migraciones...');
            await exports.AppDataSource.runMigrations();
            console.log('✅ Migraciones ejecutadas correctamente');
        }
    }
    catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
// Función para crear la base de datos si no existe
const createDatabaseIfNotExists = async () => {
    try {
        // Conectar a MariaDB sin especificar la base de datos
        const tempDataSource = new typeorm_1.DataSource({
            type: 'mariadb',
            host: enviroment_1.config.dbHost,
            port: enviroment_1.config.dbPort,
            username: enviroment_1.config.dbUser,
            password: enviroment_1.config.dbPassword,
            logging: false,
        });
        await tempDataSource.initialize();
        // Verificar si la base de datos existe, si no, crearla
        await tempDataSource.query(`CREATE DATABASE IF NOT EXISTS ${enviroment_1.config.dbName} 
                              CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Base de datos '${enviroment_1.config.dbName}' verificada/creada correctamente`);
        // Cerrar la conexión temporal
        await tempDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error al crear la base de datos:', error);
        throw error;
    }
};
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
// Crear directorios de migraciones si no existen
const ensureMigrationDirectories = () => {
    const migrationsDir = path_1.default.join(__dirname, 'migrations');
    if (!fs_1.default.existsSync(migrationsDir)) {
        fs_1.default.mkdirSync(migrationsDir, { recursive: true });
        console.log('✅ Directorio de migraciones creado');
    }
};
exports.ensureMigrationDirectories = ensureMigrationDirectories;
// Función principal para preparar la base de datos
const prepareDatabase = async () => {
    try {
        // Asegurar que los directorios necesarios existen
        (0, exports.ensureMigrationDirectories)();
        // Crear la base de datos si no existe
        await (0, exports.createDatabaseIfNotExists)();
        // Inicializar la conexión
        await (0, exports.initializeDatabase)();
    }
    catch (error) {
        console.error('❌ Error al preparar la base de datos:', error);
        process.exit(1);
    }
};
exports.prepareDatabase = prepareDatabase;
