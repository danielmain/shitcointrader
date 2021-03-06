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
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import _ from 'lodash';
import StatusAlert from '../statusalert';

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

const useStyles = makeStyles((theme) => ({
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
}));

type LoginProps = {
  storeApiKey: Function,
  handleClose: Function,
  open: boolean,
  api: {
    apiKey: string,
    apiSecret: string,
  },
  status: {
    code: string,
    msg: string,
  }
};

const Login = (props: LoginProps) => {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const { api, status, open, handleClose, storeApiKey } = props;

  useEffect(() => {
    if (api) {
      setApiKey(_.get(api, 'apiKey'));
      setApiSecret(_.get(api, 'apiSecret'));
    }
  }, [api]);

  useEffect(() => {
    console.log('TCL: Login -> status', status);
    if (!_.isEmpty(status) && status.code === 200) {
      handleClose();
    }
  }, [status]);

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
          avatar={(
            <Avatar alt="Binance" src={logoUri} className={classes.bigAvatar} />
          )}
          title="Binance Keys"
          subheader="Your keys never leave your computer"
        />
        <form noValidate autoComplete="off">
          <TextField
            required
            id="outlined-apikey-input"
            label="ApiKey"
            className={classes.textField}
            margin="normal"
            variant="outlined"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            error={apiKey.length < 63}
          />
          <TextField
            required
            id="outlined-apisecret-input"
            label="ApiSecret"
            className={classes.textField}
            type="password"
            margin="normal"
            variant="outlined"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            error={apiSecret.length < 63}
          />
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

const mapStateToProps = (state) => ({
  ...state,
});
const mapDispatchToProps = (dispatch) => ({
  storeApiKey: (api) => dispatch(send('storeApiKey', api)),
  updateStatus: (status) => dispatch(send('updateStatus', status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
