//@flow
import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  createStore,
  applyMiddleware
} from 'redux';
import createIpc from 'redux-electron-ipc';
import reducers from './reducers';
import {
  storeApiKey,
  getApiKey,
} from './actions';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import Routes from './components/routes';
import * as serviceWorker from './serviceWorker';

const ipc = createIpc({
  'storeApiKey': storeApiKey,
  'getApiKey': getApiKey,
});

const store = createStore(reducers, applyMiddleware(ipc));

const root = document.getElementById('Main')
if (root !== null) {
  const render = () => {
    ReactDOM.render(
      <Provider store={store}>
        <Routes />
      </Provider>, root);
  }
  render();
}

serviceWorker.unregister();