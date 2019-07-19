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
let mainWindow: BrowserWindow;

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

process.on('uncaughtException', (error) => {
  console.log('TCL: error', error);
  mainWindow.webContents.send(
    'setStatus',
    { error: _.get(error, 'errno', 500), msg: JSON.stringify(error) },
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

const storeTrade = async (orderId: string, buyPrice: number, stopLossPrice: number, date: Date) => {
  const tradingCollection = await DatabaseHandler.getTradingCollection(app);
  try {
    return await tradingCollection.insert({
      orderId,
      buyPrice,
      stopLossPrice,
      date,
    });
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

const getBinanceClient = async (event) => {
  const keys = await getKeysFromDb();
  if (keys) {
    const apiKey = _.get(keys, '[0].apiKey');
    const apiSecret = _.get(keys, '[0].apiSecret');
    return BinanceHandler.getBinanceClient(
      apiKey,
      apiSecret,
    );
  }
  console.log('NO KEYS FOUND!!!!');
  event.sender.send(
    'setStatus',
    { code: 500, msg: 'No keys stored, please set the keys agian' },
  );
  return null;
};

ipcMain.on('storeApiKey', async (event, keys) => {
  const isKeyValid = value => (!_.isEmpty(value) && value.length === 64);
  const apiKey = _.get(keys, 'apiKey', API_KEY);
  const apiSecret = _.get(keys, 'apiSecret', API_SECRET);

  if (isKeyValid(apiKey) && isKeyValid(apiSecret)) {
    const credentialsStatus = await BinanceHandler.checkCredentials(apiKey, apiSecret);
    if (_.get(credentialsStatus, 'code', false) === 200) {
      const result = await storeKeysInDb(apiKey, apiSecret);
      if (!result) {
        event.sender.send('setStatus', { code: 500, msg: 'Cannot store keys in db' });
      } else {
        setTimeout(() => event.sender.send('setStatus', { code: 201, msg: 'New Keys stored and validated' }), 2000);
      }
    } else {
      event.sender.send('setStatus', credentialsStatus);
    }
  }
});

ipcMain.on('getApiKey', async (event) => {
  try {
    const keys = await getKeysFromDb();
    // console.log('TCL: keys', keys);
    if (_.get(keys, '[0].apiKey', false)) {
      event.sender.send('setStatus', { code: 202, msg: 'Getting keys ok' });
      event.sender.send('getApiKey', _.get(keys, '[0]'));
    } else {
      event.sender.send('setStatus', { code: 404, msg: 'No Api Keys stored' });
    }
  } catch (error) {
    console.log('TCL: error', error);
    event.sender.send('setStatus', { code: 500, msg: JSON.stringify(error) });
  }
});

ipcMain.on('getBalance', async (event, coin) => {
  if (!_.isEmpty(coin)) {
    try {
      const binanceClient = getBinanceClient();
      if (binanceClient) {
        const balance = await BinanceHandler.getCoinBalance(
          binanceClient,
          coin,
          true,
          5,
        );
        event.sender.send('getBalance', balance);
      }
    } catch (error) {
      console.log('TCL: error', error);
      event.sender.send('setStatus', { code: 500, msg: JSON.stringify(error) });
    }
  }
});

ipcMain.on('buyCoin', async (event, { coin, stopLoss }) => {
  if (!_.isEmpty(coin) && !_.isEmpty(coin)) {
    try {
      const binanceClient = getBinanceClient();
      if (binanceClient) {
        const report = await BinanceHandler.buyCoin(
          binanceClient,
          coin,
          true,
          100,
          5,
        );
        if (_.get(report, 'orderId', false)) {
          const coinPrice = await BinanceHandler.getCoinPrice(coin, 'BTC', binanceClient);
          const stopLossPrice = BinanceHandler.getStopLossPrice(stopLoss, coinPrice);
          storeTrade(report.orderId, coinPrice, stopLossPrice, new Date());
          event.sender.send('buyCoin', report);
        }
      }
    } catch (error) {
      console.log('TCL: error', error);
      event.sender.send('setStatus', { code: 500, msg: JSON.stringify(error) });
    }
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
