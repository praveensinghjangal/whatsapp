/**
 *
 * @author deepak.ambekar [8/9/2018].
 */

var _ = require("lodash");
var swaggerUi = require('./swagger-ui-express');
const YAML = require('yamljs');
const swaggerServerDocument = YAML.load('./lib/swagger/doc/server.yaml');
const swaggerClientDocument = YAML.load('./lib/swagger/doc/client.yaml');
const __config = require('../../config');
const __logger = require('../logger');

swaggerServerDocument.host = swaggerClientDocument.host = __config.base_url;

var swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }  .swagger-ui section.models {display: none} ' +
    '#operations-SSP-sspsent .try-out__btn ,#operations-SSP-ssppingback .try-out__btn{ display: none } ' +
    '#operations-Cron-cronarchive .try-out__btn ,#operations-Cron-optimizePartitionSize .try-out__btn{ display: none }',
    customfavIcon: "/favicon.ico",
    customSiteTitle: "Helo API Documentation"
};
// urls: [{url: "<url1>", name: "<name1>"},{url: "<url2>", name: "<name2>"}]
module.exports = (app, route_url_prefix) => {

    //region swagger server api doc
    app.use(route_url_prefix + '/docs/:server_doc_api_key/*', function (request, response, next) {
        var __m = 'mod_api_auth.validate_server_doc_api_key';
        var api_key = request.params.server_doc_api_key ? request.params.server_doc_api_key : "";
        var host = request.headers['x-forwarded-host'] || request.headers.host || "";
        if (host.indexOf(__config.port) <= -1) {
            __logger.warn('Unauthorized request for server doc', {m: __m, req_id: request.id, ip_address: request.req_ip, host: host});
            return response.send("Unauthorized");
        }
        __logger.debug('got request for server doc', {m: __m, req_id: request.id, ip_address: request.req_ip, host: host});
        if (_.isEmpty(api_key))
            response.send("Unauthorized");
        else if (api_key == __config.authConfig.serverDocAccessKey)
            next();
        else
            response.send("Unauthorized");
    });
    var swaggerUiServer = new swaggerUi();
    app.use(route_url_prefix + '/docs/:server_doc_api_key', swaggerUiServer.serve, swaggerUiServer.setup(swaggerServerDocument, swaggerOptions));
    //endregion
    __logger.debug("Initializing swagger doc Routes Completed");

};