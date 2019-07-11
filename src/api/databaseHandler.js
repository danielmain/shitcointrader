import fs from 'fs';

const Datastore = require('nedb-promises');

const fsPromises = fs.promises;

const getDb = (electronApp, fileName) => Datastore.create({
  filename: `${process.env.NODE_ENV === 'dev' ? '.' : electronApp.getAppPath('userData')}/data/${fileName}`,
  timestampData: true,
  autoload: true,
});

const removeDb = (electronApp, fileName): void => {
  const databaseFileName = `${process.env.NODE_ENV === 'dev' ? '.' : electronApp.getAppPath('userData')}/data/${fileName}`;
  return fsPromises.unlink(databaseFileName);
};


const DatabaseHandler = {
  getSetupCollection: async (electronApp): any => {
    try {
      const setupCollection = await getDb(electronApp, 'setup.db');
      setupCollection.ensureIndex({ fieldName: 'apiKey', unique: true }, (err) => {
        console.error(err);
      });
      return setupCollection;
    } catch (error) {
      console.error('ERROR ====>', error);
    }
  },
  cleanSetup: (electronApp): void => removeDb(electronApp, 'setup.db'),
  getTradingCollection: (electronApp): any => getDb(electronApp, 'trading.db'),
};

export default DatabaseHandler;
