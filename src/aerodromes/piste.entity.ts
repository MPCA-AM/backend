import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Aerodrome } from './aerodrome.entity';

export enum RevetementType {
  BETON = 'beton',
  ASPHALTE = 'asphalte',
  GRAVIER = 'gravier',
  TERRE = 'terre',
  GAZON = 'gazon',
}

@Entity('pistes')
export class Piste {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Aerodrome, (aerodrome) => aerodrome.pistes, {
    onDelete: 'CASCADE',
  })
  aerodrome: Aerodrome;

  @Column()
  designation: string; // Ex: '11/29'

  @Column()
  longueur: number; // Mètres

  @Column({ nullable: true })
  largeur: number; // Mètres

  @Column({ nullable: true })
  orientation: number; // Degrés (0-360)

  @Column({
    type: 'enum',
    enum: RevetementType,
    default: RevetementType.ASPHALTE,
  })
  revetement: RevetementType;

  @Column({ nullable: true })
  resistance: string; // PCN (Pavement Classification Number)

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
