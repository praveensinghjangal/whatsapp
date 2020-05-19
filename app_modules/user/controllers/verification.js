const __util = require('../../../lib/util')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const VerificationService = require('../services/verification')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const generateEmailVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(+userId, __define.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      if (data && data.email_verified) {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        console.log('need to call update function', data)
        return verificationService.updateExistingTokens(+userId, __define.VERIFICATION_CHANNEL.email.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(+userId, __define.VERIFICATION_CHANNEL.email.name, __define.VERIFICATION_CHANNEL.email.expiresIn, __define.VERIFICATION_CHANNEL.email.codeLength))
    .then(data => verificationService.sendVerificationCodeByEmail(data.code, email, firstName))
    .then(data => __util.send(res, { type: __define.RESPONSE_MESSAGES.EMAIL_VC, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = { generateEmailVerificationCode }
