//@flow
import React from 'react';
import PropTypes from 'prop-types';
import {
  HashRouter,
  Route
} from 'react-router-dom'; 
import {
  Alert,
} from 'react-bootstrap';
import _ from 'lodash';

const getVariant = (code: number) => {
  switch (code) {
  case 202:
    return 'success';
  default:
    return 'danger';
  };
};

const TraderAlert = (props) => {
  const status = _.get(props, 'status');
  if (_.isObject(status) && !_.isEmpty(status.msg) && !_.isEmpty(status.code)) {
    return (
      <div>
        <Alert variant={getVariant(status.code)}>
          {status.msg}
        </Alert>
      </div>
    );
  }
  return null;
   
};

export default TraderAlert;