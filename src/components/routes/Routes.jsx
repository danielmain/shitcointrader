// @flow
import React, { useEffect } from 'react';
import {
  HashRouter,
  Route,
} from 'react-router-dom';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import _ from 'lodash';
import Login from '../login';
import Home from '../home';

type RoutesProps = {
  getApiKey: Function,
  keys: {
    apiKey: string,
    apiSecret: string,
  },
  status: {
    code: string,
    msg: string,
  }
};

const needLogin = (apiKey, statusCode) => {
  if (statusCode === 202) {
    return false;
  }
  return true;
};

const Routes = (props: RoutesProps) => {
  console.log('TCL: Routes -> props', props);
  const { status } = props;
  const statusCode = _.get(props, 'status.code', false);
  const apiKey = _.get(props, 'keys.apiKey', false);
  const getApiKey = _.get(props, 'getApiKey', {});

  useEffect(() => {
    console.log('======> TCL: Routes -> useEffect');
    if (!apiKey && !_.includes([500, 404], statusCode)) {
      console.log(`STATUS: ${statusCode} Calling getApiKey ...`);
      getApiKey();
    } else {
      console.log(`apiKey: ${apiKey} and statusCode: ${statusCode}`);
    }
  }, [status]);

  return (
    <HashRouter>
      <Route
        path="/"
        exact
        render={
          (routeProps) => {
            if (needLogin(apiKey, statusCode)) {
              return <Login {...props} {...routeProps} />;
            }
            return <Home {...props} {...routeProps} />;
          }
        }
      />
    </HashRouter>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  getApiKey: () => dispatch(send('getApiKey')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
