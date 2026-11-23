import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { AerodromesModule } from './aerodromes/aerodromes.module';
import { AeronefsModule } from './aeronefs/aeronefs.module';
import { StatsModule } from './stats/stats.module';
import { DistrictsModule } from './districts/districts.module';
import { GeoserverModule } from './geoserver/geoserver.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production', // utiliser des migrations en prod
      }),
    }),
    UsersModule,
    MailModule,
    AuthModule,
    AerodromesModule,
    AeronefsModule,
    DistrictsModule,
    GeoserverModule,
    DocumentsModule,
    StatsModule,
  ],
  providers: [
    // L'ordre compte : limitation → authentification JWT → rôles
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [],
})
export class AppModule {}
