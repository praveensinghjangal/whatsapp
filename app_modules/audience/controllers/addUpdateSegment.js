const ValidatonService = require('../services/validation')
const SegmentService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

/**
 * @namespace -Whatsapp-Audience-Controller-Add-Segment-Data-
 * @description API’s related to whatsapp audience.
 */
/**
 * @memberof -Whatsapp-Audience-Controller-Add-Segment-Data-
 * @name AddUpdateSegmentData
 * @path {POST} /optin/segment
 * @description Bussiness Logic :- API to add or update segment, To add segment do not pass segmentId to update segment pass segment ID along with parameters to update.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
   <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/AddUpdateSegmentData|AddUpdateSegmentData}
 * @body {string}  segmentId=f194da3d-0b62-405e-a512-95797f4bcf41 - Please provide the valid segment Id.
 * @body {string}  segmentName=test - please provide the valid segment name
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - After add/update of segment, It will return the object containing segmentName and segmentId.
 * @code {200} if the msg is success than it Returns the Status of segment info completion.
 * @author Arjun Bhole 16th July, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

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
