import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
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
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type AddTradeProps = {
  storeApiKey: Function,
  handleClose: Function,
  open: boolean,
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
  const [modalStyle] = React.useState(getModalStyle);

  const [values, setValues] = useState({
    age: '',
    name: 'hai',
  });

  const { keys, status, open, handleClose, storeApiKey } = props;

  useEffect(() => {
    if (keys) {
      setApiKey(_.get(keys, 'apiKey'));
      setApiSecret(_.get(keys, 'apiSecret'));
    }
    // if (_.get(status, 'msg', false)) {
    //   alert(_.get(status, 'msg'));
    // }
  }, [keys, status]);

  const isKeyValid = () => (
    apiKey.length < 63
    || apiSecret.length < 63
    || _.isEmpty(apiKey)
    || _.isEmpty(apiSecret));


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
          subheader="Set the variable stoploss"
        />
        <form noValidate autoComplete="off">
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Age</InputLabel>
            <Select
              value={values.age}
              onChange={handleChange}
              inputProps={{
                name: 'age',
                id: 'age-simple',
              }}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
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
              storeApiKey(apiKey, apiSecret);
            }}
            disabled={isKeyValid()}
          >
            <SaveIcon className={clsx(classes.rightIcon)} />
              Save
          </Button>
        </form>
      </Card>
    </Modal>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  storeApiKey: keys => dispatch(send('storeApiKey', keys)),
  setStatus: status => dispatch(send('setStatus', status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddTrade);
