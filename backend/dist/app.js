"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const enviroment_1 = require("./config/enviroment");
const global_1 = require("./global");
const errors_1 = require("./utils/errors");
// Importar rutas
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const price_routes_1 = __importDefault(require("./routes/price.routes"));
// Validar variables de entorno
(0, enviroment_1.validateEnv)();
// Inicializar app Express
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: enviroment_1.config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(enviroment_1.config.nodeEnv === 'production' ? 'combined' : 'dev'));
// Prefijo para todas las rutas API
const apiPrefix = enviroment_1.config.apiPrefix;
// Rutas
app.use(`${apiPrefix}/users`, user_routes_1.default);
app.use(`${apiPrefix}/prices`, price_routes_1.default);
// Ruta de prueba
app.get(`${apiPrefix}/health`, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: enviroment_1.config.nodeEnv,
    });
});
// Capturar todas las rutas no encontradas
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `No se pudo encontrar ${req.originalUrl} en este servidor`,
    });
});
// Middleware de manejo de errores
app.use(errors_1.errorHandler);
// Iniciar servidor
const startServer = async () => {
    try {
        // Inicializar conexión a la base de datos primero
        await (0, global_1.initializeDataSource)();
        // Iniciar servidor
        const PORT = enviroment_1.config.port;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT} (${enviroment_1.config.nodeEnv})`);
            console.log(`🔗 API disponible en http://localhost:${PORT}${apiPrefix}`);
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
// Iniciar el servidor
startServer();
// Manejar señales de finalización
const gracefulShutdown = () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
};
// Escuchar señales de finalización
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
exports.default = app;
