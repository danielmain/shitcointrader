import React, { useEffect } from 'react';
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
  padding: {
    padding: theme.spacing(1),
  },
}));

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const TradeStatus = (props) => {
  const classes = useStyles();
  const getTrades = _.get(props, 'getTrades');
  const statusCode = _.get(props, 'status.code', false);
  const trades = _.get(props, 'trades', []);
  console.log('TCL: TradeStatus -> trades', trades);
  let rows = [];

  useEffect(() => {
    if (_.isEmpty(trades)) {
      console.log('Calling getTrades()');
      getTrades();
    } else {
      rows = _.map(trades, trade => createData(
        trade.symbol,
        trade.orderId,
        trade.origQty,
        trade.status,
        trade.coinPriceInBtc,
      ));
    }
  }, trades);

  return (
    <React.Fragment>
      {!_.isEmpty(trades) ? (
        <Paper className={classes.padding}>
          <Typography variant="h5" component="h3">
          BTC/XRP
          </Typography>
          <Typography component="p">
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Order ID</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Price used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.symbol}>
                    <TableCell component="th" scope="row">
                      {row.symbol}
                    </TableCell>
                    <TableCell align="right">{row.orderId}</TableCell>
                    <TableCell align="right">{row.origQty}</TableCell>
                    <TableCell align="right">{row.status}</TableCell>
                    <TableCell align="right">{row.coinPriceInBtc}</TableCell>
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
  setStatus: status => dispatch(send('setStatus', status)),
  getTrades: () => dispatch(send('getTrades')),
});

export default connect(mapStateToProps, mapDispatchToProps)(TradeStatus);
