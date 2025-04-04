"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceController = void 0;
const price_service_1 = __importDefault(require("../services/price.service"));
const errors_1 = require("../utils/errors");
class PriceController {
    // Crear un nuevo precio para un producto
    async createPrice(req, res, next) {
        try {
            const priceData = req.body;
            if (!priceData.productId) {
                throw new errors_1.BadRequestError("El ID del producto es requerido");
            }
            const newPrice = await price_service_1.default.createPrice(priceData, req.currentUser);
            res.status(201).json(newPrice);
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar un precio existente
    async updatePrice(req, res, next) {
        try {
            const { id } = req.params;
            const priceData = req.body;
            const updatedPrice = await price_service_1.default.updatePrice(id, priceData, req.currentUser);
            res.json(updatedPrice);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener un precio por su ID
    async getPriceById(req, res, next) {
        try {
            const { id } = req.params;
            const price = await price_service_1.default.getPriceById(id);
            res.json(price);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener todos los precios de un producto
    async getProductPrices(req, res, next) {
        try {
            const { productId } = req.params;
            const prices = await price_service_1.default.getProductPrices(productId, req.currentUser);
            res.json(prices);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener precios específicos para una agencia
    async getAgencyPrices(req, res, next) {
        try {
            const { agencyId } = req.params;
            const prices = await price_service_1.default.getAgencyPrices(agencyId, req.currentUser);
            res.json(prices);
        }
        catch (error) {
            next(error);
        }
    }
    // Establecer precio visible para clientes
    async setCustomerVisiblePrice(req, res, next) {
        try {
            const { id } = req.params;
            const { visible } = req.body;
            if (visible === undefined) {
                throw new errors_1.BadRequestError("Es necesario especificar la visibilidad");
            }
            const price = await price_service_1.default.setCustomerVisiblePrice(id, visible, req.currentUser);
            res.json(price);
        }
        catch (error) {
            next(error);
        }
    }
    // Establecer precio visible para agencias
    async setAgencyVisiblePrice(req, res, next) {
        try {
            const { id } = req.params;
            const { visible } = req.body;
            if (visible === undefined) {
                throw new errors_1.BadRequestError("Es necesario especificar la visibilidad");
            }
            const price = await price_service_1.default.setAgencyVisiblePrice(id, visible, req.currentUser);
            res.json(price);
        }
        catch (error) {
            next(error);
        }
    }
    // Establecer tasa de cambio para una moneda
    async setCurrencyRate(req, res, next) {
        try {
            const rateData = req.body;
            if (!rateData.currency || !rateData.rateToUSD) {
                throw new errors_1.BadRequestError("La moneda y la tasa son requeridas");
            }
            const rate = await price_service_1.default.setCurrencyRate(rateData, req.currentUser);
            res.json(rate);
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener todas las tasas de cambio
    async getCurrencyRates(req, res, next) {
        try {
            const rates = await price_service_1.default.getCurrencyRates();
            res.json(rates);
        }
        catch (error) {
            next(error);
        }
    }
    // Convertir precio entre monedas
    async convertPrice(req, res, next) {
        try {
            const { amount, fromCurrency, toCurrency } = req.body;
            if (!amount || !fromCurrency || !toCurrency) {
                throw new errors_1.BadRequestError("Todos los parámetros son requeridos: amount, fromCurrency, toCurrency");
            }
            const convertedPrice = await price_service_1.default.convertPrice(parseFloat(amount), fromCurrency, toCurrency);
            res.json({
                originalAmount: parseFloat(amount),
                originalCurrency: fromCurrency,
                convertedAmount: convertedPrice,
                targetCurrency: toCurrency,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PriceController = PriceController;
exports.default = new PriceController();
