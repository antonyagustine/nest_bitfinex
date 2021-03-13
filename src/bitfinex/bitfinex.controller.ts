import { Controller, Get, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { BitfinexService } from './bitfinex.service';

@Controller()
export class BitfinexController {
  constructor(private readonly bfService: BitfinexService) {}

  @Get('/bitfinex/books-subscription')
  booksSubscription(): any {
    this.bfService.subscribeToBooks()
  }

  @Get('/bitfinex/ticker-subscription')
  tickerSubscription(@Param('id') symbol = 'tETHUSD'): any {
    if (symbol) {
      this.bfService.subscribeToTicker(symbol)
    }
  }

  @Get('/bitfinex/ticker-unsubscription')
  tickerUnSubscription(): any {
    this.bfService.unSubscribe('ticker', { symbol: 'tETHUSD' })
  }
}
