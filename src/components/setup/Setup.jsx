//@flow
import React from 'react'
import PropTypes from 'prop-types';
import { send } from 'redux-electron-ipc';
import Counter from './Counter.jsx';
import {
  HashRouter,
  Route
} from 'react-router-dom';
import { ButtonToolbar, Container } from 'react-bootstrap';
import { increment, decrement} from '../actions';

const Main = ({store}) => {
  return (
    <Container>
      <ButtonToolbar>
        <Counter
          value={store.getState ()}
          onIncrement={() => {
            store.dispatch(send('increment', 'redux', 'electron', 'ipc'));
            store.dispatch(increment ())
            ;
          }}
          onDecrement={() => store.dispatch(decrement())}
        />
      </ButtonToolbar>
    </Container>);
};

Main.propTypes = {
  store: PropTypes.shape({
    getState: PropTypes.func ,
    dispatch: PropTypes.func,
  } ).isRequired ,
}

export default Main;
