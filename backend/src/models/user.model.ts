// src/models/user.model.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

// Enum para roles de usuario
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  AGENCY_ADMIN = "agency_admin",
  AGENCY_USER = "agency_user",
  CUSTOMER = "customer",
}

@Entity("users")
export class UserModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  @IsNotEmpty({ message: "El nombre es requerido" })
  nombre: string;

  @Column({ length: 100 })
  @IsNotEmpty({ message: "Los apellidos son requeridos" })
  apellidos: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "El email debe ser válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email: string;

  @Column({ select: false })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @Length(8, 60, { message: "La contraseña debe tener al menos 8 caracteres" })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: "es" })
  lang: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ nullable: true })
  agencyId: string;

  // Usar string en lugar de función para evitar referencia circular
  @ManyToOne("AgencyModel", { nullable: true })
  @JoinColumn({ name: "agencyId" })
  agency: any;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
