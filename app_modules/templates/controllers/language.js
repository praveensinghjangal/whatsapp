const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

/**
 * @memberof -Template-Controller-
 * @name GetTemplateLanguages
 * @path {GET} /templates/languages
 * @description Bussiness Logic :- API to get list of languages available with helo-whatsapp
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/templatelanguagesdropdown|GetTemplateLanguages}
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - In response it return messageTemplateLanguageId and languageName.
 * @code {200} if the msg is success than it Returns List of all languages
 * @author Arjun Bhole 4th June, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

// Get Template Languages
const getTemplateLanguages = (req, res) => {
  __logger.info('Inside getTemplateLanguages', req.user.userId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateLanguages(), [])
    .then(results => {
      __logger.info('Then 1')
      if (results && results.length > 0) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SUCCESS,
          data: results
        })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateLanguages }
