const Datastore = require('nedb-promises');

const getDb = (electronApp, fileName) => Datastore.create({
  filename: `${process.env.NODE_ENV === 'dev' ? '.' : electronApp.getAppPath('userData')}/data/${fileName}`, 
  timestampData: true,
  autoload: true
});

const DatabaseHandler = {
  getSetupCollection: (electronApp): any => {
  	const setupCollection = getDb(electronApp, 'setup.db');
  	setupCollection.ensureIndex({ fieldName: 'apiKey', unique: true }, function (err) {
  		console.error(err);
    });
    return setupCollection;
  },
  getTradingCollection: (electronApp): any => getDb(electronApp, 'trading.db')
};

export default DatabaseHandler;
