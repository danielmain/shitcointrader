import _ from 'lodash';

const reducers = (state = {}, action) => {
  switch (action.type) {
  case 'STORE_APIKEY':
    console.log('reducers=> STORE_APIKEY', action);
    return {
      ...state,
      key: _.get(action, 'payload', {}),
    };
  // case '@@IPC':
    // console.log('reducers=> IPC', action);
    // return state;
  case 'GET_APIKEY':
    console.log('reducers=> GET_APIKEY', _.get(action, 'payload'));
    return {
      ...state,
      api: _.get(action, 'payload'),
    };
  case 'UPDATE_STATUS':
    console.log('reducers=> UPDATE_STATUS', _.get(action, 'payload'));
    return {
      ...state,
      status: _.get(action, 'payload'),
    };
  case 'GET_BALANCE':
    console.log('reducers=> GET_BALANCE', action);
    return {
      ...state,
      balance: _.get(action, 'payload', {}),
    };
  case 'GET_BALANCES':
    console.log('reducers=> GET_BALANCES', action);
    return {
      ...state,
      balances: _.get(action, 'payload', {}),
    };
  case 'GET_TRADES':
    console.log('reducers=> GET_TRADES', action);
    return {
      ...state,
      trades: _.get(action, 'payload', {}),
    };
  case 'BUY_COIN':
    console.log('reducers=> BUY_COIN', action);
    return {
      ...state,
      orderId: _.get(action, 'payload', {}),
    };
  default:
    return state;
  }
};
export default reducers;
