// @flow
import _ from 'lodash';

// Binance stuff ------------------------------------ //
import BinanceHandler from './api/binanceHandler.js';
const API_KEY = _.get(process, 'env.API_KEY', null);
const API_SECRET = _.get(
  process,
  'env.API_SECRET',
  null,
);

// Database stuff ------------------------------------ //
import DatabaseHandler from './api/databaseHandler.js';

// Elextron stuff ------------------------------------ //
const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;


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

  BrowserWindow.addDevToolsExtension('/Users/daniel/Library/Application Support/BraveSoftware/Brave-Browser-Dev/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0');
  BrowserWindow.addDevToolsExtension('/Users/daniel/Library/Application Support/BraveSoftware/Brave-Browser-Dev/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0');


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
app.on('ready', async function () {

  createWindow();
});

ipcMain.on('storeApiKey', async (event, ...args) => {
  console.dir(args);
  
  // const storeKeysInDb = (apiKey, apiSecret) => {
  //   const setupCollection = DatabaseHandler.getSetupCollection(app);
  //   try {
  //     await setupCollection.insert({
  //       apiKey,
  //       apiSecret
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const apiKey = _.get(args, '[0].API_KEY', API_KEY);
  // const apiSecret = _.get(args, '[0].API_SECRET', API_SECRET);
  // const credentialsOk = await BinanceHandler.checkCredentials(apiKey, apiSecret);
  // if (credentialsOk) {
  //   console.log('Credentials OK');
  //   storeKeysInDb(apiKey, apiSecret);
  // } else {
  //   console.log('Credentials wrong');
  // }

});

let keys = [];
ipcMain.on('getApiKey', async (event, ...args) => {
  if (_.isEmpty(keys)){
    const setupCollection = DatabaseHandler.getSetupCollection(app);
    try {
      keys = await setupCollection.find({})
      console.log('event.sender: ', event.sender);
      console.log('keys: ', keys);
    } catch (error) {
      console.error(error);
    }
  } 
  event.sender.send('storeApiKey', keys);
  
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const getBalancePromise = (
  code,
  binanceClient,
) => new Promise((resolve, reject) => binanceClient.balance((error, balances) => {
  console.log('TCL: balances', balances);
  if (error) {
    resolve(error);
  }
  const balance = _.get(
    balances,
    `${code.toUpperCase()}.available`,
    false,
  );
  
  if (_.isNumber(balance)) {
    resolve(false);
  } else {
    resolve(true);
  }
}));

const checkBinanceCredentials = async (APIKEY, APISECRET) => {
  const binance = require('node-binance-api')().options({
    APIKEY,
    APISECRET,
    useServerTime: true // If you get timestamp errors, synchronize to server time at startup
  });

  try {
    return await getBalancePromise('BTC', binance);
  } catch (error) {
    console.error(error);
    return false;
  } 
}
