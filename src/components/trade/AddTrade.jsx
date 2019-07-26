import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Autorenew from '@material-ui/icons/Autorenew';
import CancelIcon from '@material-ui/icons/Cancel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select'; import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import _ from 'lodash';

const rand = () => Math.round(Math.random() * 20) - 10;

const getModalStyle = () => {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    width: 700,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 2, 0),
    outline: 'none',
  },
  bigAvatar: {
    margin: 10,
    width: 60,
    height: 60,
  },
  textField: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(5),
  },
  buttonLeft: {
    marginRight: theme.spacing(1),
  },
  buttonRight: {
    marginLeft: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  formControl: {
    marginRight: theme.spacing(2),
  },
  pair: {
    minWidth: 160,
  },
  amount: {
    minWidth: 80,
  },
  stopLoss: {
    minWidth: 80,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type AddTradeProps = {
  getBalance: Function,
  buyCoin: Function,
  handleClose: Function,
  open: boolean,
  balance: any,
  keys: {
    apiKey: string,
    apiSecret: string,
  },
  status: {
    code: string,
    msg: string,
  },
};

const AddTrade = (props: AddTradeProps) => {
  const classes = useStyles();
  const {
    status,
    open,
    balance,
    getBalance,
    buyCoin,
    handleClose,
  } = props;

  const [modalStyle] = React.useState(getModalStyle);

  const [values, setValues] = useState({
    pair: {
      value: 'XRP',
      name: 'BTC/XRP-Ripple',
    },
    amount: {
      value: 0.25,
      name: '25%',
    },
    stopLoss: {
      value: 2,
      name: '2%',
    },
  });

  const statusCode = _.get(props, 'status.code', false);
  console.log('TCL: AddTrade -> statusCode', statusCode);

  const handlePairChange = (event) => {
    setValues(oldValues => ({
      ...oldValues,
      pair: {
        name: event.target.name,
        value: event.target.value,
      },
    }));
  };

  const handleAmountChange = (event) => {
    setValues(oldValues => ({
      ...oldValues,
      amount: {
        name: event.target.name,
        value: event.target.value,
      },
    }));
  };

  const handleStopLossChange = (event) => {
    setValues(oldValues => ({
      ...oldValues,
      stopLoss: {
        name: event.target.name,
        value: event.target.value,
      },
    }));
  };

  useEffect(() => {
    if (!balance && !_.includes([500, 404], statusCode)) {
      getBalance('BTC');
    }
  }, [statusCode, balance]);
  console.log('TCL: AddTrade -> values', values);

  const saldoString = `Your BTC Saldo now is: ${balance}`;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={open}
      onClose={handleClose}
    >
      <Card style={modalStyle} className={classes.paper}>
        <CardHeader
          title="Buy shitcoin with your Bitcoins"
          subheader={saldoString}
        />
        <CardContent>
          <form noValidate autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className={classes.formControl}>
                  <InputLabel htmlFor="pair-simple">Pair</InputLabel>
                  <Select
                    value={values.pair.value}
                    onChange={handlePairChange}
                    inputProps={{
                      name: 'pair',
                      id: 'pair-simple',
                    }}
                    className={classes.pair}
                  >
                    <MenuItem value="ADA">BTC/Cardano</MenuItem>
                    <MenuItem value="ARK">BTC/Ark</MenuItem>
                    <MenuItem value="BNB">BTC/Binance Coin</MenuItem>
                    <MenuItem value="LINK">BTC/Chainlink</MenuItem>
                    <MenuItem value="ETH">BTC/Ethereum</MenuItem>
                    <MenuItem value="IOTA">BTC/IOTA</MenuItem>
                    <MenuItem value="LSK">BTC/Lisk</MenuItem>
                    <MenuItem value="ONT">BTC/Ontology</MenuItem>
                    <MenuItem value="TRX">BTC/Tron</MenuItem>
                    <MenuItem value="XMR">BTC/Monero</MenuItem>
                    <MenuItem value="XRP">BTC/XRP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth className={classes.formControl}>
                  <InputLabel htmlFor="amount-simple">Amount</InputLabel>
                  <Select
                    value={values.amount.value}
                    onChange={handleAmountChange}
                    inputProps={{
                      name: 'amount',
                      id: 'amount-simple',
                    }}
                    className={classes.amount}
                  >
                    <MenuItem value={0.25}>25%</MenuItem>
                    <MenuItem value={0.5}>50%</MenuItem>
                    <MenuItem value={0.75}>75%</MenuItem>
                    <MenuItem value={1}>100%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth className={classes.formControl}>
                  <InputLabel htmlFor="stopLoss-simple">Stop Loss</InputLabel>
                  <Select
                    value={values.stopLoss.value}
                    onChange={handleStopLossChange}
                    inputProps={{
                      name: 'stopLoss',
                      id: 'stopLoss-simple',
                    }}
                    className={classes.stopLoss}
                  >
                    <MenuItem value={2}>2%</MenuItem>
                    <MenuItem value={5}>5%</MenuItem>
                    <MenuItem value={10}>10%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <Button
                  variant="contained"
                  size="large"
                  className={clsx(classes.button, classes.buttonLeft)}
                  onClick={handleClose}
                >
                  <CancelIcon className={clsx(classes.rightIcon)} />
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  className={clsx(classes.button, classes.buttonRight)}
                  onClick={() => {
                    buyCoin(
                      values.pair.value,
                      values.amount.value,
                      values.stopLoss.value,
                    );
                  }}
                >
                  <Autorenew className={clsx(classes.rightIcon)} />
                  Buy
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(send('setStatus', status)),
  getBalance: coin => dispatch(send('getBalance', coin)),
  buyCoin: (coin, amount, stopLoss) => dispatch(send('buyCoin', { coin, amount, stopLoss })),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddTrade);
