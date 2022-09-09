const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const DbService = require('../../app_modules/message/services/dbData')
const { dirname } = require('path')
const fs = require('fs')
const q = require('q')
const fse = require('fs-extra')
const json2csv = require('json2csv').parse
// const moment = require('moment')
// const __config = require('../../config')
// const MessageHistoryService = require('../../app_modules/message/services/dbData')
// const RedirectService = require('../../app_modules/integration/service/redirectService')
// const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
// const qalllib = require('qalllib')

/// check wether the file is present or not
const filesPresent = (startDate, endDate, wabaPhoneNumber, userId) => {
  //   dirname = pwd
  //    const directoryPath = '/home/shivamsingh/Desktop/Projects/platform-api/download'
  console.log('33333333333333333333333333333333333333333', startDate, endDate, wabaPhoneNumber, userId)
  const pathName = (dirname, `../download/${startDate}/${endDate}/${userId}/${wabaPhoneNumber}`)
  //    path_name = __dirname, `../public/reports/smpp/${system_id}/${year}/${month}/${day}`
  const filesPresentInPath = q.defer()
  if (fs.existsSync(pathName)) {
    console.log('44444444444444444444444444444444444444444')
    filesPresentInPath.resolve(true)
  } else {
    console.log('filesPresent existsSync')
    filesPresentInPath.resolve(false)
  }
  return filesPresentInPath.promise
}
const copyFiles = (startDate, endDate, wabaPhoneNumber, userId) => {
  console.log('6666666666666666666666666666666666666666666 copyFiles', startDate, endDate, wabaPhoneNumber, userId)
  const filesPresentInPath = q.defer()
  const srcPath = (dirname, `../download/${startDate}/${endDate}/${userId}/${wabaPhoneNumber}`)
  const destPath = (dirname, `../download/${startDate}/${endDate}/${userId}/${wabaPhoneNumber}/copy`)
  fse.copy(srcPath, destPath)
    .then((data) => {
      console.log('copyFiles', data)
      if (data) {
        console.log('777777777777777777777777777777777777777777777777777', data)
        filesPresentInPath.resolve(true)
      } else {
        console.log('888888888888888888888888888888888888888888')
        filesPresentInPath.reject(false)
      }
    })
    .catch((error) => {
      console.log('copyFiles function error', error)
      filesPresentInPath.reject(error)
    })
  return filesPresentInPath.promise
}
function getNumberOfTimeToGetData (pullPageSize, datasetSize) {
  if (datasetSize != null) {
    if (datasetSize >= 0) {
      let pages = datasetSize / pullPageSize
      pages += datasetSize % pullPageSize !== 0 ? 1 : 0
      return Math.floor(pages)
    }
  }
}
const createFiles = (data, pathName, fileName) => {
  console.log('createFiles  paratemeters', data, pathName, fileName)
  return new Promise((resolve, reject) => {
    try {
      const createFiles = q.defer()
      __logger.info('writing in filepath', { pathName, dir: fileName })
      fs.mkdir(pathName, { recursive: true }, async (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
            __logger.info('folder already exist')
            createFiles.reject()
          } else {
            __logger.error('Error in creating directory', { path: pathName, error: err })
            createFiles.reject('Error in creating directory numbers_csv')
          }
        }
        let rows
        if (!fs.existsSync(fileName)) {
          rows = json2csv(data, { header: true })
        } else {
          // Rows without headers.
          // removing header row
          // data.splice(0,1)
          rows = json2csv(data, { header: false })
        }
        fs.appendFile(fileName, rows, (err) => {
          if (err) throw new Error('error appending file' + fileName)
          __logger.debug('FILE DATA Appended SUCCESSFULLY!: ' + pathName + ' , ' + fileName)
          fs.appendFileSync(fileName, '\r\n')
          rows = []
          resolve(true)
        })
      })
    } catch (err) {
      console.log('createFiles err', err)
      __logger.error('Error in uploadDataInDB ' + err)
      reject(err)
    }
  })
}
// const createFiles = (data, pathName, fileName) => {
// //   const createFiles = q.defer()
// //   const result = json2csv(data, { header: true })
//   fs.writeFile(`${pathName}/${fileName}.csv`, function (err, result) {
//     if (err) console.log('error', err)
//   })
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
            // dbService.getAllUserStatusCountPerDay
            __logger.info('dlr_reports_downloads_queue::received:', { mqData })
            __logger.info('dlr_reports_downloads_queue:: messageData received:', messageData)
            console.log('111111111111111111111111', mqDataReceived)
            console.log('222222222222222222222222', messageData)
            filesPresent(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, messageData.userId)
              .then((presentfile) => {
                console.log('filesPresent data', presentfile)
                if (presentfile) {
                  console.log('5555555555555555555555555555', presentfile)
                  return copyFiles(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, messageData.userId)
                } else {
                  console.log('99999999999999999999999')
                  return dbService.countOfDataAgainstWabaAndUserId(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, messageData.userId)
                }
              })
              .then(async (data) => {
                console.log('********************************', data)
                if (data.count) {
                  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', data.data)
                  const count = data.data || 0
                  const lowLimit = 500000
                  const fileSize = 1000000
                  const part = fileSize / lowLimit
                  let skipPage = 0
                  const numberOfTimes = getNumberOfTimeToGetData(lowLimit, count)
                  for (let i = 0; i < numberOfTimes; i++) {
                    skipPage = i * lowLimit
                    const pathName = '/home/shivamsingh/Desktop/Projects/platform-api/app_modules/download'
                    const fileName = `/part_${messageData.wabaPhoneNumber}_${Math.floor(i / part)}.csv`
                    const data = await dbService.getUserStatusCountPerDayAgainstWaba(messageData.startDate, messageData.endDate, messageData.wabaPhoneNumber, skipPage, lowLimit)
                    const result = json2csv(data, { header: true })
                    fs.writeFile(`${pathName}/${fileName}.csv`, result, function (err, result) {
                      if (err) console.log('error', err)
                    })
                    // await createFiles(data, pathName, fileName)
                  }
                } else {
                  return true
                }
              })
              .then((data) => {
                __logger.info('getAllUserStatusCountPerDay: data', data)
                console.log('sucesssssssssssssssssssssssssssssssssssssssssssssss', data)
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
