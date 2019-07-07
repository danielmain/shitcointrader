//@flow
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import Home from '../Home';
import { Provider } from 'react-redux';
import {
  createStore,
  applyMiddleware
} from 'redux';
import createIpc from 'redux-electron-ipc';
import reducers from '../../reducers';
import {
  storeApiKey,
  getApiKey,
  setStatus,
} from '../../actions';

const ipc = createIpc({
  'storeApiKey': storeApiKey,
  'getApiKey': getApiKey,
  'setStatus': setStatus,
});
const store = createStore(reducers, applyMiddleware(ipc));


const Routes = ( props ) => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Route path= "/" exact render={
          routeProps => <Home {...props} {...routeProps} />
        }/>
      </HashRouter>
    </Provider>
  );
};

export default Routes;