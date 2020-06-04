const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called')
  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: [] })
}

const getTemplateTypes = (req, res) => {
  __logger.info('Get Templates Type API Called')

  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.TEMPLATE_TYPE })
}

module.exports = { getTemplateList, getTemplateTypes }
