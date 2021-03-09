import { BitfinexModule } from './bitfinex/bitfinex.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [BitfinexModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
