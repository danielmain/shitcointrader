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
import Snackbar from '@material-ui/core/Snackbar';
import BlockUi from 'react-block-ui';
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
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
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

type ApiKey = { apiKey: string, apiSecret: string };

type Balance = {
  balance: number,
  priceinBtc: number,
  priceInUsd: number,
  stopLoss: number,
  stopLossPrice?: number,
};

type Status = {
  code: number,
  msg: string,
}

type LoginProps = {
  api: ApiKey,
  status: {
    code: string,
    msg: string,
  },
  balances: [Balance],
  getApiKey: Function,
  getBalances: Function,
  updateStatus: Function,
  status: Status,
};

const Home = (props: LoginProps) => {
  const classes = useStyles(theme);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openAddTrade, setOpenAddTrade] = React.useState(false);
  const [statusContent, setStatusContent] = React.useState([]);

  const {
    api, balances, getApiKey, getBalances, updateStatus, status,
  } = props;

  console.log('TCL: Home -> status', status);

  useEffect(() => {
    if (api && api.apiKey && _.isEmpty(balances)) {
      getBalances();
    }
  }, [balances]);

  useEffect(() => {
    if (!api) {
      getApiKey();
    } else if (!api.apiKey) {
      console.log('Opening Login');
      setOpenLogin(true);
    }
    updateStatus();
  }, [api]);

  useEffect(() => {
    if (!_.isEmpty(status)) {
      const newStatus = _.concat(statusContent, [{ ...status, open: true }]);
      setStatusContent(newStatus);
    }
  }, [status]);

  const closeStatus = (st) => {
    const newStatus = _.set(_.find(statusContent, { timestamp: st.timestamp }), 'open', false);
    setStatusContent(newStatus);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <BlockUi tag="div" blocking={_.isEmpty(api) || _.isEmpty(balances)} className={classes.root}>
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
              api={api}
              handleClose={() => setOpenLogin(false)}
            />
          ) : null}
        { openAddTrade
          ? (
            <AddTrade
              open={openAddTrade}
              handleClose={() => setOpenAddTrade(false)}
            />
          )
          : null}
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

        { (!_.isEmpty(balances)) ? (
          <div className={classes.tradingContainer}>
            <TradeStatus balances={balances} />
          </div>
        ) : null }
        { _.map(statusContent, (st) => (
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={_.get(st, 'open', false)}
            onClose={() => closeStatus(st)}
            autoHideDuration={6000}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id={st.timestamp}>{st.msg}</span>}
          />
        ))}


      </BlockUi>
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  ...state,
});
const mapDispatchToProps = (dispatch) => ({
  updateStatus: (status) => dispatch(send('updateStatus', status)),
  getApiKey: () => dispatch(send('getApiKey')),
  getTrades: () => dispatch(send('getTrades')),
  getBalances: () => dispatch(send('getBalances')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
