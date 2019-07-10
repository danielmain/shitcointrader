//@flow
import React, { useEffect } from 'react';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import _ from 'lodash';
import Login from '../Login';
import Home from '../Home';

const Routes = ( props ) => {
  const status = _.get(props, 'status', {});
  const keys = _.get(props, 'keys', {});

  useEffect(() => {
    if (!_.get(keys, 'apiKey', false) && !_.get(status, 'status', 500) !== 500) {
      props.getApiKey();
    }
  }, [props.keys]);

  return (
    <HashRouter>
      <Route path= "/" exact render={
        routeProps => _.get(keys, 'apiKey') ? <Home {...props} {...routeProps} /> : <Login {...props} {...routeProps} /> 
      }/>
    </HashRouter>
  );
};

const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = dispatch => ({
  getApiKey: () => dispatch(send('getApiKey')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Routes);