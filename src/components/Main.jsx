import React from 'react'
import PropTypes from 'prop-types';
import { send } from 'redux-electron-ipc';
import Counter from './Counter';
import { increment, decrement} from '../actions';

const Main = ({store}) => {
  return (
    <div id="Layout">
      <Counter
        value={store.getState ()}
        onIncrement={() => {
          store.dispatch(send('increment', 'redux', 'electron', 'ipc'));
          store.dispatch(increment ()) 
          ;
        }}
        onDecrement={() => store.dispatch(decrement())}
      />
    </div >);
};

Main.propTypes = {
  store: PropTypes.shape({
    getState: PropTypes.func ,
    dispatch: PropTypes.func,
  } ).isRequired ,
}

export default Main;
