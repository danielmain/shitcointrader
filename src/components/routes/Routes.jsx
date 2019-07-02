//@flow
import React from 'react'
import PropTypes from 'prop-types';
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

const Routes = ( props ) => {
  const { apiKey } = props;
  return (
    <HashRouter >
      <Route path= "/" exact render={
        routeProps => !!apiKey ? <Home {...props} {...routeProps} /> : <Setup {...props} {...routeProps} />
      } />
    </HashRouter>
  );
};

export default Routes;