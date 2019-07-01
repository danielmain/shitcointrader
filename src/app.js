// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  applyMiddleware
} from 'redux';
import createIpc from 'redux-electron-ipc';
import reducers from './reducers';
import {
  increment,
  decrement
} from './actions';
import Routes from '@components/routes';
import * as serviceWorker from './serviceWorker';

// register an action creator to an ipc channel (key/channel, value/action creator)
const ipc = createIpc({
  'increment': increment,
  'decrement': decrement,
});

const store = createStore(reducers, applyMiddleware(ipc));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const root = document.getElementById('Main')
if (root !== null) {
  const render = () => {
    ReactDOM.render( < Routes store = {
      store
    }
    />, root);
  }
  render();
  store.subscribe(render);
}