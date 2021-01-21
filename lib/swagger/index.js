var _ = require('lodash')
var SwaggerUi = require('./swagger-ui-express')
const YAML = require('yamljs')
const swaggerInternalDocument = YAML.load('./lib/swagger/doc/internal.yaml')
const __config = require('../../config')
const __logger = require('../logger')
const express = require('express')
swaggerInternalDocument.host = '/'
swaggerInternalDocument.basePath = ''
swaggerInternalDocument.schemes = [__config.base_url.split('://')[0]]
const swaggerPublicDocument = JSON.parse(JSON.stringify(swaggerInternalDocument))
const __constants = require('../../config/constants')

swaggerPublicDocument.paths = {}
swaggerPublicDocument.tags = []
let pubTagNameArr = []
_.each(swaggerInternalDocument.paths, (pathObj, pathName) => {
  // console.log(']]]]]]]]]]]]]]]]]]]', pathObj)
  // __logger.info('path--->', pathName)
  _.each(pathObj, async (methodObj, methodName) => {
    let hostName = __config.swaggerUrl[methodObj['x-module']] ? __config.swaggerUrl[methodObj['x-module']] : __config.swaggerUrl.platform
    hostName = hostName.split('://')[1]
    if (methodObj && methodObj['x-isPublic'] === true) {
      pubTagNameArr.push(methodObj.tags)
      if (swaggerPublicDocument.paths[pathName]) {
        swaggerPublicDocument.paths[hostName + pathName][methodName] = methodObj
      } else {
        swaggerPublicDocument.paths[hostName + pathName] = { [methodName]: methodObj }
      }
    }
    delete swaggerInternalDocument.paths[pathName]
    swaggerInternalDocument.paths[hostName + pathName] = { [methodName]: methodObj }
  })
})
pubTagNameArr = [].concat(...pubTagNameArr)
_.each(pubTagNameArr, pubTagName => {
  const tagObj = _.find(swaggerInternalDocument.tags, { name: pubTagName })
  if (tagObj)swaggerPublicDocument.tags.push(tagObj)
})
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
    __logger.info('request token', apiKey)
    var host = request.headers['x-forwarded-host'] || request.headers.host || ''
    if (host.indexOf(__config.port) <= -1) {
      __logger.info('Unauthorized request for server doc', { m: __m, req_id: request.id, ip_address: request.req_ip, host: host })
      return response.send('Unauthorized')
    }
    __logger.info('got request for server doc', { m: __m, req_id: request.id, ip_address: request.req_ip, host: host })
    if (_.isEmpty(apiKey)) { response.send('Unauthorized') } else if (apiKey === __config.authConfig.serverDocAccessKey) { next() } else { response.send('Unauthorized') }
  })
  var swaggerUiServer = new SwaggerUi()
  var swaggerUiServerInternal = new SwaggerUi()
  app.use(routeUrlPrefix + '/internal-docs/:server_doc_api_key/jsdocs', express.static(__constants.PUBLIC_FOLDER_PATH + '/js-docs'))
  app.use(routeUrlPrefix + '/internal-docs/:server_doc_api_key', swaggerUiServerInternal.serve, swaggerUiServerInternal.setup(swaggerInternalDocument, swaggerOptions))
  app.use(routeUrlPrefix + '/docs', swaggerUiServer.serve, swaggerUiServer.setup(swaggerPublicDocument, swaggerOptions))
  // endregion
  __logger.info('Initializing swagger doc Routes Completed')
}
