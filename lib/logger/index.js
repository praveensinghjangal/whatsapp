/**
 * Created by Yogend on 19/8/14.
 */
var config = require('../../config')
var moment = require('moment')
// var moment = require('moment');
// var winston = require('winston');
var DailyRotateFile = require('winston-daily-rotate-file')
//
// var logger = winston.createLogger({
//     transports: [
//         new (winston.transports.Console)({
//             level: config.logging.level,
//             format: winston.format.simple(), // json()
//             stderrLevels: ['errors'],
//             colorize: config.logging.colorize,
//             'timestamp': function () {
//                 return moment().format('YYYY-MM-DD HH:mm:ss');
//             }
//         }),
//         // new DailyRotateFile({
//         //     filename: config.logging.log_file,
//         //     level: config.logging.level,
//         //     datePattern: (config.logging.datePattern) ? '.' + config.logging.datePattern : '.yyyy-MM-dd',
//         //     zippedArchive:true,
//         //     maxsize: (config.logging.maxsize) ? config.logging.maxsize : '50m',//50 * 1024 * 1024, // 50 MB
//         //     maxFiles:(config.logging.maxFiles) ? config.logging.maxFiles : "15d",
//         //     'timestamp': function () {
//         //         return moment().format('YYYY-MM-DD HH:mm:ss');
//         //     }
//         // })
//     ],
//
// });
//
// if (!config.logging.console && !config.logging.only_console) {
//     logger.remove(new winston.transports.Console());
// }
// if (config.logging.only_console) {
//     logger.remove(DailyRotateFile);
// }

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, prettyPrint, simple, splat, printf, json } = format

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

const logger = createLogger({

  format: combine(
    splat(),
    timestamp({
      format: timezoned
    }),
    simple(),
    myFormat
    // json()
  ),
  transports: [
    new transports.Console({
      level: 'silly'
    })
  ]
})

// if not development, add DailyRotateFile
if (process.env.NODE_ENV !== 'development') {
  logger.transports.push(
    new DailyRotateFile({
      level: 'silly',
      filename: config.logging.log_file
    })
  )
}

module.exports = logger
