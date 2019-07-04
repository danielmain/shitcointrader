//@flow
import React from 'react'
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


// register an action creator to an ipc channel (key/channel, value/action creator)
const ipc = createIpc({
  'storeApiKey': storeApiKey,
  'getApiKey': getApiKey,
});

const store = createStore(reducers, applyMiddleware(ipc));

const Routes = ( props ) => {
  const { apiKey } = props;
  return (
    <Provider store={store}>
      <HashRouter >
        <Route path= "/" exact render={
          routeProps => !!apiKey ? <Home {...props} {...routeProps} /> : <Setup {...props} {...routeProps} />
        } />
      </HashRouter>
    </Provider>
  );
};

export default Routes;
