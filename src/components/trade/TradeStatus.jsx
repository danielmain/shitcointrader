import React from 'react';
import { send } from 'redux-electron-ipc';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import _ from 'lodash';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  margin: {
    margin: theme.spacing(1),
  },
  padding: {
    padding: theme.spacing(1),
  },
}));

const TradeStatus = (props) => {
  const classes = useStyles();
  const { balances, sellCoin, setStopLoss } = props;

  const sell = (coinSymbol) => {
    sellCoin(coinSymbol);
  };

  return (
    <React.Fragment>
      {!_.isEmpty(balances) ? (
        <Paper className={classes.padding}>
          <Typography component="span">
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Coin</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price in BTC</TableCell>
                  <TableCell align="right">Price in Dollar Theter</TableCell>
                  <TableCell align="right">Stop Loss in %</TableCell>
                  <TableCell align="right">Stop Loss BTC price</TableCell>
                  <TableCell align="right" className={classes.margin}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_.map(_.filter(balances, { low: false }), row => (
                  <TableRow key={row.code}>
                    <TableCell component="th" scope="row">
                      {`${row.code}/BTC`}
                    </TableCell>
                    <TableCell align="right">{row.balance}</TableCell>
                    <TableCell align="right">{row.priceinBtc}</TableCell>
                    <TableCell align="right">{row.priceInUsd}</TableCell>
                    <TableCell align="right">{row.stopLoss}</TableCell>
                    <TableCell align="right">{row.stopLossPrice}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        className={classes.margin}
                        onClick={() => sell(row.code)}
                      >
                        Sell
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        className={classes.margin}
                        onClick={() => setStopLoss(row.code)}
                      >
                        set stop loss
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Typography>
        </Paper>
      ) : null}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  ...state,
});
const mapDispatchToProps = dispatch => ({
  sellCoin: coinSymbol => dispatch(send('sellCoin', coinSymbol)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TradeStatus);
