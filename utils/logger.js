const pino = require('pino');
const config = require('../config/config');

const logger = pino(
  { level: config.log.level, base: null, timestamp: pino.stdTimeFunctions.isoTime },
  pino.transport({
    targets: [
      { target: 'pino-pretty', options: { colorize: true }, level: config.log.level },
    ],
  })
);

module.exports = logger;
