// src/config/environment.ts
import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno según el entorno
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Configuración por defecto
const defaultConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  apiPrefix: process.env.API_PREFIX || "/api",

  // Database
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: parseInt(process.env.DB_PORT || "3306", 10),
  dbName: process.env.DB_NAME || "ecommerce_db",
  dbUser: process.env.DB_USER || "ecommerce_user",
  dbPassword: process.env.DB_PASSWORD || "password",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "tu_jwt_secreto_muy_seguro",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  // Cors
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Log
  logLevel: process.env.LOG_LEVEL || "info",

  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || "10", 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || "100", 10),
};

// Configuraciones específicas por entorno
const environmentConfig: { [key: string]: any } = {
  development: {
    ...defaultConfig,
  },
  test: {
    ...defaultConfig,
    port: 3001,
    dbName: `${defaultConfig.dbName}_test`,
    jwtExpiresIn: "1h",
  },
  production: {
    ...defaultConfig,
    logLevel: "error",
  },
};

// Exportar la configuración según el entorno actual
export const config = environmentConfig[defaultConfig.nodeEnv] || defaultConfig;

// Función para validar que todas las variables de entorno requeridas estén definidas
export const validateEnv = (): void => {
  const requiredEnvVars = [
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Faltan las siguientes variables de entorno: ${missingEnvVars.join(", ")}`
    );
  }
};
