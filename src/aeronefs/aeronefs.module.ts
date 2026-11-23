import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aeronef } from './aeronef.entity';
import { AeronefsService } from './aeronefs.service';
import { AeronefsController } from './aeronefs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aeronef])],
  controllers: [AeronefsController],
  providers: [AeronefsService],
  exports: [AeronefsService],
})
export class AeronefsModule {}
