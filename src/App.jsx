//@flow
import React from 'react';
import { Provider } from 'react-redux';
import createIpc from 'redux-electron-ipc';
import {
  createStore,
  applyMiddleware
} from 'redux';
import Routes from './components/routes';
import reducers from './reducers';
import {
  storeApiKey,
  getApiKey,
  setStatus,
} from './actions';

const ipc = createIpc({
  'storeApiKey': storeApiKey,
  'getApiKey': getApiKey,
  'setStatus': setStatus,
});
const store = createStore(reducers, applyMiddleware(ipc));

const App = ( props ) => {
  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  );
};

export default App;