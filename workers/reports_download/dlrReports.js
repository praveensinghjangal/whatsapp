const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const DbService = require('../../app_modules/message/services/dbData')
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')
// const util = require('util')
// const q = require('q')
// const fse = require('fs-extra')
const json2csv = require('json2csv').parse
// const unLink = util.promisify(fs.rmdir)
const rejectionHandler = require('../../lib/util/rejectionHandler')
// function getNumberOfTimeToGetData (pullPageSize, datasetSize) {
//   if (datasetSize != null) {
//     if (datasetSize >= 0) {
//       let pages = datasetSize / pullPageSize
//       pages += datasetSize % pullPageSize !== 0 ? 1 : 0
//       return Math.floor(pages)
//     }
//   }
// }
class dlrReportsDownlaod {
  startServer () {
    const queue = __constants.MQ.reportsDownloadConsumer.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            const messageData = JSON.parse(mqData.content.toString())
            const dbService = new DbService()
            let pathName, fileName
            const templateId = {}
            // dbService.getAllUserStatusCountPerDay
            // __logger.info('dlr_reports_downloads_queue::received:', { mqData })
            // __logger.info('dlr_reports_downloads_queue:: messageData received:', messageData)
            // console.log('#######################################################', messageData)
            dbService.getTemplateIdandTemplateNameAgainstUser(messageData.userId)
              . then((data) => {
                if (data && data.length > 0) {
                  for (let i = 0; i < data.length; i++) {
                    const value = data[i]
                    let templatename
                    if (value.templateName) {
                      templatename = value.templateName
                    } else {
                      templatename = null
                    }
                    if (!templateId[value.templateId]) {
                      templateId[value.templateId] = templatename
                    }
                  }
                } else {
                  return true
                }
              })
              .then(() => {
                return dbService.countOfDataAgainstWabaAndUserId(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, messageData.userId)
              })
              .then(async (data) => {
                if (data.count) {
                  const count = data.data || 0
                  const lowLimit = 1000000
                  const part = Math.ceil(count / lowLimit)
                  let skipPage = 0
                  // const numberOfTimes = getNumberOfTimeToGetData(lowLimit, count)
                  pathName = `./app_modules/download/${messageData.filename}`
                  fs.mkdirSync(pathName)
                  for (let i = 0; i < part; i++) {
                    skipPage = i * lowLimit
                    fileName = `${i}.csv`
                    const data = await dbService.getUserStatusCountPerDayAgainstWaba(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, skipPage, lowLimit)
                    if (data.length > 0) {
                      for (let i = 0; i < data.length; i++) {
                        const value = data[i]
                        if (value.templateId) {
                          value.templateName = templateId['value.templateId'] || null
                        } else {
                          value.templateId = null
                          value.templateName = null
                        }
                      }
                    }
                    const result = json2csv(data, { header: true })
                    fs.appendFile(`${pathName}/${fileName}`, result, function (err, result) {
                      if (err) {
                        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: 'unable to create for', data: {} })
                      }
                    })
                  }
                } else {
                  __logger.error('error in sending mis ~function=messageStatusOnMail', { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: 'unable to create file messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber', data: {} })
                }
              })
              .then(() => {
                var output = fs.createWriteStream(path.resolve(__dirname, `../../${__constants.FILEPATH}/${messageData.filename}.zip`))
                var archive = archiver('zip')
                archive.on('error', function (err) {
                  throw err
                })
                archive.pipe(output)
                archive.directory(path.resolve(__dirname, `../../${pathName}`), false)
                return archive.finalize()
              })
              .then((data) => {
                return dbService.updateStatusAgainstWabaAndUser(messageData.wabaPhoneNumber, messageData.filename, `${__constants.FILEPATH}/${messageData.filename}`)
              })
              .then((data) => {
                __logger.info('getAllUserStatusCountPerDay: data')
                fs.rmdirSync(path.resolve(__dirname, `../../${pathName}`), { recursive: true, force: true })
                // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++', messageData)
                rmqObject.channel[queue].ack(mqDataReceived)
              })
              .catch(err => {
                const telegramErrorMessage = ' ~ facebook error queue consumer::error:'
                __logger.error('dlr_reports_downloads_queue:::error: ', err)
                errorToTelegram.send(err, telegramErrorMessage)
                rmqObject.channel[queue].ack(mqDataReceived)
              })
            // getAllUserStatusCountPerDay
          } catch (err) {
            const telegramErrorMessage = 'dlrReportsDownlaod ~ dlr_reports_downloads_queue::error while parsing: '
            errorToTelegram.send(err, telegramErrorMessage)
            __logger.error('facebook queue consumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        const telegramErrorMessage = 'dlrReportsDownlaod ~ dlr_reports_downloads_queue::Main error in catch block'
        errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('dlr_reports_downloads_queue::error: ', err)
        process.exit(1)
      })
    this.stop_gracefully = function () {
      __logger.info('stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}
class Worker extends dlrReportsDownlaod {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}
module.exports.worker = new Worker()
