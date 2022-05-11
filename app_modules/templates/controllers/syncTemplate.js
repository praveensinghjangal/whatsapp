const SyncTemplates = require('../services/syncTemplates')

/**
 * @memberof -Template-Controller-
 * @name Sync-Templates
 * @path {GET} /templates/facebook/sync
 * @description Bussiness Logic :- API to sync templates with templates present in facebook waba account
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, Internal API will work on static token.
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/GetTemplateCategories%7CgetMessageStatusList}
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - In response api will only acknowledge the request and will return 202 accepted.
 * @code {202} returns accepted.
 * @author Danish Galiyara 11th May, 2022
 * *** Last-Updated :- Danish Galiyara 11th May, 2022 ***
 */

const controller = (req, res) => {
  const syncTemplates = new SyncTemplates(req.body.wabaNumber, req.body.serviceProviderId, req.body.userId, req.body.wabaid, req.headers.vivaReqId)
  syncTemplates.sync()
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

module.exports = { controller }
