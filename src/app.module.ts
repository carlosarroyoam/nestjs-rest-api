import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        extra: {
          connectionLimit: configService.get('DATABASE_POOL_SIZE'),
        },
        autoLoadEntities: true,
        synchronize: false, // Setting synchronize: true shouldn't be used in production.
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
