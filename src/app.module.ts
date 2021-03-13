import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BitfinexModule } from './bitfinex/bitfinex.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    BitfinexModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
