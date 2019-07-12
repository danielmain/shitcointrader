import React from 'react';
import {
  HashRouter,
  Route,
} from 'react-router-dom';
import Home from '../home';

const Routes = (props: any) => (
  <HashRouter>
    <Route
      path="/"
      exact
      render={
        routeProps => (
          <Home {...props} {...routeProps} />
        )
      }
    />
  </HashRouter>
);

export default Routes;
