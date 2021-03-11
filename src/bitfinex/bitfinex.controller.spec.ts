import * as _ from 'lodash'
import { ok } from 'assert';
import { WS2Manager } from 'bitfinex-api-node'
import { Test, TestingModule } from '@nestjs/testing';

import { BitfinexService } from './bitfinex.service';
import { BitfinexController } from './bitfinex.controller';

describe('BitfinexController', () => {
  let manager
  let bitfinexController: BitfinexController;
  const symbols = [
    "AAABBB", "AAVE:USD", "AAVE:UST", "ADABTC", "ADAUSD", "ADAUST",
    "ALGBTC", "ALGUSD", "ALGUST", "AMPBTC", "AMPUSD", "AMPUST", "ANTBTC",
    "ANTETH", "ANTUSD", "ASTUSD", "ATOBTC", "ATOETH", "ATOUSD", "AVAX:USD",
    "AVAX:UST", "AVTUSD", "B21X:USD", "B21X:UST", "BALUSD", "BALUST", "BAND:USD"
  ]

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BitfinexController],
      providers: [BitfinexService],
    }).compile();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bitfinexController = app.get<BitfinexController>(BitfinexController);
  });

  afterEach(async () => {
    if (manager) {
      try {
        await manager.close()
      } catch (e) {
        ok(true, 'may fail due to being modified internally')
      } finally {
        manager = null
      }
    }
  })

  describe('root', () => {
    it('binds \'subscribed\' listener to remove channel from pending subs', async () => {
      manager = new WS2Manager()
      const s = manager.openSocket()

      s.pendingSubscriptions.push(['ticker', { symbol: 'tBTCUSD', prec: 'R0' }])
      s.ws.emit('subscribed', {
        channel: 'ticker',
        symbol: 'tBTCUSD',
        prec: 'R0',
        len: '25'
      })

      expect(s.pendingSubscriptions.length).toStrictEqual(0)

      return new Promise((resolve, reject) => {
        s.ws.on('open', () => s.ws.close().then(resolve).catch(reject))
      })
    })

    it('multiple subscription', async () => {
      manager = new WS2Manager()
      const s = manager.openSocket()

      _.forEach(symbols, symbol => {
        s.pendingSubscriptions.push(['ticker', { symbol: `t${symbol}`, prec: 'R0' }])
      })
      
      expect(s.pendingSubscriptions.length).toStrictEqual(27)

      const pendingSub = _.cloneDeep(s.pendingSubscriptions)

      _.forEach(pendingSub, (sub) => {
        if (_.isArray(sub)) {
          const [channel, identifier] = sub
  
          s.ws.emit('subscribed', {
            channel,
            len: '25',
            ...identifier
          })
        }
      })

      expect(s.pendingSubscriptions.length).toStrictEqual(0)

      return new Promise((resolve, reject) => {
        s.ws.on('open', () => s.ws.close().then(resolve).catch(reject))
      })
    })
  });

  describe('unsubscribe', () => {
    it('saves pending unsubscribe & calls unsubscribe on socket', () => {
      manager = new WS2Manager()
      let unsubCalled = false

      manager._sockets[0] = {
        pendingUnsubscriptions: [],
        ws: {
          unsubscribe: (cid) => {
            expect(cid).toStrictEqual(42)
            unsubCalled = true
          },
          hasChannel: (cid) => {
            return cid === 42
          }
        }
      }
      const firstSocket = _.first(manager._sockets)
      manager.unsubscribe(42)
      expect(firstSocket.pendingUnsubscriptions).toStrictEqual([42])
      expect(unsubCalled).toBe(true)
    })

    it('unsubscribe multiple chanel & calls unsubscribe on socket', () => {
      manager = new WS2Manager()
      let unsubCalled = false

      const listOfChannelId = _.map(_.cloneDeep(symbols), (symbols, index) => index+1)

      manager._sockets[0] = {
        pendingUnsubscriptions: [],
        ws: {
          unsubscribe: (cid) => {
            const index = _.indexOf(listOfChannelId, cid)

            if (index >= 0) {
              expect(listOfChannelId[index]).toStrictEqual(cid)
              unsubCalled = true
            }
          },
          hasChannel: (cid) => {
            return _.includes(listOfChannelId, cid)
          }
        }
      }

      _.forEach(listOfChannelId, (cId) => {
        manager.unsubscribe(cId + 1)
        const index = _.indexOf(listOfChannelId, cId)

        if (index >= 0) {
          expect(listOfChannelId[index]).toStrictEqual(cId)
          expect(unsubCalled).toBe(true)
        }
      })
    })
  })

  describe('close', () => {
    it('calls close on all sockets', async () => {
      manager = new WS2Manager()
      let called = false

      manager._sockets.push({
        ws: { close: async () => { called = true } }
      })

      await manager.close()
      ok(called, 'close not called on socket')
    })

    it('resolves when all sockets close', async () => {
      manager = new WS2Manager()
      let called = false

      manager._sockets.push({
        ws: {
          close: async () => {
            jest.setTimeout(10)
            called = true
          }
        }
      })

      await manager.close()
      ok(called, 'close not called on socket')
    })
  })
});
