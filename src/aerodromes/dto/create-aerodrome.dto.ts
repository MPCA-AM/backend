import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AerodromeStatut, AerodromeType } from '../aerodrome.entity';

export class CreateAerodromeDto {
  @ApiProperty({ example: 'Antananarivo / Ivato' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'FMMI' })
  @IsString()
  @IsOptional()
  code_oaci?: string;

  @ApiPropertyOptional({ example: 'TNR' })
  @IsString()
  @IsOptional()
  code_iata?: string;

  @ApiProperty({ example: -18.7969 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 47.4788 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 1279 })
  @IsNumber()
  @IsOptional()
  altitude?: number;

  @ApiPropertyOptional({ enum: AerodromeType, default: AerodromeType.NATIONAL })
  @IsEnum(AerodromeType)
  @IsOptional()
  type?: AerodromeType;

  @ApiPropertyOptional({ enum: AerodromeStatut, default: AerodromeStatut.ACTIF })
  @IsEnum(AerodromeStatut)
  @IsOptional()
  statut?: AerodromeStatut;

  @ApiProperty({ example: 'Analamanga' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ example: 'Antananarivo' })
  @IsString()
  @IsOptional()
  ville?: string;

  @ApiPropertyOptional({ example: 'Ravinala Airports' })
  @IsString()
  @IsOptional()
  gestionnaire?: string;
}
