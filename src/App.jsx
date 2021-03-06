// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createIpc from 'redux-electron-ipc';
import {
  createStore,
  applyMiddleware,
} from 'redux';
import Routes from './components/routes';
import reducers from './reducers';
import * as serviceWorker from './serviceWorker';
import {
  storeApiKey,
  getApiKey,
  getBalance,
  getBalances,
  getTrades,
  updateStatus,
  buyCoin,
  sellCoin,
} from './actions';

const ipc = createIpc({
  storeApiKey,
  getApiKey,
  getTrades,
  getBalance,
  getBalances,
  updateStatus,
  buyCoin,
  sellCoin,
});

const store = createStore(reducers, applyMiddleware(ipc));

const root = document.getElementById('Main');
if (root !== null) {
  const render = () => {
    ReactDOM.render(
      <Provider store={store}>
        <Routes />
      </Provider>, root,
    );
  };
  render();
}

serviceWorker.unregister();
