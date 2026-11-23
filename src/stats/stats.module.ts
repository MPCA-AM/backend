import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aerodrome } from '../aerodromes/aerodrome.entity';
import { Aeronef } from '../aeronefs/aeronef.entity';
import { User } from '../users/user.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aerodrome, Aeronef, User])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
