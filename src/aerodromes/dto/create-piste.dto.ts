import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevetementType } from '../piste.entity';

export class CreatePisteDto {
  @ApiProperty({ example: '11/29' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 3100 })
  @IsNumber()
  longueur: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  largeur?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsNumber()
  @IsOptional()
  orientation?: number;

  @ApiPropertyOptional({ enum: RevetementType, default: RevetementType.ASPHALTE })
  @IsEnum(RevetementType)
  @IsOptional()
  revetement?: RevetementType;

  @ApiPropertyOptional({ example: 'PCN 60/F/B/W/T' })
  @IsString()
  @IsOptional()
  resistance?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
