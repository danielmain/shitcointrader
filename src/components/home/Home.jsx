import React, { useEffect } from 'react';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { createMuiTheme, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import lime from '@material-ui/core/colors/lime';
import _ from 'lodash';
import Login from '../login';
import { TradeStatus, AddTrade } from '../trade';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: lime,
    secondary: {
      main: '#4527a0',
    },
  },
});
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  margin: {
    margin: theme.spacing(1),
  },
  tradingContainer: {
    margin: theme.spacing(1),
    padding: theme.spacing(3, 2),
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
  const classes = useStyles(theme);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openAddTrade, setOpenAddTrade] = React.useState(false);

  const getApiKey = _.get(props, 'getApiKey');
  const keys = _.get(props, 'keys', false);

  const getTrades = _.get(props, 'getTrades');
  const trades = _.get(props, 'trades', []);

  const statusCode = _.get(props, 'status.code', false);
  const status = _.get(props, 'status', { code: 0 });

  useEffect(() => {
    if (!_.get(props, 'keys.apiKey', false) && !_.includes([
      500, // <- 500 means: backend Error
      404, // <- 404 means: no keys found in db, setOpenLogin Dialog should be opened
      202, // <- 202 means: keys were found, no need to call getApiKey
    ], statusCode)) {
      getApiKey();
    } else if (!_.get(props, 'keys.apiKey', false) && _.includes([500, 404], statusCode)) {
      setOpenLogin(true);
    }
    if (_.isEmpty(trades) && keys) {
      getTrades();
    }
  }, [
    keys,
    statusCode,
    trades,
  ]);

  useEffect(() => {
    if (_.get(status, 'msg', false)) {
      alert(_.get(status, 'msg'));
    }
  }, [statusCode]);

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Shitcoin Trader
            </Typography>
            <Button variant="contained" onClick={() => setOpenLogin(true)}>Binance Keys</Button>
          </Toolbar>
        </AppBar>
        { openLogin
          ? (
            <Login
              open={openLogin}
              keys={keys}
              handleClose={() => setOpenLogin(false)}
            />
          ) : null
        }
        { openAddTrade
          ? (
            <AddTrade
              open={openAddTrade}
              handleClose={() => setOpenAddTrade(false)}
            />
          )
          : null
        }

        <div>
          <Fab
            size="medium"
            color="secondary"
            aria-label="Add"
            className={classes.margin}
            onClick={() => setOpenAddTrade(true)}
          >
            <AddIcon />
          </Fab>
        </div>

        { (!_.isEmpty(trades)) ? (
          <div className={classes.tradingContainer}>
            <TradeStatus trades={trades} />
          </div>
        ) : null }
      </div>
    </MuiThemeProvider>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(send('setStatus', status)),
  getApiKey: () => dispatch(send('getApiKey')),
  getTrades: () => dispatch(send('getTrades')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
