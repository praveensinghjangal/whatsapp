
const ValidatonService = require('../services/validation')
const __util = require('../../../../lib/util')
const __constants = require('../../../../config/constants')
// const __logger = require('../../../lib/logger')
const UserService = require('../services/dbData')
const redisCommonFunction = require('../../../../lib/commonFunction/redisFunction')
// const UtilService = require('../../../lib/util/services/dbData')
// const passMgmt = require('../../../lib/util/password_mgmt')
// const authMiddleware = require('../../../middlewares/auth/authentication')
// const rejectionHandler = require('../../../lib/util/rejectionHandler')
// const keysToEncrypt = require('../../../lib/logger/keysToEncrypt.json')

/**
 * @memberof -facebook-
 * @name addUpadateMasterData
 * @path {Post} /apitoken
 * @description Bussiness Logic :- API to generate jwt token.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
   <br/><br/><b>API Documentation : </b> {@link https://stage-iam.helo.ai/iam/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/authenticate/apitoken|ApiToken}
 * @body {string}  routes=:["post/heloiam/api/authenticate/apitoken/"]
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data.apicode  - It will return a jwt token
 * @code {200} if the msg is success than it return the backup codes in response.
 * @author Shivam Singh 21st April,2022
 * *** Last-Updated :- Shivam Singh 21st April,2022 ***
 */

const addUpdateMasterData = (req, res) => {
  if (req.user.userRoleId !== __constants.SUPPORT_ROLE_ID) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCESS_DENIED, err: [] })
  }
  const validate = new ValidatonService()
  const userService = new UserService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validation = req.body.masterdDataId ? validate.updateMasterData(req.body) : validate.addMasterData(req.body)
  validation
    .then(() => {
      return redisCommonFunction.getMasterRedisDataStatusById(req.body.masterdDataId)
    })
    .then((data) => {
      if (data && data.data.masterdDataId && data.exists === true) {
        return userService.updateMasterDataByMasterDataId(req.body, data.data, userId)
      } else {
        return userService.addMasterData(req.body, userId)
      }
    })
    .then((data) => {
      return redisCommonFunction.deleteMasterDataInRedis(__constants.MASTERDATA + __constants.FACEBOOK_MASTERDATA_ID)
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch((err) => {
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err, data: err.data })
    })
}

const getMasterDataById = (req, res) => {
  if (req.user.userRoleId !== __constants.SUPPORT_ROLE_ID) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_VALID_ROLE_ASSIGNED, err: [] })
  }
  const userService = new UserService()
  userService.getMasterData(__constants.FACEBOOK_MASTERDATA_ID)
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = {
  addUpdateMasterData, getMasterDataById
}
