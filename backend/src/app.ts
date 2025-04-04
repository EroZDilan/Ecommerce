// src/app.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateEnv } from './config/enviroment';
import { initializeDataSource } from './global';
import { errorHandler } from './utils/errors';
import { createDatabaseIfNotExists } from './database/db-init';

// Importar rutas
import userRoutes from './routes/user.routes';
import priceRoutes from './routes/price.routes';

// Validar variables de entorno
validateEnv();

// Inicializar app Express
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Prefijo para todas las rutas API
const apiPrefix = config.apiPrefix;

// Rutas
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/prices`, priceRoutes);

// Ruta de prueba
app.get(`${apiPrefix}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
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
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Primero crear la base de datos si no existe
    await createDatabaseIfNotExists();

    // Luego inicializar conexión a la base de datos
    await initializeDataSource();

    // Iniciar servidor
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT} (${config.nodeEnv})`);
      console.log(`🔗 API disponible en http://localhost:${PORT}${apiPrefix}`);
    });
  } catch (error) {
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

export default app;
