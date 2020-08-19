const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')

module.exports = (req, res) => {
  __logger.info('get event types API called')
  return __util.send(res, {
    type: __constants.RESPONSE_MESSAGES.SUCCESS,
    data: _.keys(__constants.FLOW_MESSAGE_DB_EVENTS_TO_CODE_EVENTS)
  })
}
