// @flow

import _ from 'lodash';
import Binance from 'node-binance-api';
import dateTime from 'node-datetime';
import cj from 'color-json';

const getTime = () => {
  const dt = dateTime.create();
  return dt.format('Y-m-d H:M:S');
};

const getBalancePromise = (
  code: string,
  binanceClient: any,
) => new Promise((resolve, reject) => binanceClient.balance((error, balances) => {
  if (error) {
    console.log('Error getting Balance');
    reject(error);
  }
  const balance = _.get(
    balances,
    `${code.toUpperCase()}.available`,
    false,
  );
  if (!balance) {
    reject(new Error(`Cannot get balance for ${code}`));
  } else {
    resolve(balance);
  }
}));

const getCoinBalance = async (
  binanceClient: any,
  code: string,
  round: boolean,
  precision: number,
) => {
  const balances = await getBalancePromise(
    code.toUpperCase(),
    binanceClient,
  );
  const balanceExactNumber = _.toNumber(balances);
  console.log('TCL: balanceExactNumber', balanceExactNumber);
  if (round) {
    return _.floor(balanceExactNumber, precision);
  }
  return balanceExactNumber;
};

const checkCredentials = async (APIKEY: string, APISECRET: string) => {
  console.log(`Checking credentials ....APIKEY: ${APIKEY} | APISECRET: ${APISECRET}`);
  const binance = require('node-binance-api')().options({
    APIKEY,
    APISECRET,
    useServerTime: true,
  });

  try {
    const balance = await getBalancePromise('BTC', binance);
    console.log('TCL: checkCredentials -> balance', balance);
    return _.isEmpty(balance)
      ? { code: 500, msg: 'Error getting balance' }
      : { code: 200, msg: 'Credentials ok' };
  } catch (error) {
    const errorObject = JSON.parse(_.get(error, 'body', {}));
    return errorObject;
  }
};

const getCoinPricePromise = (
  binanceClient: any,
  code: string,
): Promise<number> => new Promise((resolve, reject) => binanceClient.prices(`${code}USDT`, (error, ticker) => {
  if (error) {
    reject(new Error(`Error getting ticker for coin ${code}:${error}`));
  }
  const priceStr = _.get(ticker, `${code}USDT`, false);
  if (!priceStr) {
    reject(new Error(`${code}USDT not found, ${JSON.stringify(ticker)}`));
  }
  const price = _.toNumber(priceStr);
  if (!price || price === 0) {
    reject(new Error(`${code}USDT is not valid ==> ${price}`));
  } else {
    resolve(_.toNumber(priceStr));
  }
}));

const getCoinPrice = async (
  code: string,
  pair: string,
  binanceClient: any,
): Promise<number> => {
  console.log('trying to get price of ', code);
  return getCoinPricePromise(binanceClient, code.toUpperCase());
};

const calculateCoinQuantity = (usdtBalance, priceInUsdt) => usdtBalance / priceInUsdt;

const marketBuy = (
  binanceClient,
  code,
  round,
  percentage,
  stopLossPrice: number,
  coinPotentialQuantity,
  buyer,
  messageHandler,
) => new Promise((resolve, reject) => {
  binanceClient.marketBuy(
    `${code.toUpperCase()}USDT`,
    coinPotentialQuantity,
    {
      type: 'MARKET',
    },
    (error, response) => {
      if (error) {
        const errorBody = cj(_.get(error, 'body', error));
        console.log(
          `${getTime()} - Error on marketBuy, buying ${coinPotentialQuantity} ${code}`,
          errorBody,
        );
        const errorObject = {
          _id: new Date().getTime(),
          code: 5,
          errorObject: error.body,
          when: getTime(),
        };
        messageHandler.storeErrorIndDb({
          ...errorObject,
          code,
        });
        reject(error);
      } else {
        console.log(
          `${getTime()} ${buyer} compró ${coinPotentialQuantity} ${code}`,
        );
        messageHandler.storeOperationIndDb({
          _id: new Date().getTime(),
          type: 'buy',
          code,
          buyer,
          potentialBuy: coinPotentialQuantity,
          stopLossPrice,
          response,
        },
        code);
        resolve(response);
      }
    },
  );
});

