import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../types/auth";

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
  role!: UserRole;

  @Column()
  password!: string;
}
