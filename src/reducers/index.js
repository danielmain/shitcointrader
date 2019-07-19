import _ from 'lodash';

const reducers = (state = {}, action) => {
  switch (action.type) {
  case 'STORE_APIKEY':
    console.log('reducers=> STORE_APIKEY', action);
    return {
      ...state,
      keys: _.get(action, 'payload', {}),
    };
  // case '@@IPC':
    // console.log('reducers=> IPC', action);
    // return state;
  case 'GET_APIKEY':
    console.log('reducers=> GET_APIKEY', action);
    return {
      ...state,
      keys: _.get(action, 'payload'),
    };
  case 'SET_STATUS':
    console.log('reducers=> SET_STATUS', action);
    return {
      ...state,
      status: _.get(action, 'payload', {}),
    };
  case 'GET_BALANCE':
    console.log('reducers=> GET_BALANCE', action);
    return {
      ...state,
      balance: _.get(action, 'payload', {}),
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
