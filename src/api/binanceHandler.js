// @flow
import _ from 'lodash';
import Binance from 'node-binance-api';
import dateTime from 'node-datetime';
import cj from 'color-json';

const getTime = () => {
  const dt = dateTime.create();
  return dt.format('Y-m-d H:M:S');
};

const getCoinsBalance = (
  codes: [string],
  binanceClient: any,
): Promise<[any]> => new Promise((resolve, reject) => binanceClient.balance((
  error,
  balanceResponse,
) => {
  if (error) {
    console.error(error);
    reject(error);
  }
  const balances = _.map(codes, code => ({
    code,
    balance: _.get(
      balanceResponse,
      `${code}.available`,
      0,
    ),
  }));
  if (!_.isArray(balances)) {
    reject(new Error('Cannot get balances'));
  } else {
    resolve(balances);
  }
}));

const getCoinBalance = async (
  binanceClient: any,
  code: string,
  round: boolean,
  precision: number,
) => {
  const balances = await getCoinsBalance(
    [code],
    binanceClient,
  );
  const balanceExactNumber = _.toNumber(balances[0].balance);
  if (round) {
    return _.floor(balanceExactNumber, precision);
  }
  return balanceExactNumber;
};

const getBinanceClient = async (APIKEY: string, APISECRET: string) => {
  const binanceClient = new Binance();
  binanceClient.options({
    APIKEY,
    APISECRET,
    useServerTime: true,
  });
  return binanceClient;
};

const checkCredentials = async (APIKEY: string, APISECRET: string) => {
  const balance = await getCoinsBalance(['BTC'], await getBinanceClient(APIKEY, APISECRET));
  return _.isEmpty(balance)
    ? { code: 500, msg: 'Error getting balance' }
    : { code: 200, msg: 'Credentials ok' };
};

const getCoinPricePromise = (
  binanceClient: any,
  code: string,
  pair: string = 'BTC',
): Promise<number> => new Promise((resolve, reject) => binanceClient.prices(`${code}${pair}`, (error, ticker) => {
  console.log('TCL: code', code);
  if (error) {
    reject(new Error(`Error getting ticker for coin ${code}:${JSON.stringify(error)}`));
  }
  const priceStr = _.get(ticker, `${code}BTC`, false);
  if (!priceStr) {
    reject(new Error(`${code}BTC not found, ${JSON.stringify(ticker)}`));
  }
  const price = _.toNumber(priceStr);
  if (!price || price === 0) {
    reject(new Error(`${code}BTC is not valid ==> ${price}`));
  } else {
    resolve(_.toNumber(priceStr));
  }
}));

const getCoinPrice = async (
  binanceClient: any,
  code: string,
  pair: string,
): Promise<number> => getCoinPricePromise(binanceClient, code, pair);

const calculateCoinQuantity = (btcBalance, priceInBtc) => btcBalance / priceInBtc;

const marketBuy = (
  binanceClient,
  code,
  round,
  percentage,
  stopLossPrice: number,
  coinPotentialQuantity,
) => new Promise((resolve, reject) => {
  binanceClient.marketBuy(
    `${code.toUpperCase()}BTC`,
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
        reject(error);
      } else {
        console.log(
          `${getTime()} purchased ${coinPotentialQuantity} ${code}`,
        );
        resolve(response);
      }
    },
  );
});

const caclulatePotentialQuantity = (
  btcBalance: number,
  coinPriceInBtc: number,
  percentage: number,
  round: boolean,
  precision: number,
) => {
  const possibleQuantity = calculateCoinQuantity(btcBalance, coinPriceInBtc);
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
  const exactStopLoss = _.floor(price, 8) - ((_.floor(price, 8) * percentageLoss) / 100);
  return _.floor(exactStopLoss, 8);
};

const buyCoin = async (
  binanceClient,
  code,
  round,
  percentage,
  precision,
) => {
  const btcBalance = await getCoinBalance(
    binanceClient,
    'BTC',
    true,
    5,
  );
  console.log('TCL: btcBalance', btcBalance);
  const coinPriceInBtc = await getCoinPrice(
    binanceClient,
    code,
    'BTC',
  );
  console.log('TCL: coinPriceInBtc', coinPriceInBtc);
  const stopLossPrice = getStopLossPrice(percentage, coinPriceInBtc);
  console.log('TCL: stopLossPrice', stopLossPrice);
  const coinPotentialQuantity = caclulatePotentialQuantity(
    btcBalance,
    coinPriceInBtc,
    percentage,
    round,
    precision,
  );
  console.log('TCL: coinPotentialQuantity', coinPotentialQuantity);
  const buyReport = {
    btcBalance,
    coinPriceInBtc,
    coinPotentialQuantity,
  };
  if (
    btcBalance
      && btcBalance > 0
      && coinPriceInBtc
      && coinPotentialQuantity
  ) {
    const binanceBuyReport = await marketBuy(
      binanceClient,
      code,
      round,
      percentage,
      stopLossPrice,
      coinPotentialQuantity,
    );
    return {
      ...binanceBuyReport,
      ...buyReport,
    };
  }
  console.log('Returning false');
  return false;
};

const marketSell = (
  binanceClient,
  code,
  coinBalance,
) => new Promise<any>((resolve, reject) => {
  console.log(
    `Preparing to sell: ${code.toUpperCase()}BTC from balance: ${coinBalance}`,
  );
  binanceClient.marketSell(
    `${code.toUpperCase()}BTC`,
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
        reject(errorObject);
      } else {
        // console.log(`marketSell response ${JSON.stringify(response)}`);
        console.log(
          `${getTime()} sell ${coinBalance} ${code}`,
        );
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
    );
    return sellReport;
  }
  console.log('Nada que vender', code);
  return false;
};

const getOpenOrders = (
  binanceClient: Binance,
): Promise<any> => new Promise((resolve, reject) => {
  binanceClient.openOrders(false, (error, openOrders) => {
    if (error) reject(error);
    resolve(openOrders);
  });
});

const BinanceHandler = {
  getCoinPrice,
  getCoinBalance,
  getCoinsBalance,
  caclulatePotentialQuantity,
  getStopLossPrice,
  checkCredentials,
  getBinanceClient,
  getOpenOrders,
  buyCoin,
  sellCoin,
};

export default BinanceHandler;
