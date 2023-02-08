const q = require('q')
const __constants = require('../../config/constants')
const __logger = require('../../lib/logger')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const BusinessServices = require('../../app_modules/whatsapp_business/services/businesAccount')
const qalllib = require('qalllib')
const HttpService = require('../../lib/http_service')

const checkPinBackConfig = (wabizDetails) => {
  const http = new HttpService(60000)
  const headers = { Authorization: `Bearer ${wabizDetails.apiKey}` }
  const url = wabizDetails.wabizBaseUrl + '/v1/settings/application'
  const statusUpdated = q.defer()
  http.Get(url, headers)
    .then(processed => {
      if (processed && processed.settings && processed.settings.application && processed.settings.application.webhooks && processed.settings.application.webhooks.url) {
        statusUpdated.resolve(true)
      } else {
        const reason = `${wabizDetails.wabaPhoneNumber} : ${wabizDetails.businessName} Business name pin back url configuration not set`
        const telegramErrMessage = 'checkPinBackConfig: facebook error :  check wabiz url config  cron function::error :: catch'
        errorToTelegram.send(reason, telegramErrMessage)
        statusUpdated.resolve(false)
      }
    })
    .catch(err => {
      __logger.error('checkPinBackConfig:  facebook error :  check wabiz url config  : catch:', err)
      const telegramErrorMessage = 'checkPinBackConfig: facebook error :  check wabiz url config  cron function::error :: catch'
      errorToTelegram.send(err, telegramErrorMessage)
      statusUpdated.reject(false)
    })
  return statusUpdated.promise
}

const checkWabizUrlConfig = () => {
  const businessServices = new BusinessServices()
  const statusUpdated = q.defer()
  businessServices.getWabizInfo()
    .then(result => {
      return qalllib.qASyncWithBatch(checkPinBackConfig, result, __constants.PIN_BACK_CONFIG_COUNT, '')
    })
    .then(processed => {
      if (processed && processed.reject && processed.reject.length === 0) {
        __logger.info('successfully processed data ~function=checkPinBackConfig')
        statusUpdated.resolve(true)
      } else {
        __logger.info('unsuccessfull processed data with errors ~function=checkPinBackConfig')
        statusUpdated.resolve(false)
      }
    })
    .catch(err => {
      __logger.error('SCHEDULER:: checkWabizUrlConfig: db.init(): catch:', err)
      const telegramErrorMessage = 'checkWabizUrlConfig: facebook error :  check wabiz url config  cron function::error :: catch'
      errorToTelegram.send(err, telegramErrorMessage)
      statusUpdated.resolve(false)
    })
  return statusUpdated.promise
}
module.exports = checkWabizUrlConfig
