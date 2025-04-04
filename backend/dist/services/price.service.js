"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const price_model_1 = require("../models/price.model");
const user_model_1 = require("../models/user.model");
const errors_1 = require("../utils/errors");
const global_1 = require("../global");
class PriceService {
    // Crear un nuevo precio para un producto
    async createPrice(priceData, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        // Validar permisos según el tipo de audiencia
        this.validatePricePermissions(priceData, currentUser);
        // Crear y guardar el precio
        const newPrice = priceRepository.create(priceData);
        return priceRepository.save(newPrice);
    }
    // Actualizar un precio existente
    async updatePrice(id, priceData, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        const price = await this.getPriceById(id);
        // Validar permisos según el tipo de audiencia
        this.validatePricePermissions({ ...price, ...priceData }, currentUser);
        // Actualizar y guardar
        Object.assign(price, priceData);
        return priceRepository.save(price);
    }
    // Obtener un precio por su ID
    async getPriceById(id) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        const price = await priceRepository.findOne({
            where: { id },
            relations: ['product', 'agency'],
        });
        if (!price) {
            throw new errors_1.NotFoundError('Precio no encontrado');
        }
        return price;
    }
    // Obtener todos los precios de un producto con filtros
    async getProductPrices(productId, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        const queryBuilder = priceRepository
            .createQueryBuilder('price')
            .leftJoinAndSelect('price.product', 'product')
            .leftJoinAndSelect('price.agency', 'agency')
            .where('price.productId = :productId', { productId })
            .andWhere('price.activo = :activo', { activo: true });
        // Aplicar filtros según el rol del usuario
        switch (currentUser.role) {
            case user_model_1.UserRole.SUPER_ADMIN:
                // Super admin puede ver todos los precios
                break;
            case user_model_1.UserRole.AGENCY_ADMIN:
            case user_model_1.UserRole.AGENCY_USER:
                // Usuarios de agencia ven precios públicos y los de su agencia
                queryBuilder.andWhere('(price.audienceType = :publicType OR (price.audienceType = :agencyType AND price.agencyId = :agencyId))', {
                    publicType: price_model_1.PriceAudienceType.PUBLIC,
                    agencyType: price_model_1.PriceAudienceType.AGENCY,
                    agencyId: currentUser.agencyId,
                });
                break;
            case user_model_1.UserRole.CUSTOMER:
            default:
                // Clientes solo ven precios públicos
                queryBuilder.andWhere('price.audienceType = :publicType', {
                    publicType: price_model_1.PriceAudienceType.PUBLIC,
                });
                queryBuilder.andWhere('price.visibleClientes = :visible', {
                    visible: true,
                });
                break;
        }
        return queryBuilder.getMany();
    }
    // Obtener precios específicos para una agencia
    async getAgencyPrices(agencyId, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        // Validar que el usuario tenga permisos para ver precios de esta agencia
        if (currentUser.role !== user_model_1.UserRole.SUPER_ADMIN &&
            (currentUser.role !== user_model_1.UserRole.AGENCY_ADMIN || currentUser.agencyId !== agencyId)) {
            throw new errors_1.UnauthorizedError('No tienes permisos para ver los precios de esta agencia');
        }
        return priceRepository.find({
            where: {
                agencyId,
                audienceType: price_model_1.PriceAudienceType.AGENCY,
                activo: true,
            },
            relations: ['product', 'agency'],
        });
    }
    // Establecer precio visible para clientes
    async setCustomerVisiblePrice(priceId, visible, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        const price = await this.getPriceById(priceId);
        // Solo super admin o admin de la agencia pueden cambiar la visibilidad
        if (currentUser.role !== user_model_1.UserRole.SUPER_ADMIN &&
            price.agencyId &&
            currentUser.agencyId !== price.agencyId) {
            throw new errors_1.UnauthorizedError('No tienes permisos para modificar este precio');
        }
        price.visibleClientes = visible;
        return priceRepository.save(price);
    }
    // Establecer precio visible para agencias
    async setAgencyVisiblePrice(priceId, visible, currentUser) {
        const priceRepository = (0, global_1.getRepository)(price_model_1.ProductPriceModel);
        const price = await this.getPriceById(priceId);
        // Solo super admin puede cambiar la visibilidad para agencias
        if (currentUser.role !== user_model_1.UserRole.SUPER_ADMIN) {
            throw new errors_1.UnauthorizedError('No tienes permisos para modificar la visibilidad para agencias');
        }
        price.visibleAgencias = visible;
        return priceRepository.save(price);
    }
    // Métodos para gestionar tasas de cambio
    async setCurrencyRate(data, currentUser) {
        const currencyRateRepository = (0, global_1.getRepository)(price_model_1.CurrencyRateModel);
        // Solo super admin puede modificar tasas de cambio
        if (currentUser.role !== user_model_1.UserRole.SUPER_ADMIN) {
            throw new errors_1.UnauthorizedError('No tienes permisos para modificar tasas de cambio');
        }
        const existingRate = await currencyRateRepository.findOne({
            where: { currency: data.currency },
        });
        if (existingRate) {
            // Actualizar tasa existente
            Object.assign(existingRate, data);
            return currencyRateRepository.save(existingRate);
        }
        else {
            // Crear nueva tasa
            const newRate = currencyRateRepository.create(data);
            return currencyRateRepository.save(newRate);
        }
    }
    async getCurrencyRates() {
        const currencyRateRepository = (0, global_1.getRepository)(price_model_1.CurrencyRateModel);
        return currencyRateRepository.find();
    }
    // Método utilitario para convertir precios entre monedas
    async convertPrice(amount, fromCurrency, toCurrency) {
        // Si las monedas son iguales, no hay conversión
        if (fromCurrency === toCurrency) {
            return amount;
        }
        // Obtener tasas de cambio
        const rates = await this.getCurrencyRates();
        const fromRate = rates.find((r) => r.currency === fromCurrency);
        const toRate = rates.find((r) => r.currency === toCurrency);
        if (!fromRate || !toRate) {
            throw new errors_1.BadRequestError('Moneda no soportada para conversión');
        }
        // Convertir a USD primero (si no es USD)
        let usdAmount = amount;
        if (fromCurrency !== 'usd') {
            usdAmount = amount / fromRate.rateToUSD;
        }
        // Convertir de USD a la moneda destino (si no es USD)
        if (toCurrency === 'usd') {
            return usdAmount;
        }
        else {
            return usdAmount * toRate.rateToUSD;
        }
    }
    // Validar permisos de modificación de precios
    validatePricePermissions(priceData, currentUser) {
        // Super admin puede crear/modificar cualquier tipo de precio
        if (currentUser.role === user_model_1.UserRole.SUPER_ADMIN) {
            return;
        }
        // Validaciones para admin de agencia
        if (currentUser.role === user_model_1.UserRole.AGENCY_ADMIN) {
            // Solo puede crear/modificar precios para su agencia
            if (priceData.audienceType === price_model_1.PriceAudienceType.AGENCY) {
                if (priceData.agencyId !== currentUser.agencyId) {
                    throw new errors_1.UnauthorizedError('Solo puedes gestionar precios para tu agencia');
                }
            }
            else if (priceData.audienceType === price_model_1.PriceAudienceType.PUBLIC) {
                throw new errors_1.UnauthorizedError('No puedes gestionar precios públicos');
            }
            return;
        }
        // Los demás usuarios no pueden modificar precios
        throw new errors_1.UnauthorizedError('No tienes permisos para gestionar precios');
    }
}
exports.PriceService = PriceService;
exports.default = new PriceService();
