"use strict";
// src/models/index.ts
// Este archivo exporta todos los modelos para facilitar la importación
// y evitar problemas de referencias circulares
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyType = exports.PriceType = exports.PriceAudienceType = exports.CurrencyRateModel = exports.ProductPriceModel = exports.InventoryType = exports.ProductType = exports.ProductModel = exports.DepartmentModel = exports.UserRole = exports.UserModel = exports.AgencyType = exports.AgencyModel = exports.BaseEntity = void 0;
var base_model_1 = require("./base.model");
Object.defineProperty(exports, "BaseEntity", { enumerable: true, get: function () { return base_model_1.BaseEntity; } });
var agency_model_1 = require("./agency.model");
Object.defineProperty(exports, "AgencyModel", { enumerable: true, get: function () { return agency_model_1.AgencyModel; } });
Object.defineProperty(exports, "AgencyType", { enumerable: true, get: function () { return agency_model_1.AgencyType; } });
var user_model_1 = require("./user.model");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return user_model_1.UserModel; } });
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return user_model_1.UserRole; } });
var department_model_1 = require("./department.model");
Object.defineProperty(exports, "DepartmentModel", { enumerable: true, get: function () { return department_model_1.DepartmentModel; } });
var product_model_1 = require("./product.model");
Object.defineProperty(exports, "ProductModel", { enumerable: true, get: function () { return product_model_1.ProductModel; } });
Object.defineProperty(exports, "ProductType", { enumerable: true, get: function () { return product_model_1.ProductType; } });
Object.defineProperty(exports, "InventoryType", { enumerable: true, get: function () { return product_model_1.InventoryType; } });
var price_model_1 = require("./price.model");
Object.defineProperty(exports, "ProductPriceModel", { enumerable: true, get: function () { return price_model_1.ProductPriceModel; } });
Object.defineProperty(exports, "CurrencyRateModel", { enumerable: true, get: function () { return price_model_1.CurrencyRateModel; } });
Object.defineProperty(exports, "PriceAudienceType", { enumerable: true, get: function () { return price_model_1.PriceAudienceType; } });
Object.defineProperty(exports, "PriceType", { enumerable: true, get: function () { return price_model_1.PriceType; } });
Object.defineProperty(exports, "CurrencyType", { enumerable: true, get: function () { return price_model_1.CurrencyType; } });
