const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called')
  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: [] })
}

module.exports = { getTemplateList }
