//@flow
import React from 'react'
import PropTypes from 'prop-types';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import {
  ButtonToolbar,
  Container
} from 'react-bootstrap';

const Routes = ({store}) => {
  return (
    <HashRouter >
      <div>
        <Route path= "/" exact component={Home}/>
        <Route path = "/setup" component={Setup}/>
      </div>
    </HashRouter>
  );
};

Root.propTypes = {
  store: PropTypes.shape({
    getState: PropTypes.func,
    dispatch: PropTypes.func,
  }).isRequired,
}

export default Root;