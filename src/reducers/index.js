import _ from 'lodash';

const reducers = (state = {}, action) => {
  switch (action.type) {
  case 'STORE_APIKEY':
    return { 
      ...state, 
      keys: _.get(action, 'keys[0]', {})
    };
  case '@@IPC':
    console.log(' ############## getApiKey', state.apiKey);
    return state;
  case 'GET_APIKEY':
    return { 
      ...state, 
      keys: _.get(action, 'payload', 'bla bla')
    };
  default:
  	return state;
  };
}
export default reducers;
