const q = require('q')
const UniqueId = require('../../../../lib/util/uniqueIdGenerator')
const _ = require('lodash')
const __db = require('../../../../lib/db')
const queryProvider = require('../queryProvider')
const __constants = require('../../../../config/constants')
class userService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getMasterData (masterdDataId) {
    const masterData = q.defer()
    if (masterdDataId) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMaterData(), [masterdDataId])
        .then(result => {
          if (result && result.length > 0) {
            __db.redis.setex(__constants.MASTERDATA + masterdDataId, JSON.stringify(result[0]), __constants.REDIS_TTL.userConfig)
            masterData.resolve(JSON.stringify(result[0]))
          } else {
            masterData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'No records present with this masterdDataId' })
          }
        })
        .catch((err) => {
          masterData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
    } else {
      masterData.resolve({})
    }
    return masterData.promise
  }

  updateMasterDataByMasterDataId (body, data, userId) {
    const updateMasterDataByMasterDataId = q.defer()
    const updateMasterData = {
      platFormName: body.platformName || data.platFormName,
      businessId: body.businessId || data.businessId,
      systemUserId: body.businessId || data.businessId,
      systemUserToken: body.systemUserToken || data.systemUserToken,
      creditLineId: body.creditLineId || data.creditLineId,
      updatedBy: userId,
      masterdDataId: data.masterdDataId
    }
    const queryParam = []
    _.each(updateMasterData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateMasterDataByMasterDataId(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          updateMasterDataByMasterDataId.resolve(result)
        } else {
          updateMasterDataByMasterDataId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        updateMasterDataByMasterDataId.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return updateMasterDataByMasterDataId.promise
  }

  addMasterData (body, userId) {
    const addMasterDataAdded = q.defer()
    const addBlocklistCategoryData = {
      masterdDataId: __constants.FACEBOOK_MASTERDATA_ID,
      platFormName: body.platformName,
      businessId: body.businessId,
      systemUserId: body.systemUserId,
      systemUserToken: body.systemUserToken,
      creditLineId: body.creditLineId,
      created_by: userId
    }
    const queryParam = []
    _.each(addBlocklistCategoryData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMasterData(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          addMasterDataAdded.resolve(addBlocklistCategoryData)
        } else {
          addMasterDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        let errMessage = ''
        if (err.code === 'ER_DUP_ENTRY') {
          errMessage += 'platform name is already present'
        }
        addMasterDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errMessage ? [errMessage] : err })
      })
    return addMasterDataAdded.promise
  }
}
module.exports = userService
