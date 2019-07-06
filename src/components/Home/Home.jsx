//@flow
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { send } from 'redux-electron-ipc';
import type { ReduxStore } from 'redux';
import { connect } from 'react-redux';
import Binance from 'node-binance-api';
import {
  HashRouter,
  Route
} from 'react-router-dom'; 
import {
  Button,
  Container,
  Form,
  Modal,
  Nav,
} from 'react-bootstrap';
import _ from 'lodash';
import TraderAlert from './TraderAlert.jsx';
import { storeApiKey, getApiKey } from '../../actions';

const Home = (props) => {
  const keys = _.get(props, 'keys', {});
  const status = _.get(props, 'status');
  const isValid = _.get(status, 'code', false) === 202;
  useEffect(() => {
    if (_.isEmpty(keys)) {
      props.getApiKey();
    }
  }, [props.keys]);

  if (_.isEmpty(keys)) {
    return (
      <div>
        <TraderAlert status={status} /> 
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Setup</Modal.Title>
          </Modal.Header>
          <Form 
            validated={isValid}
            onSubmit={async event => {
              const apiKey = _.get(event.target, 'apiKey.value', false);
              const apiSecret = _.get(event.target, 'apiSecret.value', false);
              props.storeApiKey({apiKey, apiSecret});
              event.preventDefault();
              event.stopPropagation();
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
                  isValid={isValid}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
              Please provide valid 64 Character long API Key.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Binance API Secret</Form.Label>
                <Form.Control 
                  required
                  name="apiSecret"
                  type="password"
                  placeholder="Enter your api secret"
                  minLength="64"
                  isValid={isValid}
                ></Form.Control>
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
        </Modal.Dialog>
      </div>
    );
  } else {
    return (
      <div>
        <TraderAlert status={status} /> 
        <Nav variant="tabs" defaultActiveKey="/home">
          <Nav.Item>
            <Nav.Link href="/home">Active</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-1">Option 2</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="disabled" disabled>
            Disabled
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

    );
  }

  
};

const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = dispatch => ({
  getApiKey: () => dispatch(send('getApiKey')),
  storeApiKey: (keys) => dispatch(send('storeApiKey', keys)),
  setStatus: (status) => dispatch(send('setStatus', status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);