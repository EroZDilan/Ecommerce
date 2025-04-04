"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyRateModel = exports.ProductPriceModel = exports.CurrencyType = exports.PriceType = exports.PriceAudienceType = void 0;
// src/models/price.model.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
// Enum para tipos de audiencia de precios
var PriceAudienceType;
(function (PriceAudienceType) {
    PriceAudienceType["PUBLIC"] = "public";
    PriceAudienceType["AGENCY"] = "agency";
    PriceAudienceType["CUSTOMER"] = "customer";
})(PriceAudienceType || (exports.PriceAudienceType = PriceAudienceType = {}));
// Enum para tipos de precios
var PriceType;
(function (PriceType) {
    PriceType["FIXED"] = "fixed";
    PriceType["PERCENTAGE"] = "percentage";
    PriceType["WEIGHT_BASED"] = "weight_based";
})(PriceType || (exports.PriceType = PriceType = {}));
// Enum para tipos de moneda
var CurrencyType;
(function (CurrencyType) {
    CurrencyType["USD"] = "usd";
    CurrencyType["EUR"] = "eur";
    CurrencyType["MXN"] = "mxn";
    // Más monedas según sea necesario
})(CurrencyType || (exports.CurrencyType = CurrencyType = {}));
let ProductPriceModel = class ProductPriceModel {
};
exports.ProductPriceModel = ProductPriceModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "El ID del producto es requerido" }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("ProductModel"),
    (0, typeorm_1.JoinColumn)({ name: "productId" }),
    __metadata("design:type", Object)
], ProductPriceModel.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PriceAudienceType,
        default: PriceAudienceType.PUBLIC,
    }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "audienceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "agencyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("AgencyModel", { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "agencyId" }),
    __metadata("design:type", Object)
], ProductPriceModel.prototype, "agency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PriceType,
        default: PriceType.FIXED,
    }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "priceType", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: CurrencyType,
        default: CurrencyType.USD,
    }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "temporada", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "incluirPesoPrecio", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "precioPeso", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PriceType,
        default: PriceType.FIXED,
        nullable: true,
    }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "tipoPrecioPeso", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "requiereEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "incluyeManejoEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "permiteEntregaDomicilio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "minimoDiasEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "maximoDiasEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "permiteRecogidaTienda", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "minimoDiasRecogida", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "maximoDiasRecogida", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "maximoDiasRetenerProducto", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "cantidadPagarDestino", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PriceType,
        default: PriceType.FIXED,
        nullable: true,
    }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "tipoCantidadPagarDestino", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "esListable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProductPriceModel.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "visibleClientes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductPriceModel.prototype, "visibleAgencias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], ProductPriceModel.prototype, "orden", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductPriceModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductPriceModel.prototype, "updatedAt", void 0);
exports.ProductPriceModel = ProductPriceModel = __decorate([
    (0, typeorm_1.Entity)("product_prices")
], ProductPriceModel);
// Modelo para gestionar la tasa de cambio de monedas
let CurrencyRateModel = class CurrencyRateModel {
};
exports.CurrencyRateModel = CurrencyRateModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CurrencyRateModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: CurrencyType,
        unique: true,
    }),
    __metadata("design:type", String)
], CurrencyRateModel.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 4 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CurrencyRateModel.prototype, "rateToUSD", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CurrencyRateModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CurrencyRateModel.prototype, "updatedAt", void 0);
exports.CurrencyRateModel = CurrencyRateModel = __decorate([
    (0, typeorm_1.Entity)("currency_rates")
], CurrencyRateModel);
