import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../types/auth";
import { Tenant } from "./Tenant";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  role!: UserRole;

  @ManyToOne(() => Tenant)
  tenant!: Tenant;
}
