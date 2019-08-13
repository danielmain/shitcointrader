import winston from 'winston';
import moment from 'moment';
import * as path from 'path';
import * as process from 'process';

const logPath = './';

const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss').trim();

const Logger = winston.createLogger({
  format: winston.format.json(),
  colorize: true,
  transports: [
    new winston.transports.Console({
      timestamp: tsFormat,
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // new winston.transports.File({
    //   filename: path.join(logPath, 'debug.log'),
    //   timestamp: tsFormat,
    //   json: false,
    //   level: 'debug',
    // }),
    new winston.transports.File({
      filename: path.join(logPath, 'error.log'),
      timestamp: tsFormat,
      json: false,
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production' && process.env.LOG_LEVEL === 'debug') {
  Logger.level = 'debug';
}

export default Logger;
