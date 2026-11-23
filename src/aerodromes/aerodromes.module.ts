import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aerodrome } from './aerodrome.entity';
import { Piste } from './piste.entity';
import { AerodromesService } from './aerodromes.service';
import { AerodromesController } from './aerodromes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aerodrome, Piste])],
  controllers: [AerodromesController],
  providers: [AerodromesService],
  exports: [AerodromesService],
})
export class AerodromesModule {}
