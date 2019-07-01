import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.incrementAsync = this.incrementAsync.bind(this);
    this.incrementIfOdd = this.incrementIfOdd.bind(this);
  }

  incrementIfOdd() {
    if (_.get(this.props, 'value') % 2 !== 0) {
      _.get(this.props, 'onIncrement')();
    }
  }

  incrementAsync() {
    setTimeout(_.get(this.props, 'onIncrement'), 1000);
  }

  render() {
    const { value, onIncrement, onDecrement } = this.props
    return (
      <p>
        Clicked: {value} times
        {' '}
        <button type="button" onClick={onIncrement}>
          +
        </button>
        {' '}
        <button type="button" onClick={onDecrement}>
          -
        </button>
        {' '}
        <button type="button" onClick={this.incrementIfOdd}>
          Increment if odd
        </button>
        {' '}
        <button type="button" onClick={this.incrementAsync}>
          Increment async
        </button>
      </p>
    )
  }
}

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired
}

export default Counter
