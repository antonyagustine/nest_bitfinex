import * as _ from 'lodash'
import { ok } from 'assert';
import { debug } from 'console';
import { WS2Manager } from 'bitfinex-api-node'
import { Test, TestingModule } from '@nestjs/testing';

import { BitfinexService } from './bitfinex.service';
import { BitfinexController } from './bitfinex.controller';

describe('BitfinexController', () => {
  let manager
  // let bitfinexController: BitfinexController;
  // const symbols = [
  //   "AAABBB", "AAVE:USD", "AAVE:UST", "ADABTC", "ADAUSD", "ADAUST",
  //   "ALGBTC", "ALGUSD", "ALGUST", "AMPBTC", "AMPUSD", "AMPUST", "ANTBTC",
  //   "ANTETH", "ANTUSD", "ASTUSD", "ATOBTC", "ATOETH", "ATOUSD", "AVAX:USD",
  //   "AVAX:UST", "AVTUSD", "B21X:USD", "B21X:UST", "BALUSD", "BALUST", "BAND:USD"
  // ]

  // beforeEach(async () => {
  //   const app: TestingModule = await Test.createTestingModule({
  //     controllers: [BitfinexController],
  //     providers: [BitfinexService],
  //   }).compile();

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   bitfinexController = app.get<BitfinexController>(BitfinexController);
  // });

  // afterEach(async () => {
  //   if (manager) {
  //     try {
  //       await manager.close()
  //     } catch (e) {
  //       ok(true, 'may fail due to being modified internally')
  //     } finally {
  //       manager = null
  //     }
  //   }
  // })

  const subscribeTicker = (symbol) => {
    return new Promise((resolve) => {
      const socketWithDataChannel = manager.getSocketWithDataChannel('ticker', { symbol })

      if (!_.isEmpty(socketWithDataChannel)) {
        const { ws } = socketWithDataChannel

        if (ws.isOpen()) {
          resolve('already subscribed')
          return
        }
      }

      manager.onTicker({ symbol }, (snapshot) => {
        if (_.isArray(snapshot)) {
          resolve(snapshot)
        }
      })  
    })
  }

  describe('root ticker channel', () => {
    it('\'subscribed\' on ticker channel', async () => {
      debug('\n☐ \'subscribed\' on ticker channel \n')
      const symbol = 'tETHUSD'
      manager = new WS2Manager()
      manager.subscribeTicker(symbol)

      await subscribeTicker(symbol)
      expect(_.isEmpty(manager._sockets)).toStrictEqual(false)
    })

    it('resubscription handler to same channel', async () => {
      debug('☐ resubscription handler to same channel \n')
      const symbol = 'tETHUSD'
      const res = await subscribeTicker(symbol)
      expect(res).toStrictEqual('already subscribed')
    })

    it('check socket is active/alive', async () => {
      debug('☐ check socket is active/alive \n')
      const symbol = 'tETHUSD'
      await subscribeTicker(symbol)
      expect(manager._sockets.length).toStrictEqual(1)
    })

    it('getSocketWithDataChannel should return socket with it\'s data channel', async () => {
      debug('☐ getSocketWithDataChannel should return socket with it\'s data channel \n')
      const symbol = 'tETHUSD'
      const socketWithDataChannel = manager.getSocketWithDataChannel('ticker', { symbol })
      expect(_.isEmpty(socketWithDataChannel)).toStrictEqual(false)
    })

    it('check socket is opened before closing the it', async () => {
      debug('☐ check socket is opened before closing the it \n')
      const symbol = 'tETHUSD'
      const socketWithDataChannel = manager.getSocketWithDataChannel('ticker', { symbol })
      const { ws } = socketWithDataChannel
      expect(ws.isOpen()).toStrictEqual(true)
    })

    it('close ticket channel', async () => {
      debug('☐ close ticket channel \n')
      const symbol = 'tETHUSD'
      const socketWithDataChannel = manager.getSocketWithDataChannel('ticker', { symbol })
      const { ws } = socketWithDataChannel
      await ws.close()
    })
  });
});
