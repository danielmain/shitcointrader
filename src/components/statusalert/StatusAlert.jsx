import React, { useEffect } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import _ from 'lodash';
import type Status from '../../types/Status.js.flow';

type StatusAlertProps = {
  status: Status,
};

const StatusAlert = (props: StatusAlertProps) => {
  const [statusContent, setStatusContent] = React.useState([]);
  const { status } = props;

  useEffect(() => {
    if (!_.isEmpty(status)) {
      statusContent.push(status);
      const newStatusContent = _.map(statusContent, (st) => ({ ...st, open: true }));
      setStatusContent(newStatusContent);
    }
  }, [status]);

  const closeStatus = (st) => {
    const newStatus = _.set(_.find(statusContent, { timestamp: st.timestamp }), 'open', false);
    setStatusContent(newStatus);
  };

  return (
    <div>
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
    </div>
  );
};

export default StatusAlert;
