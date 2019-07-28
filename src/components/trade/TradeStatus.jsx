import React from 'react';
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

const formatSymbol = (symbol) => {
  const parts = _.split(symbol, 'BTC', 2);
  return `${parts[0]}/BTC`;
};

const TradeStatus = (props) => {
  const classes = useStyles();
  const trades = _.get(props, 'trades', []);

  return (
    <React.Fragment>
      {!_.isEmpty(trades) ? (
        <Paper className={classes.padding}>
          <Typography component="span">
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Purchased price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map(row => (
                  <TableRow key={row.orderId}>
                    <TableCell component="th" scope="row">
                      {formatSymbol(row.symbol)}
                    </TableCell>
                    <TableCell align="right">{row.coinPriceInBtc}</TableCell>
                    <TableCell align="right">{row.origQty}</TableCell>
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

export default TradeStatus;
