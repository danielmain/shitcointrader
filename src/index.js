// @flow
import _ from 'lodash';
import cj from 'color-json';
import type { ApiKey } from './api/binance.js.flow';
import { coinList } from './statics/coins';
import Logger from './api/logger';

// Binance stuff ------------------------------------ //
import BinanceHandler from './api/binanceHandler';
// Database stuff ----------------------------------- //
import DatabaseHandler from './api/databaseHandler';

const API_KEY = _.get(process, 'env.API_KEY', null);
const API_SECRET = _.get(
  process,
  'env.API_SECRET',
  null,
);

// Elextron stuff ------------------------------------ //
const electron = require('electron');

const { app } = electron;
const { ipcMain } = electron;
const { BrowserWindow } = electron;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let dev = false;

if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Application State --------------------------------- //
type StatusObject = { code: number, msg: string };
const status:Array<StatusObject> = [];

const updateStatus = (statusValue: StatusObject): void => {
  Logger.debug(`updateStatus - statusValue:${cj(statusValue)}`);
  const { code, msg } = statusValue;
  status.push({ code, msg });
  mainWindow.webContents.send(
    'updateStatus',
    status,
  );
};

const createWindow = () => {
  Logger.debug('Create the browser window');
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      allowEval: false,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools automatically if developing
  if (dev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow();
});

const ipcReduxSend = (action, payload) => {
  mainWindow.webContents.send(action, payload);
};

const extractBinanceErrorObject = (error, code = false):StatusObject => {
  const errorBody = JSON.parse(error.body);
  const errorObjectCode:number = code || _.get(errorBody, 'code');
  const errorObjectMessage:string = (_.get(errorBody, 'msg', false) || _.get(errorBody, 'syscall', false) || cj(errorBody));
  if (errorObjectCode) { return { code: errorObjectCode, msg: errorObjectMessage }; }
  return { code: 500, msg: cj(errorBody) };
};

process.on('uncaughtException', (error) => {
  Logger.debug('uncaughtException');
  updateStatus(extractBinanceErrorObject(error));
});

const storeKeysInDb = async (apiKey: string, apiSecret: string) => {
  try {
    await DatabaseHandler.cleanSetup(app);
  } catch (error) {
    Logger.error(error);
  }
  const setupCollection = await DatabaseHandler.getSetupCollection(app);
  try {
    return await setupCollection.insert({
      apiKey,
      apiSecret,
    });
  } catch (error) {
    Logger.error(error);
  }
  return false;
};

const storeTrade = async (transaction) => {
  const tradingCollection = await DatabaseHandler.getTradingCollection(app);
  try {
    return await tradingCollection.insert(transaction);
  } catch (error) {
    Logger.error(error);
  }
  return null;
};

const getKeysFromDb = async (): Promise<any> => {
  Logger.debug('getKeysFromDb');
  const setupCollection = await DatabaseHandler.getSetupCollection(app);
  return setupCollection.find({});
};

const getTradesFromDb = async () => {
  Logger.debug('getTradesFromDb');
  const tradingCollection = await DatabaseHandler.getTradingCollection(app);
  return tradingCollection.find({});
};

const getBinanceClient = async () => {
  Logger.debug('getBinanceClient');
  const key = await getKeysFromDb();
  Logger.debug(`getBinanceClient - ${cj(key)}`);
  if (key) {
    const apiKey = _.get(key, '[0].apiKey');
    const apiSecret = _.get(key, '[0].apiSecret');
    return BinanceHandler.getBinanceClient(
      apiKey,
      apiSecret,
    );
  }
  updateStatus({ code: 500, msg: 'No key stored, please set the keys agian' });
  return null;
};

const extractBtcFromCoinSymbol = (symbol) => symbol.replace(/BTC/g, '');

ipcMain.on('updateStatus', async () => {
  Logger.info('index (REDUX) -> updateStatus');
  ipcReduxSend('updateStatus', status);
});

const isApiKeyValid = async (key:ApiKey): Promise<boolean> => {
  const isKeyValid = (value) => (!_.isEmpty(value) && value.length === 64);
  const apiKey = _.get(key, 'apiKey', API_KEY);
  const apiSecret = _.get(key, 'apiSecret', API_SECRET);

  if (isKeyValid(apiKey) && isKeyValid(apiSecret)) {
    try {
      const credentialsStatus = await BinanceHandler.checkCredentials(apiKey, apiSecret);
      return (_.get(credentialsStatus, 'code', false) === 200);
    } catch (error) {
      Logger.error('uncaughtException', { argument: error });
      updateStatus(extractBinanceErrorObject(error));
    }
  }
  return false;
};

