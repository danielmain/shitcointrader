import React, { useState, useEffect } from 'react';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import _ from 'lodash';
import Login from '../login';

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
  storeApiKey: Function,
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
  const [modalStyle] = React.useState(getModalStyle);
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
  // <View style={styles.app}>
  //   <View style={styles.header}>
  //     <Image
  //       accessibilityLabel="React logo"
  //       source={{ uri: logoUri }}
  //       resizeMode="contain"
  //       style={styles.logo}
  //     />
  //     <Text style={styles.title}>Binance Api Keys</Text>
  //   </View>
  //   <TextInput
  //     style={styles.input}
  //     underlineColorAndroid="transparent"
  //     placeholder=" ApiKey"
  //     placeholderTextColor="#9a73ef"
  //     onChangeText={setApiKey}
  //     value={_.get(keys, 'apiKey')}
  //   />
  //   <TextInput
  //     style={styles.input}
  //     underlineColorAndroid="transparent"
  //     placeholder=" ApiSecret"
  //     placeholderTextColor="#9a73ef"
  //     onChangeText={setApiSecret}
  //     value={_.get(keys, 'apiSecret')}
  //   />
  //   <TouchableOpacity
  //     style={styles.submitButton}
  //     onPress={() => storeApiKey({ apiKey, apiSecret })}
  //   >
  //     <Text style={styles.submitButtonText}> Save credentials </Text>
  //   </TouchableOpacity>
  // </View>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  storeApiKey: keys => dispatch(send('storeApiKey', keys)),
  setStatus: status => dispatch(send('setStatus', status)),
  getApiKey: () => dispatch(send('getApiKey')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
