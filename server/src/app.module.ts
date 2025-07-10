import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseProvider } from './database.provider';
import { WorkingDaysModule } from './working-days/working-days.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_SERVER || 'localhost',
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
      database: process.env.DB_NAME || 'master',
      synchronize: false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    WorkingDaysModule,
  ],
  controllers: [AppController],
  providers: [AppService, databaseProvider],
})
export class AppModule {}
