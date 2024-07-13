import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../types/auth";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  role!: UserRole;
}
