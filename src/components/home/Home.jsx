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
  const statusCode = _.get(props, 'status.code', false);
  const status = _.get(props, 'status.code', { code: 0 });

  useEffect(() => {
    if (!_.get(props, 'keys.apiKey', false) && !_.includes([500, 404], statusCode)) {
      getApiKey();
    } else if (!_.get(props, 'keys.apiKey', false) && _.includes([500, 404], statusCode)) {
      setOpenLogin(true);
    } else {
      console.log(`apiKey: ${_.get(props, 'keys.apiKey', false)} | statusCode: ${statusCode}`);
    }
  }, [keys, status]);

  if (_.get(status, 'msg', false)) {
    alert(_.get(status, 'msg'));
  }

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
        <div className={classes.tradingContainer}>
          <TradeStatus />
        </div>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
