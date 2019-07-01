const RxDB = require('rxdb');
RxDB.plugin(require('pouchdb-adapter-http'));

const setupSchema = {
  title: 'setup schema',
  description: 'describes the setup schema for trading with binance',
  version: 0,
  type: 'object',
  properties: {
    'apiKey': {
      type: 'string',
      'encrypted': true,
    },
  }
};

const tradingSchema = {
  title: 'trading schema',
  description: 'describes trading schema',
  version: 0,
  type: 'object',
  properties: {
    'timestamp': {
      type: 'string',
    },
    'coin': {
      type: 'string'
    },
    'pair': {
      type: 'string'
    },
    'stopLoss': {
      type: 'number'
    },
    'pricePurchased': {
      type: 'number'
    },
    'status': {
      type: 'string'
    },
    'gain': {
      type: 'number',
    }
  },
};

let _getDatabase; // cached
function getDatabase(name, adapter) {
  if (!_getDatabase) _getDatabase = createDatabase(name, adapter);
  return _getDatabase;
}

async function createDatabase(name, adapter) {
  const db = await RxDB.create({
    name,
    adapter,
    password: 'Po*4V*xIDbWWrfXUaj!NXUVx!o^3VdH7t2g8&HI'
  });

  await db.collection({
    name: 'setup',
    schema: setupSchema
  });

  await db.collection({
    name: 'trading',
    schema: tradingSchema
  });

  return db;
}
module.exports = {
  getDatabase
};
