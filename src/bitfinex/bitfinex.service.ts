import * as _ from 'lodash'
import { debug } from 'console'
import { Injectable } from '@nestjs/common'
import { WS2Manager } from 'bitfinex-api-node'

@Injectable()
export class BitfinexService {
  readonly manager: WS2Manager

  constructor() {
    this.manager = new WS2Manager()
    setInterval(async () => {
      this.unSubscribePendingSubscriptions()
    }, 10 * 60 * 1000) // NOTE Every 10 minutes it should remove the pending UnSubscriptions 
  }

  async subscribeToTicker() {
    // STUB [1823.1,639.79057568,1823.2,646.25990726,71.0033152,0.0405,1823.1033152,82907.28144612,1861.4,1724.5]
    this.manager.subscribeTicker('tETHUSD')
    this.manager.onTicker({ symbol: 'tETHUSD' }, (ticker) => {
      const [
        symbol, bid, bid_size, 
        ask, ask_size, daily_change, 
        daily_change_relative, last_price, 
        volume, high, low
      ] = ticker
      debug('ETH/USD ticker: ', JSON.stringify({
        symbol, bid, bid_size, ask, ask_size, daily_change, 
        daily_change_relative, last_price, volume, high, low
      }, null, 2))
    })

    // this.manager.subscribeTicker('fUSD')
    // this.manager.onTicker({ symbol: 'fUSD' }, (ticker) => {
    //   debug('fUSD ticker: %j', ticker, this.booksSubscribeCount)
    // })
  }

  subscribeToBooks() {
    this.manager.subscribeOrderBook('tBTCUSD')

    this.manager.onOrderBook({ symbol: 'tBTCUSD' }, (ob) => {
      // const [price, bid, ask] = ob
      // debug('BTCUSD mid price: %d (bid: %d, ask: %d)', price, bid, ask)
    })
  }

  unSubscribePendingSubscriptions() {
    const freeDataSocket = this.manager.getFreeDataSocket()

    if (freeDataSocket) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pendingUnsubscriptions } = freeDataSocket

      // NOTE Unsubscribe Pending pendingUnsubscriptions
      _.forEach(pendingUnsubscriptions, (sub) => {
        const { channel, identifier } = sub
        this.manager.managedUnsubscribe(channel, identifier)
      });
    }
  }
}
