/**
 *
 * @author deepak.ambekar [8/9/2018].
 */

var _ = require('lodash')
var SwaggerUi = require('./swagger-ui-express')
const YAML = require('yamljs')
const swaggerInternalDocument = YAML.load('./lib/swagger/doc/internal.yaml')
const swaggerPublicDocument = YAML.load('./lib/swagger/doc/public.yaml')
const __config = require('../../config')
const __logger = require('../logger')

swaggerInternalDocument.host = swaggerPublicDocument.host = __config.base_url.split('://')[1]
swaggerInternalDocument.schemes = swaggerPublicDocument.schemes = [__config.base_url.split('://')[0]]
swaggerInternalDocument.basePath = swaggerPublicDocument.basePath = '/' + __config.api_prefix + '/api'

var swaggerOptions = {
  customCss: '.swagger-ui .topbar-wrapper img {content:url("https://helo.co.in/images/logo.png");} .swagger-ui section.models {display: none} ' +
     `.swagger-ui .topbar {
        padding: 8px 0;
        background-color: red;
    }
    .swagger-ui .topbar a span{
        text-indent: -9999px;
        line-height: 0;
    }
    .swagger-ui .topbar a span::after{
        content: "API Documentation";
        text-indent: 0;
        display: block;
        line-height: initial; 
    }
    .swagger-ui .info {
        margin-top: 0px;
        }` +
    '#operations-SSP-sspsent .try-out__btn ,#operations-SSP-ssppingback .try-out__btn{ display: none } ' +
    '#operations-Cron-cronarchive .try-out__btn ,#operations-Cron-optimizePartitionSize .try-out__btn{ display: none }',
  customfavIcon: '/favicon.ico',
  customSiteTitle: 'Helo-Whatsapp API Documentation'
}
// urls: [{url: "<url1>", name: "<name1>"},{url: "<url2>", name: "<name2>"}]
module.exports = (app, routeUrlPrefix) => {
  // region swagger server api doc
  app.use(routeUrlPrefix + '/internal-docs/:server_doc_api_key/*', function (request, response, next) {
    var __m = 'mod_api_auth.validate_server_doc_api_key'
    var apiKey = request.params.server_doc_api_key ? request.params.server_doc_api_key : ''
    var host = request.headers['x-forwarded-host'] || request.headers.host || ''
    if (host.indexOf(__config.port) <= -1) {
      __logger.warn('Unauthorized request for server doc', { m: __m, req_id: request.id, ip_address: request.req_ip, host: host })
      return response.send('Unauthorized')
    }
    __logger.debug('got request for server doc', { m: __m, req_id: request.id, ip_address: request.req_ip, host: host })
    if (_.isEmpty(apiKey)) { response.send('Unauthorized') } else if (apiKey === __config.authConfig.serverDocAccessKey) { next() } else { response.send('Unauthorized') }
  })
  var swaggerUiServer = new SwaggerUi()
  var swaggerUiServerInternal = new SwaggerUi()
  app.use(routeUrlPrefix + '/internal-docs/:server_doc_api_key', swaggerUiServer.serve, swaggerUiServer.setup(swaggerInternalDocument, swaggerOptions))
  app.use(routeUrlPrefix + '/docs', swaggerUiServerInternal.serve, swaggerUiServerInternal.setup(swaggerPublicDocument, swaggerOptions))
  // endregion
  __logger.debug('Initializing swagger doc Routes Completed')
}
