import * as winston from 'winston'

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: {service: 'plugwise-mqtt'},
  transports: [
    new winston.transports.Console(),
  ],
})
