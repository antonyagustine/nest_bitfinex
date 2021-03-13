import { Module } from '@nestjs/common';

import { BitfinexService } from './bitfinex.service';
import { BitfinexController } from './bitfinex.controller';

@Module({
  imports: [],
  controllers: [
    BitfinexController
  ],
  providers: [BitfinexService],
})
export class BitfinexModule { }
