import {createLogger, format, transports} from 'winston';


const logger = createLogger({
  level: 'verbose',
  format: format.combine(
    // format.timestamp({
    //   format: 'YYYY-MM-DD HH:mm:ss'
    // }),
    format.errors({stack: true}),
    format.splat(),
    format.json()
  ),
  defaultMeta: {},
  transports: [
    //
    // - Write to all logs with level `info` and below to `bulk-publish-combined.log`.
    // - Write all logs error (and below) to `bulk-publish-error.log`.
    //
    new transports.File({filename: 'logs/bulk-npm-publish-error.log', level: 'error'}),
    new transports.File({filename: 'logs/bulk-npm-publish-combined.log', level: 'silly'})
  ]
});


//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
    level: 'verbose'
  }));
}

export {logger};
