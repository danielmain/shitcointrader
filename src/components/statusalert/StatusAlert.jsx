import React, { useEffect, Fragment } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import _ from 'lodash';
import { dateTime } from 'node-datetime';
import type Status from '../../types/Status.js.flow';

type StatusAlertProps = {
  status: Status,
};

const StatusAlert = (props: StatusAlertProps) => {
  const [statusContent, setStatusContent] = React.useState([]);
  const { status } = props;

  useEffect(() => {
    if (!_.isEmpty(status)) {
      if (!statusContent || _.isEmpty(statusContent)) {
        setStatusContent([{ ...status, open: true }]);
      } else {
        const newStatusContent = _.map(statusContent, (st) => ({ ...st, open: true }));
        if (!_.find(statusContent, ['timestamp', status.timestamp])) {
          newStatusContent.push({ ...status, open: true });
        }
        setStatusContent(newStatusContent);
      }
    }
  }, [status]);

  const closeStatus = (st) => {
    const newStatus = _.set(_.find(statusContent, { timestamp: st.timestamp }), 'open', false);
    setStatusContent(newStatus);
  };

  return (
    <Fragment>
      { _.map(statusContent, (st) => (
        <Snackbar
          key={st.timestamp}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={st.open}
          onClose={() => closeStatus(st)}
          autoHideDuration={6000}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id={st.timestamp}>{st.msg}</span>}
        />
      ))}
    </Fragment>
  );
};

export default StatusAlert;
