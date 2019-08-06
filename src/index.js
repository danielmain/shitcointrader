// @flow
import _ from 'lodash';
import { coinList } from './statics/coins';
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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Application State --------------------------------- //
const status = {
  code: 0,
  msg: '',
};

const setStatus = (statusObject) => {
  status.code = statusObject.code;
  status.msg = statusObject.msg;
  mainWindow.webContents.send(
    'updateStatus',
    new Date(),
  );
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      allowEval: false,
      nodeIntegration: true,
    },
  });

  // BrowserWindow.addDevToolsExtension(
  // '/Users/daniel/Library/Application
  // Support/BraveSoftware/Brave-Browser-Dev/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd
  // /2.17.0_0',
  // );

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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

const extractBinanceErrorObject = (error, code = false) => {
  const errorBody = JSON.parse(error.body);
  const errorObjectCode = code || (_.get(errorBody, 'code', false));
  const errorObjectMessage = (_.get(errorBody, 'msg', false) || _.get(errorBody, 'syscall', false) || JSON.stringify(errorBody));
  const errorObject = (errorObjectCode)
    ? { error: errorObjectCode, msg: errorObjectMessage }
    : { error: 500, msg: JSON.stringify(errorBody) };
  return errorObject;
};

process.on('uncaughtException', (error) => {
  setStatus(extractBinanceErrorObject(error));
});

const storeKeysInDb = async (apiKey: string, apiSecret: string) => {
  try {
    await DatabaseHandler.cleanSetup(app);
  } catch (error) {
    console.error(error);
  }
  const setupCollection = await DatabaseHandler.getSetupCollection(app);
  try {
    return await setupCollection.insert({
      apiKey,
      apiSecret,
    });
  } catch (error) {
    console.error(error);
  }
  return false;
};

const storeTrade = async (transaction) => {
  const tradingCollection = await DatabaseHandler.getTradingCollection(app);
  try {
    return await tradingCollection.insert(transaction);
  } catch (error) {
    console.error(error);
  }
  return null;
};

const getKeysFromDb = async () => {
  try {
    const setupCollection = await DatabaseHandler.getSetupCollection(app);
    return await setupCollection.find({});
  } catch (error) {
    console.error(error);
  }
  return null;
};

const getTradesFromDb = async () => {
  try {
    const tradingCollection = await DatabaseHandler.getTradingCollection(app);
    return await tradingCollection.find({});
  } catch (error) {
    console.error(error);
  }
  return [];
};

const getBinanceClient = async () => {
  const key = await getKeysFromDb();
  if (key) {
    const apiKey = _.get(key, '[0].apiKey');
    const apiSecret = _.get(key, '[0].apiSecret');
    return BinanceHandler.getBinanceClient(
      apiKey,
      apiSecret,
    );
  }
  setStatus({ code: 500, msg: 'No key stored, please set the keys agian' });
  return null;
};

const extractBtcFromCoinSymbol = symbol => symbol.replace(/BTC/g, '');

ipcMain.on('getStatus', async (event, status) => {
  console.log('TCL: status', status);
  ipcReduxSend('getStatus', status);
});

type ApiKey = { apiKey: string, apiSecret: string };

const isApiKeyValid = async (key:ApiKey): Promise<boolean> => {
  const isKeyValid = value => (!_.isEmpty(value) && value.length === 64);
  const apiKey = _.get(key, 'apiKey', API_KEY);
  const apiSecret = _.get(key, 'apiSecret', API_SECRET);

  if (isKeyValid(apiKey) && isKeyValid(apiSecret)) {
    try {
      const credentialsStatus = await BinanceHandler.checkCredentials(apiKey, apiSecret);
      return (_.get(credentialsStatus, 'code', false) === 200);
    } catch (error) {
      console.error(error);
      setStatus(extractBinanceErrorObject(error));
    }
  }
  return false;
};

ipcMain.on('storeApiKey', async (event, key: ApiKey) => {
  if (await isApiKeyValid(key)) {
    const result = await storeKeysInDb(key.apiKey, key.apiSecret);
    if (!result) {
      setStatus({ code: 500, msg: 'Cannot store keys in db' });
    } else {
      setStatus({ code: 201, msg: 'New Keys stored and validated' });
    }
  }
});

ipcMain.on('getApiKey', async () => {
  try {
    const key:any = await getKeysFromDb();
    if (key && _.get(key, '[0].apiKey', false)) {
      if (await isApiKeyValid(key)) {
        setStatus({ code: 202, msg: 'Getting key ok' });
        ipcReduxSend('getApiKey', _.get(key, '[0]'));
      }
    } else {
      setStatus({ code: 404, msg: 'No Api Keys stored' });
      ipcReduxSend('getApiKey', { apiKey: '', apiSecret: '' });
    }
  } catch (error) {
    setStatus(extractBinanceErrorObject(error));
  }
});

ipcMain.on('getBalance', async (event, coin) => {
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
      console.error(error);
      setStatus(extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('buyCoin', async (event, { coin, amount, stopLoss }) => {
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
      console.error(error);
      setStatus(extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('getTrades', async () => {
  try {
    const tradesFromDb = await getTradesFromDb();
    const binanceClient = await getBinanceClient();
    const tradesFromBinance = await BinanceHandler.getOpenOrders(binanceClient);
    const trades = _.unionBy(tradesFromDb, tradesFromBinance, 'orderId');
    const validatedTrades = await Promise.all(_.map(trades, async trade => ({
      ...trade,
      coin: extractBtcFromCoinSymbol(trade.symbol),
    })));
    ipcReduxSend('getTrades', validatedTrades);
  } catch (error) {
    setStatus(extractBinanceErrorObject(error));
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
  try {
    ipcReduxSend('getBalances', await getEnrichedBalances());
  } catch (error) {
    setStatus(extractBinanceErrorObject(error));
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
