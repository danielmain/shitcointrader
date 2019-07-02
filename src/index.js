// @flow
const electron = require('electron');

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

const database = require('./database');

const RxDB = require('rxdb');
RxDB.plugin(require('rxdb/plugins/server'));
RxDB.plugin(require('pouchdb-adapter-memory'));

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
    width: 800,
    height: 600,
  });

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
  const dbSuffix = new Date().getTime(); // we add a random timestamp in dev-mode to reset the database on each start

  const db = await database.getDatabase(
    'trading' + dbSuffix,
    'memory'
  );

  /**
   * spawn a server
   * which is used as sync-goal by page.js
   */
  console.log('start server');
  db.server({
    path: '/db',
    port: 10102,
    cors: true
  });
  console.log('started server');

  // // show setup table in console
  // db.setup.findOne().$.subscribe(setupDocs => {
  //   console.log('### got setup(' + setupDocs.length + '):');
  //   setupDocs.forEach(doc => console.log(doc.apiKey));
  // });

  // // show trading table in console
  // db.trading.find('name').$.subscribe(tradingDocs => {
  //   console.log('### got trading(' + tradingDocs.length + '):');
  //   tradingDocs.forEach(doc => console.log(
  //     doc.timestamp + '  |  ' + doc.coin
  //   ));
  // });

  createWindow();
});

// pong event with arguments back to caller
ipcMain.on('increment', (event, ...args) => {
  // console.log('Event', event);
  console.log('Args', ...args);
  event.sender.send('pong', ...args);
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