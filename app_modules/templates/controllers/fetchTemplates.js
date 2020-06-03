const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')

const queryProvider = require('../queryProvider')

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called')

  __db.postgresql.__query(queryProvider.getTemplateList(), [req.query.waba_information_id])
    .then(result => {
      if (result && result.rows && result.rows.length === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: { msg: 'No templates found' } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result.rows })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: { msg: 'Some error occured' } })
    })
}

module.exports = { getTemplateList }
