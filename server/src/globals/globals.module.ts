import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalsController } from './globals.controller';
import { GlobalsService } from './globals.service';
import { WorkingDayOverride } from './working-day-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingDayOverride])],
  controllers: [GlobalsController],
  providers: [GlobalsService],
})
export class GlobalsModule {}