ipcMain.on('storeApiKey', async (event, key: ApiKey) => {
  Logger.info('index (REDUX) -> storeApiKey');
  if (await isApiKeyValid(key)) {
    const result = await storeKeysInDb(key.apiKey, key.apiSecret);
    if (!result) {
      updateStatus({ code: 500, msg: 'Cannot store keys in db' });
    } else {
      updateStatus({ code: 201, msg: 'New Keys stored and validated' });
    }
  }
});

ipcMain.on('getApiKey', async () => {
  Logger.info('index (REDUX) -> getApiKey');
  getKeysFromDb().catch((error) => {
    updateStatus(extractBinanceErrorObject(error));
  }).then((key) => {
    const apiKey = _.get(key, '[0].apiKey', false);
    if (apiKey) {
      Logger.debug(`getApiKey-> ${cj(key)}`);
      isApiKeyValid(apiKey).then((valid) => {
        if (valid) {
          updateStatus({ code: 202, msg: 'Getting key ok' });
          ipcReduxSend('getApiKey', _.get(key, '[0]'));
        } else {
          updateStatus({ code: 406, msg: 'Api Key not valid' });
          ipcReduxSend('getApiKey', { apiKey: '', apiSecret: '' });
        }
      });
    } else {
      updateStatus({ code: 404, msg: 'No Api Keys stored' });
      ipcReduxSend('getApiKey', { apiKey: '', apiSecret: '' });
    }
  });
});

ipcMain.on('getBalance', async (event, coin) => {
  Logger.info('index (REDUX) -> getBalance');
  if (!_.isEmpty(coin)) {
    try {
      const binanceClient = await getBinanceClient();
      if (binanceClient) {
        const balance = await BinanceHandler.getCoinBalance(
          binanceClient,
          coin,
          true,
          5,
        );
        ipcReduxSend('getBalance', balance);
      }
    } catch (error) {
      //     Logger.error('uncaughtException', {       argument: error,     });;
      updateStatus(extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('buyCoin', async (event, { coin, amount, stopLoss }) => {
  Logger.info('index (REDUX) -> buyCoin');
  if (!_.isEmpty(coin) && !_.isEmpty(coin)) {
    try {
      const binanceClient = await getBinanceClient();
      if (binanceClient) {
        const report = await BinanceHandler.buyCoin(
          binanceClient,
          coin,
          true,
          amount,
          0,
        );

        const orderId = _.get(report, 'orderId', false);
        if (orderId) {
          const stopLossPrice = BinanceHandler.getStopLossPrice(stopLoss, _.get(report, 'coinPrice', false));
          const tradeObject = {
            coin,
            stopLoss,
            stopLossPrice,
          };
          storeTrade(tradeObject);
          ipcReduxSend('buyCoin', report);
        } else {
          console.dir(report);
        }
      }
    } catch (error) {
      //     Logger.error('uncaughtException', {       argument: error,     });;
      updateStatus(extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('getTrades', async () => {
  Logger.info('index (REDUX) -> getTrades');
  try {
    const tradesFromDb = await getTradesFromDb();
    const binanceClient = await getBinanceClient();
    const tradesFromBinance = await BinanceHandler.getOpenOrders(binanceClient);
    const trades = _.unionBy(tradesFromDb, tradesFromBinance, 'orderId');
    const validatedTrades = await Promise.all(_.map(trades, async (trade) => ({
      ...trade,
      coin: extractBtcFromCoinSymbol(trade.symbol),
    })));
    ipcReduxSend('getTrades', validatedTrades);
  } catch (error) {
    updateStatus(extractBinanceErrorObject(error));
  }
});

const getEnrichedBalances = async () => {
  const binanceClient = await getBinanceClient();
  // const tradesFromDb = await getTradesFromDb();

  const balances = await BinanceHandler.getCoinsBalance(
    coinList,
    binanceClient,
  );
  return Promise.all(_.map(balances, async (balance) => {
    const priceinBtc = await BinanceHandler.getCoinPriceCalculatedFromAmount(
      binanceClient,
      'BTC',
      balance.code,
      balance.balance,
      6,
    );
    const priceInUsd = await BinanceHandler.getCoinPriceCalculatedFromAmount(
      binanceClient,
      'USDT',
      'BTC',
      priceinBtc,
      1,
    );

    const returnValue = {
      ...balance,
      priceinBtc,
      priceInUsd,
      stopLoss: 0.2,
      stopLossPrice: 0,
      low: (priceInUsd < 1),
    };
    return returnValue;
    // return _.unionBy(tradesFromDb, returnValue, 'code');
  }));
};

ipcMain.on('getBalances', async () => {
  Logger.info('index (REDUX) -> getBalances');
  try {
    ipcReduxSend('getBalances', await getEnrichedBalances());
  } catch (error) {
    updateStatus(extractBinanceErrorObject(error));
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
