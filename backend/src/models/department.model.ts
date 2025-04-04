// src/models/department.model.ts
import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity("departments")
export class DepartmentModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "El nombre es requerido" })
  nombre: string;

  @Column({ nullable: true })
  nombreTraducido: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  icono: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ type: "text", nullable: true })
  descripcionTraducida: string;

  @Column({ default: true })
  mostrarEnBusqueda: boolean;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  mostrarReportes: boolean;

  // Subdepartamentos (relación auto-referencial)
  @Column({ nullable: true })
  parentId: string;

  // Para la relación inversa con productos usando string
  @OneToMany("ProductModel", "departamento")
  productos: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
