import React, { useState, useEffect } from 'react';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import _ from 'lodash';
import Login from '../login';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
}));


type LoginProps = {
  keys: {
    apiKey: string,
    apiSecret: string,
  },
  status: {
    code: string,
    msg: string,
  }
};

const Home = (props: LoginProps) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const getApiKey = _.get(props, 'getApiKey');
  const keys = _.get(props, 'keys', false);
  const statusCode = _.get(props, 'status.code', false);
  const status = _.get(props, 'status.code', { code: 0 });

  useEffect(() => {
    if (!_.get(props, 'keys.apiKey', false) && !_.includes([500, 404], statusCode)) {
      getApiKey();
    } else if (!_.get(props, 'keys.apiKey', false) && _.includes([500, 404], statusCode)) {
      setOpen(true);
    } else {
      console.log(`apiKey: ${_.get(props, 'keys.apiKey', false)} | statusCode: ${statusCode}`);
    }
  }, [keys, status]);

  if (_.get(status, 'msg', false)) {
    alert(_.get(status, 'msg'));
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed className={classes.container}>
        <Login open={open} keys={keys} handleClose={() => setOpen(false)} />
      </Container>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(send('setStatus', status)),
  getApiKey: () => dispatch(send('getApiKey')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
