// @flow
import _ from 'lodash';

// Binance stuff ------------------------------------ //
import BinanceHandler from './api/binanceHandler.js';

// Database stuff ------------------------------------ //
import DatabaseHandler from './api/databaseHandler.js';

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

  BrowserWindow.addDevToolsExtension('/Users/daniel/Library/Application Support/BraveSoftware/Brave-Browser-Dev/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0');
  // BrowserWindow.addDevToolsExtension('/Users/daniel/Library/Application Support/BraveSoftware/Brave-Browser-Dev/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0');


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
  console.log('uncaughtException =====');
  console.dir(error.code);
  console.log('=====================');
  mainWindow.webContents.send(
    'setStatus',
    { error: _.get(error, 'errno', 500), msg: JSON.stringify(error) },
  );
});

const storeKeysInDb = async (apiKey: string, apiSecret: string) => {
  try {
    await DatabaseHandler.cleanSetup(app);
  } catch (error) {
    console.log('ERROR: ', error);
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

ipcMain.on('storeApiKey', async (event, keys) => {
  const isKeyValid = value => (!_.isEmpty(value) && value.length === 64);
  const apiKey = _.get(keys, 'apiKey', API_KEY);
  const apiSecret = _.get(keys, 'apiSecret', API_SECRET);

  if (isKeyValid(apiKey) && isKeyValid(apiSecret)) {
    const credentialsStatus = await BinanceHandler.checkCredentials(apiKey, apiSecret);
    if (_.get(credentialsStatus, 'code', false) === 200) {
      const result = await storeKeysInDb(apiKey, apiSecret);
      console.log('TCL: result', result);
      if (!result) {
        event.sender.send('setStatus', { code: 500, msg: 'Cannot store keys in db' });
      } else {
        setTimeout(() => event.sender.send('setStatus', { code: 201, msg: 'New Keys stored and validated' }), 3000);
      }
    } else {
      console.error('Credentials wrong');
      event.sender.send('setStatus', credentialsStatus);
    }
  }
});

let keys;
ipcMain.on('getApiKey', async (event) => {
  try {
    if (_.isEmpty(keys)) {
      const setupCollection = await DatabaseHandler.getSetupCollection(app);
      console.log('Querying database for keys');
      keys = await setupCollection.find({});
      console.log('TCL: keys', keys);
    }
  } catch (error) {
    console.log('TCL: error', error);
    event.sender.send('setStatus', { code: 500, msg: JSON.stringify(error) });
  }
  if (_.get(keys, '[0].apiKey', false)) {
    // console.log('TCL: calling storeApiKey', keys);
    event.sender.send('setStatus', { code: 202, msg: 'Getting keys ok' });
    event.sender.send('getApiKey', keys[0]);
  } else {
    console.log('TCL: keys', keys);
    event.sender.send('setStatus', { code: 404, msg: 'No Api Keys stored' });
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
