import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  nom?: string;

  @Column({ type: 'enum', enum: Role, default: Role.UTILISATEUR })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash?: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetPasswordTokenHash?: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  resetPasswordExpires?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}