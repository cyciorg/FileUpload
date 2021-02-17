const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const webhook = require('./WebHook');

const formatS = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Cyci' }),
    timestamp(),
    formatS
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/error.log', level: 'error' }),
    new transports.File({ filename: 'src/logs/http.log', level: 'http' }),
    new transports.File({ filename: 'src/logs/combined.log' }),
  ],
});

exports.log = async (content, type = 'log') => {
  switch(type) {
    case 'log':
      logger.log({level: "info", message: `${content}`})
      webhook(process.env.WEBHOOK_LINK, {title: "LOG - Normal", color: process.env.LOGGING_COLOR_SUCCESS, info: content})
      break;
    case 'error':
      logger.log({level: "error", message: `${content}`})
      webhook(process.env.WEBHOOK_LINK, {title: "LOG - Error", color: process.env.LOGGING_COLOR_ERROR, info: content})
      break;
  }
};

exports.error = (...args) => this.log(...args, "error");