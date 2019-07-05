//@flow
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import Home from '../home';

const Routes = ( props ) => {
  return (
    <HashRouter>
      <Route path= "/" exact render={
        routeProps => <Home {...props} {...routeProps} />
      }/>
    </HashRouter>
  );	
};

export default Routes;