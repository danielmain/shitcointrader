import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select'; import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import _ from 'lodash';

const logoUri = 'images/binance.png';

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
    padding: theme.spacing(2, 4, 4),
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
  stopLoss: {
    minWidth: 20,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type AddTradeProps = {
  getBalance: Function,
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

const handleChange = (e) => {
  console.log(e);
};

const AddTrade = (props: AddTradeProps) => {
  const classes = useStyles();
  const { status, open, balance, getBalance, handleClose } = props;

  const [modalStyle] = React.useState(getModalStyle);

  const [values, setValues] = useState({
    pair: {
      code: 'XRP',
      name: 'XRP Ripple',
    },
    stopLoss: {
      code: 2,
      name: '2%',
    },
  });

  const statusCode = _.get(props, 'status.code', false);
  console.log('TCL: AddTrade -> statusCode', statusCode);

  useEffect(() => {
    if (!balance && !_.includes([500, 404], statusCode)) {
      getBalance('BTC');
    }
  }, [statusCode]);

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
          title="Buy shitcoin"
          subheader={saldoString}
        />
        <form noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel htmlFor="pair-simple">Pair</InputLabel>
                <Select
                  value={values.pair}
                  onChange={handleChange}
                  inputProps={{
                    name: 'pair',
                    id: 'pair-simple',
                  }}
                  className={classes.pair}
                >
                  <MenuItem value="XRP">XRP Ripple</MenuItem>
                  <MenuItem value="ETH">Ethereum</MenuItem>
                  <MenuItem value="XMR">Monero</MenuItem>
                  <MenuItem value="LINK">Chainlink</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel htmlFor="stopLoss-simple">Stop Loss</InputLabel>
                <Select
                  value={values.stopLoss}
                  onChange={handleChange}
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
            <Grid item xs={12} md={12}>
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

                }}
              >
                <SaveIcon className={clsx(classes.rightIcon)} />
              Save
              </Button>
            </Grid>
          </Grid>
        </form>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(AddTrade);