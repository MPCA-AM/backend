import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AeronefCategorie, AeronefStatut } from '../aeronef.entity';

export class CreateAeronefDto {
  @ApiProperty({ example: '5R-EAA' })
  @IsString()
  @IsNotEmpty()
  immatriculation: string;

  @ApiProperty({ example: 'ATR 72-600' })
  @IsString()
  @IsNotEmpty()
  type_aeronef: string;

  @ApiPropertyOptional({ example: 'ATR Aircraft' })
  @IsString()
  @IsOptional()
  constructeur?: string;

  @ApiPropertyOptional({ example: 'Madagascar Airlines' })
  @IsString()
  @IsOptional()
  compagnie?: string;

  @ApiPropertyOptional({ example: 'Madagascar', default: 'Madagascar' })
  @IsString()
  @IsOptional()
  pays_immatriculation?: string;

  @ApiPropertyOptional({ enum: AeronefCategorie, default: AeronefCategorie.COMMERCIAL })
  @IsEnum(AeronefCategorie)
  @IsOptional()
  categorie?: AeronefCategorie;

  @ApiPropertyOptional({ enum: AeronefStatut, default: AeronefStatut.AU_SOL })
  @IsEnum(AeronefStatut)
  @IsOptional()
  statut?: AeronefStatut;

  @ApiPropertyOptional({ example: -18.7969 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 47.4788 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsNumber()
  @IsOptional()
  altitude?: number;

  @ApiPropertyOptional({ example: 480 })
  @IsNumber()
  @IsOptional()
  vitesse?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsNumber()
  @IsOptional()
  cap?: number;

  @ApiPropertyOptional({ example: 'FMMI' })
  @IsString()
  @IsOptional()
  aeroport_depart?: string;

  @ApiPropertyOptional({ example: 'FMNN' })
  @IsString()
  @IsOptional()
  aeroport_arrivee?: string;
}

export class UpdatePositionDto {
  @ApiProperty({ example: -18.7969 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 47.4788 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsNumber()
  @IsOptional()
  altitude?: number;

  @ApiPropertyOptional({ example: 480 })
  @IsNumber()
  @IsOptional()
  vitesse?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsNumber()
  @IsOptional()
  cap?: number;

  @ApiPropertyOptional({ enum: AeronefStatut, default: AeronefStatut.EN_VOL })
  @IsEnum(AeronefStatut)
  @IsOptional()
  statut?: AeronefStatut;
}
