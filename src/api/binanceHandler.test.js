import Binance from 'node-binance-api';
import BinanceHandler from './binanceHandler';

// DANIEL -------------- //
const binanceClient = new Binance();

binanceClient.options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.API_SECRET,
  useServerTime: true,
  test: false,
});

test('Get BTC/TRX Price', async () => {
  const trxPrice = await BinanceHandler.getCoinPrice(binanceClient, 'TRX', 'BTC');
  expect(trxPrice).not.toBeLessThan(0.000001);
});

test('Get caclulatePotentialQuantity of TRX', async () => {
  const btcBalance = await BinanceHandler.getCoinBalance(
    binanceClient,
    'BTC',
    true,
    5,
  );
  expect(btcBalance).not.toBeUndefined();
  const coinPriceInBtc = await BinanceHandler.getCoinPrice(
    binanceClient,
    'TRX',
    'BTC',
  );
  expect(coinPriceInBtc).not.toBeUndefined();
  expect(coinPriceInBtc).not.toBeLessThan(0.00000139);
  const potentialQuantity = await BinanceHandler.caclulatePotentialQuantity(
    btcBalance,
    coinPriceInBtc,
    0.25,
    true,
    4,
  );
  expect(potentialQuantity).not.toBeUndefined();
  expect(potentialQuantity).not.toBeLessThan(1);
});

test('Get the stoploss of 2% of BTC/ETH', async () => {
  const coinPriceInBtc = await BinanceHandler.getCoinPrice(
    binanceClient,
    'ETH',
    'BTC',
  );
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInBtc,
  );
  expect(stopLossPrice).not.toBeUndefined();
  expect(stopLossPrice).not.toBeLessThan(0.01);
});

test('Get stoploss value of BTC', async () => {
  const coinPriceInBtc = await BinanceHandler.getCoinPrice(
    binanceClient,
    'ETH',
    'BTC',
  );
  expect(coinPriceInBtc).not.toBeUndefined();
  console.log('TCL: coinPriceInBtc', coinPriceInBtc);
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInBtc,
  );
  console.log('TCL: stopLossPrice', stopLossPrice);
  expect(stopLossPrice).not.toBeUndefined();
  expect(stopLossPrice).not.toBeLessThan(0.01);
});

test('Get stoploss value of BTC', async () => {
  const coinPriceInBtc = await BinanceHandler.getCoinPrice(
    binanceClient,
    'ETH',
    'BTC',
  );
  expect(coinPriceInBtc).not.toBeUndefined();
  console.log('TCL: coinPriceInBtc', coinPriceInBtc);
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInBtc,
  );
  console.log('TCL: stopLossPrice', stopLossPrice);
  expect(stopLossPrice).not.toBeUndefined();
  expect(stopLossPrice).not.toBeLessThan(0.01);
});

test('Get quantity of BTC', async () => {
  expect.assertions(1);
  const btcBalance = await BinanceHandler.getCoinBalance(
    binanceClient,
    'BTC',
    true,
    8,
  );
  expect(btcBalance).not.toBeUndefined();
});

test('Get BTC/ETH Price', async () => {
  const btcPrice = await BinanceHandler.getCoinPrice(binanceClient, 'ETH', 'BTC');
  console.log('ETH btcPrice ===========>', btcPrice);
  expect(btcPrice).not.toBeLessThan(0.01);
});

test('Get ETH Balance', async () => {
  const balance = await BinanceHandler.getBalancePromise('ETH', binanceClient);
  console.log('balance', balance);
  expect(balance).not.toBeUndefined();
});

test('Get open oders', async () => {
  const orders = await BinanceHandler.getOpenOrders(binanceClient);
  console.log('orders', orders);
  // expect(orders).not.toBeUndefined();
  expect(orders).toBe([{ a: true }]);
});
