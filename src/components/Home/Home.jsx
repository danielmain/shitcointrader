import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import _ from 'lodash';

class Home extends Component {
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
        <Button variant="success" onClick={onIncrement}>
          +
        </Button>
        {' '}
        <Button variant="primary" onClick={onDecrement}>
          -
        </Button>
        {' '}
        <Button variant="primary" onClick={this.incrementIfOdd}>
          Increment if odd
        </Button>
        {' '}
        <Button variant="primary" onClick={this.incrementAsync}>
          Increment async
        </Button>
      </p>
    )
  }
}

Home.propTypes = {
  value: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired
}

export default Home
