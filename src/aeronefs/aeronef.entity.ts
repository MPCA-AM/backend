import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AeronefCategorie {
  COMMERCIAL = 'commercial',
  PRIVE = 'prive',
  CARGO = 'cargo',
  MILITAIRE = 'militaire',
  UTILITAIRE = 'utilitaire',
  HELICOPTERE = 'helicoptere',
}

export enum AeronefStatut {
  EN_VOL = 'en_vol',
  AU_SOL = 'au_sol',
  MAINTENANCE = 'maintenance',
  INACTIF = 'inactif',
}

@Entity('aeronefs')
export class Aeronef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  immatriculation: string; // Ex: '5R-MGA'

  @Column()
  type_aeronef: string; // Ex: 'ATR 72-600'

  @Column({ nullable: true })
  constructeur: string;

  @Column({ nullable: true })
  compagnie: string;

  @Column({ default: 'Madagascar' })
  pays_immatriculation: string;

  @Column({
    type: 'enum',
    enum: AeronefCategorie,
    default: AeronefCategorie.COMMERCIAL,
  })
  categorie: AeronefCategorie;

  @Column({
    type: 'enum',
    enum: AeronefStatut,
    default: AeronefStatut.AU_SOL,
  })
  statut: AeronefStatut;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  altitude: number; // Pieds

  @Column({ nullable: true })
  vitesse: number; // km/h

  @Column({ nullable: true })
  cap: number; // Degrés 0-360

  @Column({ nullable: true })
  aeroport_depart: string;

  @Column({ nullable: true })
  aeroport_arrivee: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
