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
exports.ProductModel = exports.InventoryType = exports.ProductType = void 0;
// src/models/product.model.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
// Enums para los tipos de productos
var ProductType;
(function (ProductType) {
    ProductType["PHYSICAL"] = "physical";
    ProductType["DIGITAL"] = "digital";
    ProductType["SERVICE"] = "service";
})(ProductType || (exports.ProductType = ProductType = {}));
// Enum para tipos de inventario
var InventoryType;
(function (InventoryType) {
    InventoryType["SIMPLE"] = "simple";
    InventoryType["ATTRIBUTE_BASED"] = "attribute_based";
    InventoryType["UNLIMITED"] = "unlimited";
})(InventoryType || (exports.InventoryType = InventoryType = {}));
let ProductModel = class ProductModel {
};
exports.ProductModel = ProductModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProductModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "El nombre es requerido" }),
    __metadata("design:type", String)
], ProductModel.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "nombreTraducido", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProductType,
        default: ProductType.PHYSICAL,
    }),
    __metadata("design:type", String)
], ProductModel.prototype, "tipoProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "departamentoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("DepartmentModel", { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "departamentoId" }),
    __metadata("design:type", Object)
], ProductModel.prototype, "departamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ProductModel.prototype, "etiquetas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "descripcionTraducida", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "peso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], ProductModel.prototype, "imagenes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "disponibleParaCombo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: InventoryType,
        default: InventoryType.SIMPLE,
    }),
    __metadata("design:type", String)
], ProductModel.prototype, "tipoInventario", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "cantidadInventario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)("ProductPriceModel", "product"),
    __metadata("design:type", Array)
], ProductModel.prototype, "prices", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductModel.prototype, "updatedAt", void 0);
exports.ProductModel = ProductModel = __decorate([
    (0, typeorm_1.Entity)("products")
], ProductModel);
