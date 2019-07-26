// @flow
import _ from 'lodash';

// Binance stuff ------------------------------------ //
import BinanceHandler from './api/binanceHandler';

// Database stuff ------------------------------------ //
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

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
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
  mainWindow.webContents.send(
    'setStatus',
    extractBinanceErrorObject(error),
  );
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
  return false;
};

const getKeysFromDb = async () => {
  try {
    const setupCollection = await DatabaseHandler.getSetupCollection(app);
    return await setupCollection.find({});
  } catch (error) {
    console.error(error);
  }
  return false;
};

const getTradesFromDb = async () => {
  try {
    const tradingCollection = await DatabaseHandler.getTradingCollection(app);
    return await tradingCollection.find({});
  } catch (error) {
    console.error(error);
  }
  return false;
};

const getBinanceClient = async () => {
  const keys = await getKeysFromDb();
  if (keys) {
    const apiKey = _.get(keys, '[0].apiKey');
    const apiSecret = _.get(keys, '[0].apiSecret');
    return BinanceHandler.getBinanceClient(
      apiKey,
      apiSecret,
    );
  }
  ipcReduxSend('setStatus', { code: 500, msg: 'No keys stored, please set the keys agian' });
  return null;
};

ipcMain.on('storeApiKey', async (event, keys) => {
  const isKeyValid = value => (!_.isEmpty(value) && value.length === 64);
  const apiKey = _.get(keys, 'apiKey', API_KEY);
  const apiSecret = _.get(keys, 'apiSecret', API_SECRET);

  if (isKeyValid(apiKey) && isKeyValid(apiSecret)) {
    try {
      const credentialsStatus = await BinanceHandler.checkCredentials(apiKey, apiSecret);
      if (_.get(credentialsStatus, 'code', false) === 200) {
        const result = await storeKeysInDb(apiKey, apiSecret);
        if (!result) {
          ipcReduxSend('setStatus', { code: 500, msg: 'Cannot store keys in db' });
        } else {
          setTimeout(() => ipcReduxSend('setStatus', { code: 201, msg: 'New Keys stored and validated' }), 2000);
        }
      } else {
        ipcReduxSend('setStatus', credentialsStatus);
      }
    } catch (error) {
      console.error(error);
      ipcReduxSend('setStatus', extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('getApiKey', async () => {
  try {
    const keys = await getKeysFromDb();
    if (_.get(keys, '[0].apiKey', false)) {
      ipcReduxSend('setStatus', { code: 202, msg: 'Getting keys ok' });
      ipcReduxSend('getApiKey', _.get(keys, '[0]'));
    } else {
      ipcReduxSend('setStatus', { code: 404, msg: 'No Api Keys stored' });
    }
  } catch (error) {
    ipcReduxSend('setStatus', extractBinanceErrorObject(error));
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
      ipcReduxSend('setStatus', extractBinanceErrorObject(error));
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
        console.log('TCL: report', report);

        const orderId = _.get(report, 'orderId', false);
        if (orderId) {
          const stopLossPrice = BinanceHandler.getStopLossPrice(stopLoss, _.get(report, 'coinPrice', false));
          const tradeObject = {
            ...report,
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
      ipcReduxSend('setStatus', extractBinanceErrorObject(error));
    }
  }
});

ipcMain.on('getTrades', async () => {
  try {
    const trades = await getTradesFromDb();
    console.log('TCL: trades');
    if (!_.isEmpty(trades)) {
      // console.dir(trades);
      //   ipcReduxSend('setStatus', { code: 202, msg: 'Getting trades ok' });
      ipcReduxSend('getTrades', trades);
    // } else {
    //   ipcReduxSend('setStatus', { code: 404, msg: 'No Api Keys stored' });
    }
  } catch (error) {
    ipcReduxSend('setStatus', extractBinanceErrorObject(error));
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
