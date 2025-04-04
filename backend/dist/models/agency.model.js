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
exports.AgencyModel = exports.AgencyType = void 0;
// src/models/agency.model.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
// Enum para tipos de agencia
var AgencyType;
(function (AgencyType) {
    AgencyType["DISTRIBUTOR"] = "distributor";
    AgencyType["RETAILER"] = "retailer";
    AgencyType["SERVICES"] = "services";
})(AgencyType || (exports.AgencyType = AgencyType = {}));
let AgencyModel = class AgencyModel {
};
exports.AgencyModel = AgencyModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AgencyModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "El nombre es requerido" }),
    __metadata("design:type", String)
], AgencyModel.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], AgencyModel.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AgencyType,
        default: AgencyType.RETAILER,
    }),
    __metadata("design:type", String)
], AgencyModel.prototype, "tipoAgencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AgencyModel.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgencyModel.prototype, "urlSeguimiento", void 0);
__decorate([
    (0, typeorm_1.OneToMany)("UserModel", "agency"),
    __metadata("design:type", Array)
], AgencyModel.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AgencyModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AgencyModel.prototype, "updatedAt", void 0);
exports.AgencyModel = AgencyModel = __decorate([
    (0, typeorm_1.Entity)("agencies")
], AgencyModel);
