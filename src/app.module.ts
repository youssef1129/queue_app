import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ReasonsModule } from './reasons/reasons.module';
@Module({
  imports: [ConfigModule.forRoot(), ReasonsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
