import React, { useState } from 'react';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import {
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'; // eslint-disable-line
import _ from 'lodash';
import Alert from './Alert';
// import TraderAlert from './TraderAlert.jsx';
// import { storeApiKey, getApiKey } from '../../actions';

const logoUri = 'images/binance.png';

const styles = StyleSheet.create({
  app: {
    marginHorizontal: 'auto',
    maxWidth: 1500,
  },
  logo: {
    height: 80,
  },
  header: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#7a42f4',
    marginVertical: '1em',
    textAlign: 'center',
  },
  input: {
    margin: 15,
    height: 40,
    width: 530,
    padding: 10,
    borderColor: '#7a42f4',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#7a42f4',
    padding: 10,
    margin: 15,
    height: 40,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  code: {
    fontFamily: 'monospace, monospace',
  },
});

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

const Login = (props: LoginProps) => {
  const [apiKey, setApiKey] = useState(true);
  const [apiSecret, setApiSecret] = useState(true);

  const keys = _.get(props, 'keys', false);
  if (keys) {
    setApiKey(_.get(keys, 'apiKey'));
    setApiSecret(_.get(keys, 'apiSecret'));
  }
  const status = _.get(props, 'status');
  console.log('TCL: Login -> status', status);
  // const isValid = _.get(status, 'code', false) === 202;

  const checkAndStoreKeys = () => {
    props.storeApiKey({ apiKey, apiSecret });
  };

  if (status) { return <Alert status={status} />; }
  return (
    <View style={styles.app}>

      <View style={styles.header}>
        <Image
          accessibilityLabel="React logo"
          source={{ uri: logoUri }}
          resizeMode="contain"
          style={styles.logo}
        />
        <Text style={styles.title}>Binance Api Keys</Text>
      </View>
      <TextInput
        style={styles.input}
        underlineColorAndroid="transparent"
        placeholder=" ApiKey"
        placeholderTextColor="#9a73ef"
        onChangeText={setApiKey}
        value={_.get(keys, 'apiKey')}
      />
      <TextInput
        style={styles.input}
        underlineColorAndroid="transparent"
        placeholder=" ApiSecret"
        placeholderTextColor="#9a73ef"
        onChangeText={setApiSecret}
        value={_.get(keys, 'apiSecret')}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={checkAndStoreKeys}
      >
        <Text style={styles.submitButtonText}> Save credentials </Text>
      </TouchableOpacity>
    </View>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  getApiKey: () => dispatch(send('getApiKey')),
  storeApiKey: keys => dispatch(send('storeApiKey', keys)),
  setStatus: status => dispatch(send('setStatus', status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
