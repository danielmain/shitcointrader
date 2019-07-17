import Binance from 'node-binance-api';
import BinanceHandler from './binanceHandler';

// DANIEL -------------- //
const { API_KEY } = process.env;
const { API_SECRET } = process.env;
const binanceClient = new Binance();

binanceClient.options({
  APIKEY: API_KEY,
  APISECRET: API_SECRET,
  useServerTime: true,
  test: false,
});

test('Get BTC/TUSD Price', async () => {
  const btcPrice = await BinanceHandler.getCoinPrice('BTC', 'TUSD', binanceClient);
  expect(btcPrice).not.toBeLessThan(0.001);
});

test('Get caclulatePotentialQuantity of BTC', async () => {
  const btcBalance = await BinanceHandler.getCoinBalance(
    binanceClient,
    'BTC',
    true,
    5,
  );
  expect(btcBalance).not.toBeLessThan(0.01);

  expect(btcBalance).not.toBeUndefined();
  const coinPriceInUsdt = await BinanceHandler.getCoinPrice(
    'BTC',
    'USDT',
    binanceClient,
  );
  expect(coinPriceInUsdt).not.toBeUndefined();
  const potentialQuantity = await BinanceHandler.caclulatePotentialQuantity(
    btcBalance,
    coinPriceInUsdt,
    0.8,
    true,
    4,
  );
  expect(potentialQuantity).not.toBeUndefined();
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInUsdt,
  );
  expect(stopLossPrice).not.toBeUndefined();
});

test('Get stoploss value of BTC', async () => {
  const coinPriceInUsdt = await BinanceHandler.getCoinPrice(
    'BTC',
    'USDT',
    binanceClient,
  );
  expect(coinPriceInUsdt).not.toBeUndefined();
  console.log('TCL: coinPriceInUsdt', coinPriceInUsdt);
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInUsdt,
  );
  console.log('TCL: stopLossPrice', stopLossPrice);
  expect(stopLossPrice).not.toBeUndefined();
  expect(stopLossPrice).not.toBeLessThan(3000);
});

test('Get stoploss value of BTC', async () => {
  const coinPriceInUsdt = await BinanceHandler.getCoinPrice(
    'BTC',
    'USDT',
    binanceClient,
  );
  expect(coinPriceInUsdt).not.toBeUndefined();
  console.log('TCL: coinPriceInUsdt', coinPriceInUsdt);
  const stopLossPrice = await BinanceHandler.getStopLossPrice(
    2,
    coinPriceInUsdt,
  );
  console.log('TCL: stopLossPrice', stopLossPrice);
  expect(stopLossPrice).not.toBeUndefined();
  expect(stopLossPrice).not.toBeLessThan(0.1);
});

test('Get caclulatePotentialQuantity of BTC', async () => {
  const usdtBalance = await BinanceHandler.getCoinBalance(
    binanceClient,
    'USDT',
    true,
    1,
  );
  const coinPriceInUsdt = await BinanceHandler.getCoinPrice(
    'BTC',
    'USDT',
    binanceClient,
  );

  const potentialQuantity = await BinanceHandler.caclulatePotentialQuantity(
    usdtBalance,
    coinPriceInUsdt,
    0.8,
    true,
  );
  console.log('TCL: potentialQuantity', potentialQuantity);
  expect(potentialQuantity).not.toBeUndefined();
});

test('Get BTC/PAX Price', async () => {
  const btcPrice = await BinanceHandler.getCoinPrice('BTC', 'PAX', binanceClient);
  console.log('PAX btcPrice ===========>', btcPrice);
  expect(btcPrice).not.toBeLessThan(0.1);
});

test('Get BTC/USDT Price', async () => {
  const btcPrice = await BinanceHandler.getCoinPrice('BTC', 'USDT', binanceClient);
  console.log('USDT btcPrice ===========>', btcPrice);
  expect(btcPrice).not.toBeLessThan(0.1);
});

test('Get USDT Balane', async () => {
  const balance = await BinanceHandler.getBalancePromise('USDT', binanceClient);
  console.log('balance', balance);
  expect(balance).not.toBeUndefined();
});
