//@flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { send } from 'redux-electron-ipc';
import type { ReduxStore } from 'redux';
import Binance from 'node-binance-api';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import { Button, Container, Form, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { increment, decrement} from '../../actions';

const getBalancePromise = (
  code,
  binanceClient,
) => new Promise((resolve, reject) => binanceClient.balance((error, balances) => {
  if (error) {
    resolve(error);
  }
  const balance = _.get(
    balances,
    `${code.toUpperCase()}.available`,
    false,
  );
  
  if (_.isNumber(balance)) {
    resolve(false);
  } else {
    resolve(true);
  }
}));

const checkBinanceCredentials = async (APIKEY, APISECRET) => {
  const binance = new Binance();
  binance.options({
    APIKEY,
    APISECRET,
    useServerTime: true,
    test: true,
  });
  try {
    return await getBalancePromise('BTC', binance);
  } catch (error) {
    console.error(error);
    return false;
  } 
  

}
/* 
        <Counter
          value={store.getState ()}
          onIncrement={() => {
            store.dispatch(send('increment', 'redux', 'electron', 'ipc'));
            store.dispatch(increment ())
            ;
          }}
          onDecrement={() => store.dispatch(decrement())}
        /> */

const Setup = ({ store }: { store: ReduxStore }) => (
  <Modal.Dialog>
    <Modal.Header closeButton>
      <Modal.Title>Setup</Modal.Title>
    </Modal.Header>
    <Form 
      validated={true}
      onSubmit={async event => {
        event.preventDefault();
        event.stopPropagation();
        const apiKey = _.get(event.target, 'apiKey', false);
        const apiSecret = _.get(event.target, 'apiSecret', false);
        const credentialsCheck = await checkBinanceCredentials(apiKey, apiSecret);
        console.log('TCL: credentialsCheck', credentialsCheck);
        // const validateKey = (value) => value && value.length == 64;
        // const form = event.currentTarget;
        // if (form.checkValidity() === false || !validateKey(apiKey) || !validateKey(apiSecret)) {
        //   event.preventDefault();
        //   event.stopPropagation();
        // } else {
        //   store.dispatch(send('storeApiKey', apiKey));
        //   apiKey.value = '';
        //   apiSecret.value = '';
        // }
      }}>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Binance API Key</Form.Label>
          <Form.Control 
            required
            name="apiKey"
            type="text"
            placeholder="Enter your api key"
            minLength="64"
            isValid={false}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please provide valid 64 Character long API Key.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Binance API Secret</Form.Label>
          <Form.Control required name="apiSecret" type="password" placeholder="Enter your api secret" minLength="64"></Form.Control>
          <Form.Control.Feedback type="invalid">
                Please provide valid 64 Character long API Secret.
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
                Your API Secret is stored locally encrypted ONLY on your computer.
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit">Save changes</Button>
      </Modal.Footer>
    </Form>  
  </Modal.Dialog>);

export default Setup;
