const ValidatonService = require('../services/validation')
const SegmentService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

const addUpdateSegmentData = (req, res) => {
  __logger.info('add update segment API called')
  const validate = new ValidatonService()
  const segmentService = new SegmentService()
  validate.checkAddSegmentData(req.body)
    .then(data => segmentService.getSegmentDataById(req.body.segmentId))
    .then(segmentData => {
      __logger.info('Segment Data then 2', { segmentData })
      if (segmentData.segmentId) {
        return segmentService.updateSegmentData(req.body, segmentData, req.user.user_id)
      } else {
        return segmentService.addSegmentData(req.body, segmentData, req.user.user_id)
      }
    })
    .then(data => {
      __logger.info('data then 3', { data })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateSegmentData }
