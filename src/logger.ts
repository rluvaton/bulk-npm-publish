import { createLogger, format, transports } from 'winston';

// Should not output in test environment
const silent = process.env.NODE_ENV === 'test';

const options = {
  silent,
  level: 'verbose',
  format: format.combine(
    // format.timestamp({
    //   format: 'YYYY-MM-DD HH:mm:ss'
    // }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: {},

  // Shouldn't log to file when silent
  transports: silent
    ? []
    : [
        //
        // - Write to all logs with level `info` and below to `bulk-npm-publish-combined.log`.
        // - Write all logs error (and below) to `bulk-npm-publish-error.log`.
        //
        new transports.File({
          filename: 'logs/bulk-npm-publish-error.log',
          level: 'error',
        }),
        new transports.File({
          filename: 'logs/bulk-npm-publish-combined.log',
          level: 'silly',
        }),
      ],
};

const logger = createLogger(options);

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: 'verbose',
    }),
  );
}

export { logger };
