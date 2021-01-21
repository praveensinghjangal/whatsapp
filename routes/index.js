const dateUtil = require('date-format-utils')
const __config = require('../config')
const __logger = require('../lib/logger')
const message = require('../app_modules/message/route')
const user = require('../app_modules/user/route')
const places = require('../app_modules/places/route')
const whatsappBusiness = require('../app_modules/whatsapp_business/route')
const webHooks = require('../app_modules/web_hooks/route')
const templates = require('../app_modules/templates/route')
const plans = require('../app_modules/plans/route')
const audience = require('../app_modules/audience/route')
const frontEnd = require('../app_modules/front_end/route')

module.exports = function (app) {
  // region all api
  app.all('*', function (request, response, next) {
    const uuid = request.id
    request.req_ip = (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',').shift().trim() : request.ip)
    const startTime = new Date()
    request.req_t = startTime
    __logger.info(uuid + '=> API REQUEST:: ', { req_ip: request.req_ip, uri: request.originalUrl, req_t: dateUtil.formatDate(startTime, 'yyyy-MM-dd HH:mm:ss.SSS') })
    response.on('finish', function () {
      const endTime = new Date()
      const responseTime = endTime - startTime
      __logger.info(uuid + '=> API RESPONSE:: ', { req_ip: request.req_ip, uri: request.originalUrl, req_t: dateUtil.formatDate(startTime, 'yyyy-MM-dd HH:mm:ss.SSS'), res_t: dateUtil.formatDate(endTime, 'yyyy-MM-dd HH:mm:ss.SSS'), res_in: (responseTime / 1000) + 'sec' })
    })
    next()
  })
  // endregion

  // region api routes
  const apiUrlPrefix = '/' + __config.api_prefix + '/api'
  app.use(apiUrlPrefix + '/chat/v1/messages', message)
  app.use(apiUrlPrefix + '/users', user)
  app.use(apiUrlPrefix + '/places', places)
  app.use(apiUrlPrefix + '/business', whatsappBusiness)
  app.use(apiUrlPrefix + '/web-hooks', webHooks)
  app.use(apiUrlPrefix + '/templates', templates)
  app.use(apiUrlPrefix + '/plans', plans)
  app.use(apiUrlPrefix + '/audience', audience)
  app.use(apiUrlPrefix + '/frontEnd', frontEnd)

  require('../lib/swagger')(app, '/' + __config.api_prefix + '/api')
}
