const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const ValidatonService = require('../services/validation')

class SegmentService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getSegmentDataById (segmentId) {
    // __logger.info('inside get segment data by id service', segmentId)
    const segmentData = q.defer()

    if (segmentId) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getSegmentDataById(), [segmentId])
        .then(result => {
          if (result && result.length > 0) {
            segmentData.resolve(result[0])
          } else {
            segmentData.resolve({})
          }
        })
        .catch(err => {
          __logger.error('error in get segment by id function: ', err)
          segmentData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
        })
    } else {
      segmentData.resolve({})
    }
    return segmentData.promise
  }

  addSegmentData (newData, oldData, userId) {
    // __logger.info('Add Segment service called', newData, oldData)
    const segmenteDataAdded = q.defer()
    const segmentData = {
      segmentId: this.uniqueId.uuid(),
      segmentName: newData.segmentName
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', audienceData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addSegmentData(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          segmenteDataAdded.resolve(segmentData)
        } else {
          segmenteDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => segmenteDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return segmenteDataAdded.promise
  }

  updateSegmentData (newData, oldData, userId) {
    const segmentUpdated = q.defer()

    const segmentData = {
      segmentName: newData.segmentName || oldData.segmentName,
      segmentId: newData.segmentId || oldData.segmentId
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    const validate = new ValidatonService()
    validate.checkUpdateSegmentData(segmentData)
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateSegmentData(), queryParam))
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          segmentUpdated.resolve(segmentData)
        } else {
          segmentUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => segmentUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return segmentUpdated.promise
  }
}

module.exports = SegmentService
