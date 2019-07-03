import _ from 'lodash';

const reducers = (state, action) => {
  switch (action.type) {
  case 'STORE_APIKEY':
    return { 
      ...state, 
      apiKey: _.get(action, 'key', '')
    }
  case 'GET_APIKEY':
  	console.log('getKeys');
    return { 
      ...state, 
      apiKey: _.get(action, 'key', '')
    }
  default:
    return state;
  }
}

export default reducers;
