//@flow
import React from 'react'
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
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
import {
  ButtonToolbar,
  Container
} from 'react-bootstrap';
import Home from '../home';
import Setup from '../setup';
import * as serviceWorker from './serviceWorker';

// register an action creator to an ipc channel (key/channel, value/action creator)
const ipc = createIpc({
  'storeApiKey': storeApiKey,
  'getApiKey': getApiKey,
});

serviceWorker.unregister();

const store = createStore(reducers, applyMiddleware(ipc));

const root = document.getElementById('Main')
if (root !== null) {
  const render = () => {
    ReactDOM.render(
    <Provider store={store}>
      <HashRouter >
        <Route path= "/" exact render={
          routeProps => <Home {...props} {...routeProps} />
        } />
      </HashRouter>
    </Provider>, root);
  }
}
