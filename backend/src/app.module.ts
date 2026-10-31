import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ReasonsModule } from './reasons/reasons.module';
import { TicketsModule } from './tickets/tickets.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ReasonsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
