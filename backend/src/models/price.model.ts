// src/models/price.model.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

// Enum para tipos de audiencia de precios
export enum PriceAudienceType {
  PUBLIC = "public", // Precio visible para todos los usuarios
  AGENCY = "agency", // Precio visible solo para agencias
  CUSTOMER = "customer", // Precio específico para clientes
}

// Enum para tipos de precios
export enum PriceType {
  FIXED = "fixed", // Precio fijo
  PERCENTAGE = "percentage", // Porcentaje sobre otro precio
  WEIGHT_BASED = "weight_based", // Basado en peso
}

// Enum para tipos de moneda
export enum CurrencyType {
  USD = "usd",
  EUR = "eur",
  MXN = "mxn",
  // Más monedas según sea necesario
}

@Entity("product_prices")
export class ProductPriceModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "El ID del producto es requerido" })
  productId: string;

  // Usar string en lugar de función para evitar referencia circular
  @ManyToOne("ProductModel")
  @JoinColumn({ name: "productId" })
  product: any;

  @Column({
    type: "enum",
    enum: PriceAudienceType,
    default: PriceAudienceType.PUBLIC,
  })
  audienceType: PriceAudienceType;

  @Column({ nullable: true })
  agencyId: string;

  // Usar string en lugar de función para evitar referencia circular
  @ManyToOne("AgencyModel", { nullable: true })
  @JoinColumn({ name: "agencyId" })
  agency: any;

  @Column({
    type: "enum",
    enum: PriceType,
    default: PriceType.FIXED,
  })
  priceType: PriceType;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  value: number;

  @Column({
    type: "enum",
    enum: CurrencyType,
    default: CurrencyType.USD,
  })
  currency: CurrencyType;

  @Column({ nullable: true })
  temporada: string;

  @Column({ default: false })
  incluirPesoPrecio: boolean;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  precioPeso: number;

  @Column({
    type: "enum",
    enum: PriceType,
    default: PriceType.FIXED,
    nullable: true,
  })
  tipoPrecioPeso: PriceType;

  @Column({ default: true })
  requiereEnvio: boolean;

  @Column({ default: false })
  incluyeManejoEnvio: boolean;

  @Column({ default: true })
  permiteEntregaDomicilio: boolean;

  @Column({ default: 1 })
  minimoDiasEntrega: number;

  @Column({ default: 5 })
  maximoDiasEntrega: number;

  @Column({ default: true })
  permiteRecogidaTienda: boolean;

  @Column({ default: 1 })
  minimoDiasRecogida: number;

  @Column({ default: 3 })
  maximoDiasRecogida: number;

  @Column({ default: 30 })
  maximoDiasRetenerProducto: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  cantidadPagarDestino: number;

  @Column({
    type: "enum",
    enum: PriceType,
    default: PriceType.FIXED,
    nullable: true,
  })
  tipoCantidadPagarDestino: PriceType;

  @Column({ default: true })
  esListable: boolean;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: "text", nullable: true })
  notas: string;

  @Column({ default: true })
  visibleClientes: boolean;

  @Column({ default: true })
  visibleAgencias: boolean;

  @Column({ type: "int", default: 0 })
  orden: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Modelo para gestionar la tasa de cambio de monedas
@Entity("currency_rates")
export class CurrencyRateModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: CurrencyType,
    unique: true,
  })
  currency: CurrencyType;

  @Column("decimal", { precision: 10, scale: 4 })
  @IsNumber()
  @Min(0)
  rateToUSD: number; // Tasa de cambio con respecto al USD

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
