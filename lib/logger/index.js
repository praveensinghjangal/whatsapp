/**
 * Created by Yogend on 19/8/14.
 */
var config = require('../../config')
var __constants = require('../../config/constants')
var moment = require('moment')
var DailyRotateFile = require('winston-daily-rotate-file')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, simple, splat, printf } = format
// const { combine, timestamp, label, prettyPrint, simple, splat, printf, json } = format

const myFormat = printf((info) => {
  const timestamp = info.timestamp
  const message = info.message
  const level = info.level
  delete info.timestamp
  delete info.message
  delete info.level
  if (info.level === 'error') {
    // return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message)} ${info.stack}`;
    return `${timestamp} ${level}: ${message}: ${JSON.stringify(info)}: ${info.stack}`
  } else {
    // return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message)}`;
    return `${timestamp} ${level}: ${message}: ${JSON.stringify(info)}`
  }
})

const timezoned = () => {
  /* return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
    }); */
  return moment().format('YYYY-MM-DD HH:mm:ss')
}

const loggerTransports = [
  new transports.Console({
    level: 'silly'
  })
]
// if not development, add DailyRotateFile
if (process.env.NODE_ENV !== __constants.CUSTOM_CONSTANT.DEV_ENV) {
  loggerTransports.push(
    new DailyRotateFile({
      level: 'silly',
      filename: config.logging.log_file
    })
  )
}
const logger = createLogger({
  format: combine(
    splat(),
    timestamp({
      format: timezoned
    }),
    simple(),
    // prettyPrint()
    // json(),
    myFormat
  ),
  transports: loggerTransports
})

module.exports = logger
