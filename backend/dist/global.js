"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.initializeDataSource = initializeDataSource;
exports.getRepository = getRepository;
// src/globals.ts
const typeorm_1 = require("typeorm");
const enviroment_1 = require("./config/enviroment");
const path_1 = __importDefault(require("path"));
async function initializeDataSource() {
    exports.AppDataSource = new typeorm_1.DataSource({
        type: 'mariadb',
        host: enviroment_1.config.dbHost,
        port: enviroment_1.config.dbPort,
        username: enviroment_1.config.dbUser,
        password: enviroment_1.config.dbPassword,
        database: enviroment_1.config.dbName,
        synchronize: enviroment_1.config.nodeEnv === 'development',
        logging: enviroment_1.config.nodeEnv === 'development' ? ['error', 'query', 'schema'] : ['error'],
        entities: [path_1.default.join(__dirname, './models/**/*.{ts,js}')],
        migrations: [path_1.default.join(__dirname, './database/migrations/**/*.{ts,js}')],
        subscribers: [path_1.default.join(__dirname, './database/subscribers/**/*.{ts,js}')],
        charset: 'utf8mb4_unicode_ci',
    });
    if (!exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.initialize();
        console.log('📦 Base de datos conectada correctamente');
    }
    return exports.AppDataSource;
}
function getRepository(entity) {
    if (!exports.AppDataSource || !exports.AppDataSource.isInitialized) {
        throw new Error('La base de datos no está inicializada. Llama a initializeDataSource primero.');
    }
    return exports.AppDataSource.getRepository(entity);
}
