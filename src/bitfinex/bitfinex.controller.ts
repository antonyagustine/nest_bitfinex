import { Controller, Get, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { BitfinexService } from './bitfinex.service';

@Controller()
export class BitfinexController {
  constructor(private readonly bfService: BitfinexService) {}

  @Get('/bitfinex/books-subscription')
  booksSubscription(): any {
    this.bfService.subscribeToBooks()
  }

  @Get('/bitfinex/ticker-subscription/:symbol')
  tickerSubscription(@Param('id') symbol = 'tETHUSD'): any {
    if (symbol) {
      this.bfService.subscribeToTicker(symbol)
    } else {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: 'Symbol not found!',
      }, HttpStatus.NOT_ACCEPTABLE)
    }
  }

  @Get('/bitfinex/ticker-unsubscription')
  tickerUnSubscription(): any {
    this.bfService.unSubscribe('ticker', { symbol: 'tETHUSD' })
  }
}
