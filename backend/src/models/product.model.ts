// src/models/product.model.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

// Enums para los tipos de productos
export enum ProductType {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  SERVICE = "service",
}

// Enum para tipos de inventario
export enum InventoryType {
  SIMPLE = "simple", // Inventario básico con cantidad
  ATTRIBUTE_BASED = "attribute_based", // Inventario basado en atributos (talla, color, etc.)
  UNLIMITED = "unlimited", // Sin control de inventario
}

@Entity("products")
export class ProductModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "El nombre es requerido" })
  nombre: string;

  @Column({ nullable: true })
  nombreTraducido: string;

  @Column({ nullable: true })
  marca: string;

  @Column({
    type: "enum",
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  tipoProducto: ProductType;

  @Column({ nullable: true })
  departamentoId: string;

  // Usar string en lugar de función para evitar referencia circular
  @ManyToOne("DepartmentModel", { nullable: true })
  @JoinColumn({ name: "departamentoId" })
  departamento: any;

  @Column({ type: "simple-array", nullable: true })
  etiquetas: string[];

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ type: "text", nullable: true })
  descripcionTraducida: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  peso: number;

  @Column({ type: "simple-json", nullable: true })
  imagenes: { url: string; isPrimary: boolean }[];

  @Column({ default: false })
  disponibleParaCombo: boolean;

  @Column({ default: true })
  activo: boolean;

  // Inventario
  @Column({
    type: "enum",
    enum: InventoryType,
    default: InventoryType.SIMPLE,
  })
  tipoInventario: InventoryType;

  @Column({ default: 0 })
  cantidadInventario: number;

  @Column({ type: "text", nullable: true })
  notas: string;

  // Para relación inversa con los precios usando string
  @OneToMany("ProductPriceModel", "product")
  prices: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
