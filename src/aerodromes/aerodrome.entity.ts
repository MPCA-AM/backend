import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Piste } from './piste.entity';

export enum AerodromeType {
  INTERNATIONAL = 'international',
  NATIONAL = 'national',
  REGIONAL = 'regional',
  PRIVE = 'prive',
  MILITAIRE = 'militaire',
}

export enum AerodromeStatut {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  FERME = 'ferme',
}

@Entity('aerodromes')
export class Aerodrome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ unique: true, nullable: true })
  code_oaci: string;

  @Column({ nullable: true })
  code_iata: string;

  @Column('decimal', { precision: 9, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @Column({ nullable: true })
  altitude: number;

  @Column({
    type: 'enum',
    enum: AerodromeType,
    default: AerodromeType.REGIONAL,
  })
  type: AerodromeType;

  @Column({
    type: 'enum',
    enum: AerodromeStatut,
    default: AerodromeStatut.ACTIF,
  })
  statut: AerodromeStatut;

  @Column()
  region: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  gestionnaire: string;

  @OneToMany(() => Piste, (piste) => piste.aerodrome, { cascade: true })
  pistes: Piste[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
