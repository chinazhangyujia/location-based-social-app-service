const { createLogger, format, transports } = require('winston');
// Import mongodb
require('winston-mongodb');

const winstonLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.MongoDB({
      level: 'error',
      db: process.env.MONGODB_URI,
      options: {
        useUnifiedTopology: true,
      },
      collection: 'server_logs',
    }),
  ],
});

const logger = {
  error: (message, ex) => {
    if (!ex) {
      winstonLogger.error(message);
    } else {
      winstonLogger.error(`${message} stack trace - ${ex.stack}`);
    }
  },
  info: (message) => {
    winstonLogger.info(message);
  },
};

module.exports = logger;
