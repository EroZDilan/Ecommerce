// src/models/agency.model.ts
import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

// Enum para tipos de agencia
export enum AgencyType {
  DISTRIBUTOR = "distributor",
  RETAILER = "retailer",
  SERVICES = "services",
}

@Entity("agencies")
export class AgencyModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "El nombre es requerido" })
  nombre: string;

  @Column({ nullable: true, type: "text" })
  descripcion: string;

  @Column({ nullable: true })
  logo: string;

  @Column({
    type: "enum",
    enum: AgencyType,
    default: AgencyType.RETAILER,
  })
  tipoAgencia: AgencyType;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ default: true })
  activa: boolean;

  @Column({ nullable: true })
  urlSeguimiento: string;

  // Relación con usuarios usando string en lugar de función
  @OneToMany("UserModel", "agency")
  users: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
