import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseProvider } from './database.provider';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // optional but useful
  })],
  controllers: [AppController],
  providers: [AppService, databaseProvider],
})
export class AppModule {}
