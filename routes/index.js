/**
 *
 * @author deepak.ambekar [6/19/2017].
 */

const serveStatic = require('serve-static')
const auth = require('../lib/auth')
const dateUtil = require('date-format-utils')
const __config = require('../config')
const __logger = require('../lib/logger')
const basic_api = require('../app_modules/api')
const passport = require('passport')
const login = require('../app_modules/api/login/route')
const __db = require('../lib/db')
const user_config = require('../app_modules/api/user_config')
const user_module = require('../app_modules/api/user_module/route')
const template_module = require('../app_modules/api/template/route')
const senderid_module = require('../app_modules/api/senderid/route')
const test_numbers_module = require('../app_modules/api/test_numbers/route')
const message = require('../app_modules/message/route')
const user = require('../app_modules/user/route')

module.exports = function (app) {
  // region all api
  app.all('*', function (request, response, next) {
    const uuid = request.id
    request.req_ip = (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',').shift().trim() : request.ip)
    const startTime = new Date()
    request.req_t = startTime
    __logger.debug(uuid + '=> API REQUEST:: ', { req_ip: request.req_ip, uri: request.originalUrl, req_t: dateUtil.formatDate(startTime, 'yyyy-MM-dd HH:mm:ss.SSS') })
    response.on('finish', function () {
      const endTime = new Date()
      const responseTime = endTime - startTime
      __logger.debug(uuid + '=> API RESPONSE:: ', { req_ip: request.req_ip, uri: request.originalUrl, req_t: dateUtil.formatDate(startTime, 'yyyy-MM-dd HH:mm:ss.SSS'), res_t: dateUtil.formatDate(endTime, 'yyyy-MM-dd HH:mm:ss.SSS'), res_in: (responseTime / 1000) + 'sec' })
    })
    next()
  })
  // endregion

  // region api routes
  const apiUrlPrefix = '/' + __config.api_prefix + '/api'
  // app.all(api_url_prefix + "/*", [auth.authenticate]);
  // app.use("/", new_api);

  app.use('/', basic_api)
  app.use('/api', login)
  // app.use(passport.authenticate('jwt', { session: true, failureRedirect: '/unauthorized' }));
  // app.use(user_config.get_set_user_config);
  app.use('/api/user_info', user_module)
  app.use('/api/template', template_module)
  app.use('/api/senderid', senderid_module)
  app.use('/api/test_numbers', test_numbers_module)
  app.use(apiUrlPrefix + '/message', message)
  app.use(apiUrlPrefix + '/users', user)

  // app.use(api_url_prefix + '/sms-email/', require('../app_modules/sms_email/route'));
  // endregion
  // app.all("*", function(req, res, next){
  //     res.status(404).json({message: "Not Found"});
  // });
  require('../lib/swagger')(app, '/' + __config.api_prefix + __config.authConfig.apiAuthAlias) // todo handle '/' add in prefix after git access
}
