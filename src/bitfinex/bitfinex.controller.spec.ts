import { WS2Manager } from 'bitfinex-api-node'
import { Test, TestingModule } from '@nestjs/testing';

import { BitfinexService } from './bitfinex.service';
import { BitfinexController } from './bitfinex.controller';

describe('BitfinexController', () => {
  let bitfinexController: BitfinexController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BitfinexController],
      providers: [BitfinexService],
    }).compile();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bitfinexController = app.get<BitfinexController>(BitfinexController);
  });

  describe('root', () => {
    const manager = new WS2Manager()

    it('ticker Subscription', () => {
      manager.subscribeTicker('tETHUSD')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      manager.onTicker({ symbol: 'tETHUSD' }, () => {})
      const [channelDetails] = manager.getSocketInfo()
      expect(channelDetails).toStrictEqual({ nChannels: 1 });
    });

    it('pendingSubscriptions && pendingUnsubscriptions', () => {
      manager.subscribeTicker('tETHUSD')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      manager.onTicker({ symbol: 'tETHUSD' }, () => {})
      const freeDataSocket = manager.getFreeDataSocket()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pendingSubscriptions, pendingUnsubscriptions } = freeDataSocket
      expect(pendingSubscriptions.length).toStrictEqual(2);

      // NOTE consider pendingSubscriptions as pendingUnsubscriptions
      for(let i = 0; i < pendingSubscriptions.length; i++){
        const [channel, identifier] = pendingSubscriptions[i]
        expect(channel).toBe("ticker");
        expect(identifier).toStrictEqual({ symbol: 'tETHUSD' });
        manager.managedUnsubscribe(channel, identifier)
      }
    });
  });
});