const caclulatePotentialQuantity = (
  usdtBalance: number,
  coinPriceInUsdt: number,
  percentage: number,
  round: boolean,
  precision: number,
) => {
  const possibleQuantity = calculateCoinQuantity(usdtBalance, coinPriceInUsdt);
  const potentialQuantity = _.toNumber(possibleQuantity) * percentage;
  console.log(
    `potentialQuantity = ${potentialQuantity} | percentage = ${percentage}`,
  );
  const potentialQuantityResult = round
    ? _.floor(potentialQuantity, precision)
    : potentialQuantity;
  return potentialQuantityResult;
};

const getStopLossPrice = (
  percentageLoss: number,
  price: number,
) => {
  const exactStopLoss = _.floor(price, 3) - ((_.floor(price, 3) * percentageLoss) / 100);
  return _.floor(exactStopLoss, 2);
};

const buyCoin = async (
  binanceClient,
  code,
  round,
  percentage,
  precision,
  buyer,
  messageHandler,
) => {
  const usdtBalance = await getCoinBalance(
    binanceClient,
    'USDT',
    true,
    1,
  );
  const coinPriceInUsdt = await getCoinPrice(
    code,
    'USDT',
    binanceClient,
  );
  const stopLossPrice = getStopLossPrice(2, coinPriceInUsdt);
  console.log('TCL: stopLossPrice', stopLossPrice);
  const coinPotentialQuantity = caclulatePotentialQuantity(
    usdtBalance,
    coinPriceInUsdt,
    percentage,
    round,
    precision,
  );
  if (
    usdtBalance
      && usdtBalance > 50
      && coinPriceInUsdt
      && coinPotentialQuantity
  ) {
    const buyReport = await marketBuy(
      binanceClient,
      code,
      round,
      percentage,
      stopLossPrice,
      coinPotentialQuantity,
      buyer,
      messageHandler,
    );
    return buyReport;
  }
  return false;
};

const marketSell = (
  binanceClient,
  code,
  coinBalance,
  seller,
  messageHandler,
) => new Promise<any>((resolve, reject) => {
  console.log(
    `Preparing to sell: ${code.toUpperCase()}USDT from balance: ${coinBalance}`,
  );
  binanceClient.marketSell(
    `${code.toUpperCase()}USDT`,
    coinBalance,
    {
      type: 'MARKET',

    },
    (error, response) => {
      if (error) {
        console.log('Error on Marketsell', cj(_.get(error, 'body', error)));
        const errorObject = {
          _id: new Date().getTime(),
          code: 4,
          errorObject: error.body,
          when: getTime(),
        };
        messageHandler.storeErrorIndDb({
          ...errorObject,
          code,
        });
        reject(errorObject);
      } else {
        // console.log(`marketSell response ${JSON.stringify(response)}`);
        console.log(
          `${getTime()} ${seller} vendió ${coinBalance} ${code}`,
        );
        messageHandler.storeOperationIndDb({
          _id: new Date().getTime(),
          type: 'sell',
          code,
          seller,
          potentialSell: coinBalance,
          response,
        });
        resolve(response);
      }
    },
  );
});

const sellCoin = async (
  binanceClient: Binance,
  code: string,
  round: boolean,
  precision: number,
  seller: string,
  messageHandler: any,
) => {
  const coinBalance = await getCoinBalance(
    binanceClient,
    code,
    round,
    precision,
  );
  console.log('​coinBalance', coinBalance);
  if (coinBalance && coinBalance > 0.001) {
    const sellReport = await marketSell(
      binanceClient,
      code,
      coinBalance,
      seller,
      messageHandler,
    );
    return sellReport;
  }
  console.log('Nada que vender', code);
  return false;
};

const BinanceHandler = {
  getCoinPrice,
  getCoinBalance,
  getBalancePromise,
  caclulatePotentialQuantity,
  getStopLossPrice,
  checkCredentials,
};

export default BinanceHandler;
