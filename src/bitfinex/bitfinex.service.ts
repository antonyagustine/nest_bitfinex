import * as _ from 'lodash'
import { debug } from 'console'
import { Injectable } from '@nestjs/common'
import { WS2Manager } from 'bitfinex-api-node'

@Injectable()
export class BitfinexService {
  public manager: WS2Manager

  constructor() {
    this.initManager()
    setInterval(async () => {
      this.unSubscribePendingSubscriptions()
    }, 10 * 60 * 1000) // NOTE Every 10 minutes it should remove the pending UnSubscriptions 
  }

  /**
   * @method initManager `initialize the WS2Manager`
   * @returns void
   */
  initManager() {
    this.manager = null
    process.nextTick(() => {
      this.manager = new WS2Manager()
    })
  }

  /**
   * 
   * @param { String } symbol `Symbol to be subscribed for ticker public WS `
   */
  subscribeToTicker(symbol) {
    if (_.isString(symbol)) {
      // STUB [1823.1,639.79057568,1823.2,646.25990726,71.0033152,0.0405,1823.1033152,82907.28144612,1861.4,1724.5]
      const socketWithDataChannel = this.manager.getSocketWithDataChannel('ticker', { symbol })
      
      if (!_.isEmpty(socketWithDataChannel)) {
        const { ws } = socketWithDataChannel
        
        if (ws.isOpen()) {
          debug('already subscribed')
          return
        }
      }

      debug('subscribe on ticker')
      this.manager.subscribeTicker(symbol)
      this.manager.onTicker({ symbol }, (ticker) => {
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
    }
  }

  /**
   * @method subscribeToBooks `Books public subscriptions`
   */
  subscribeToBooks() {
    this.manager.subscribeOrderBook('tBTCUSD')

    this.manager.onOrderBook({ symbol: 'tBTCUSD' }, (ob) => {
      const [price, bid, ask] = ob
      debug('BTCUSD mid price: %d (bid: %d, ask: %d)', price, bid, ask)
    })
  }

  /**
   * @method unSubscribePendingSubscriptions `unsubscribe all the pending Subscriptions`
   */
  unSubscribePendingSubscriptions() {
    const freeDataSocket = this.manager.getFreeDataSocket()

    if (freeDataSocket) {
      const { pendingUnsubscriptions } = freeDataSocket

      // NOTE Unsubscribe Pending pendingUnsubscriptions
      _.forEach(pendingUnsubscriptions, (sub) => {
        if (_.isArray(sub)) {
          const [channel, identifier] = sub
          this.unSubscribe(channel, identifier)
        }
      })
    }
  }

  /**
   * @method unSubscribe `unSubscribe from socket`
   * @param { string } channel `ticker`
   * @param { Object } identifier `{ symbol: 'tBTCUSD' }`
   */
  async unSubscribe(channel, identifier: { symbol: string }) {
    const socketWithDataChannel = this.manager.getSocketWithDataChannel(channel, identifier)

    if (!_.isEmpty(socketWithDataChannel)) {
      const { ws } = socketWithDataChannel

      if (_.isObject(ws)) {
        const chanId = ws.getDataChannelId(channel, identifier)

        if (chanId) {
          this.manager.unsubscribe(chanId)
          this.manager.managedUnsubscribe(channel, identifier)

          if (ws.isOpen()) {
            await ws.close()
          }
          debug('Unsubscribed channel %s: %s', channel, identifier)
        }
      }
    }
  }

  /**
   * @method closeAllOpenSockets
   * @returns void
   */
  closeAllOpenSockets() {
    if (!_.isEmpty(this.manager)) {
      this.manager.close()
    }
  }
}
