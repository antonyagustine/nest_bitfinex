import { Controller, Get } from '@nestjs/common';
import { BitfinexService } from './bitfinex.service';

@Controller()
export class BitfinexController {
  constructor(private readonly bfService: BitfinexService) {}

  @Get('/bitfinex/books-subscription')
  booksSubscription(): any {
    this.bfService.subscribeToBooks()
  }

  @Get('/bitfinex/ticker-subscription')
  tickerSubscription(): any {
    this.bfService.subscribeToTicker()
  }
}
