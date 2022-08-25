const providerConfig = require('../../config').provider_config
const providers = { // keep on adding providers here
  demo: require('./demo'),
  tyntec: require('./tyntec'),
  facebook: require('./facebook')
}
// functions will be called as per provider
class Messaage {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.message = new providers[this.providerName].Messaage(maxConcurrent, userId)
  }

  sendMessage (payload) { return this.message.sendMessage(payload) }

  getMedia (wabaNumber, mediaId) { return this.message.getMedia(wabaNumber, mediaId) }
}

class Template {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.template = new providers[this.providerName].Template(maxConcurrent, userId)
  }

  addTemplate (data, wabaNumber) { return this.template.addTemplate(data, wabaNumber) }

  getTemplateList (wabaNumber, mapData) { return this.template.getTemplateList(wabaNumber, mapData) }

  getTemplateInfo (wabaNumber, templateId, queryParam) { return this.template.getTemplateInfo(wabaNumber, templateId, queryParam) }

  deleteTemplate (wabaNumber, templateId) { return this.template.deleteTemplate(wabaNumber, templateId) }
}

class WabaAccount {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.wabaAccount = new providers[this.providerName].WabaAccount(maxConcurrent, userId)
  }

  getAccountInfo (wabaNumber) { return this.wabaAccount.getAccountInfo(wabaNumber) }

  updateProfilePic (wabaNumber, profilePic, contentType) { return this.wabaAccount.updateProfilePic(wabaNumber, profilePic, contentType) }

  getProfilePic (wabaNumber) { return this.wabaAccount.getProfilePic(wabaNumber) }

  getAccountPhoneNoList (wabaNumber) { return this.wabaAccount.getAccountPhoneNoList(wabaNumber) }

  getCurrentProfile (wabaNumber) { return this.wabaAccount.getCurrentProfile(wabaNumber) }

  updateProfile (wabaNumber, bodyData) { return this.wabaAccount.updateProfile(wabaNumber, bodyData) }

  setWebhook (wabaNumber, incomingMessageUrl, statusUrl) { return this.wabaAccount.setWebhook(wabaNumber, incomingMessageUrl, statusUrl) }
}

class Authentication {
  constructor (providerId, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.authentication = new providers[this.providerName].Authentication(userId)
  }

  getFaceBookTokensByWabaNumber (wabaNumber) { return this.authentication.getFaceBookTokensByWabaNumber(wabaNumber) }
  setFaceBookTokensByWabaNumber (wabaNumber) { return this.authentication.setFaceBookTokensByWabaNumber(wabaNumber) }
}

class Audience {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.audience = new providers[this.providerName].Audience(maxConcurrent, userId)
  }

  saveOptin (wabaNumber, payload) { return this.audience.saveOptin(wabaNumber, payload) }
}

class EmbeddedSignup {
  constructor (providerId, userId, authorizationToken, accessToken) {
    this.providerName = 'facebook'
    this.embeddedSignup = new providers[this.providerName].EmbeddedSignup(providerId, userId, authorizationToken, accessToken)
  }

  getWabaOfClient (inputToken, wabaNumber) { return this.embeddedSignup.getWabaOfClient(inputToken, wabaNumber) }

  //! we wont be using this, as we will put the system user id in env
  getBSPsSystemUserIds (wabaNumber, businessId) { return this.embeddedSignup.getBSPsSystemUserIds(wabaNumber, businessId) }

  getWabaDetailsByWabaId (wabaId, wabaNumber) { return this.embeddedSignup.getWabaDetailsByWabaId(wabaId, wabaNumber) }

  addSystemUserToWabaOfClient (systemUserIdBSP, wabaIdOfClient, wabaNumber) { return this.embeddedSignup.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, wabaNumber) }

  getBussinessIdLineOfCredit (businessId) { return this.embeddedSignup.getBussinessIdLineOfCredit(businessId) }

  attachCreditLineClientWaba (assignedWabaId, creditLineId) { return this.embeddedSignup.attachCreditLineClientWaba(assignedWabaId, creditLineId) }

  verifyLineOfCredit (allocationConfigId) { return this.embeddedSignup.verifyLineOfCredit(allocationConfigId) }
  subscribeAppToWaba (wabaIdOfClient, wabaNumber) { return this.embeddedSignup.subscribeAppToWaba(wabaIdOfClient, wabaNumber) }
  fetchAssignedUsersOfWaba (wabaIdOfClient, businessId, wabaNumber) { return this.embeddedSignup.fetchAssignedUsersOfWaba(wabaIdOfClient, businessId, wabaNumber) }
  getPhoneNumberOfWabaId (wabaIdOfClient, wabaNumber) { return this.embeddedSignup.getPhoneNumberOfWabaId(wabaIdOfClient, wabaNumber) }
  requestCode (wabizUrl, token, phoneCode, phoneNumber, phoneCertificate, tfaPin) { return this.embeddedSignup.requestCode(wabizUrl, token, phoneCode, phoneNumber, phoneCertificate, tfaPin) }
  getSettings (wabizUrl, token) { return this.embeddedSignup.getSettings(wabizUrl, token) }
  enableTwoStepVerification (wabizUrl, token, tfaPin) { return this.embeddedSignup.enableTwoStepVerification(wabizUrl, token, tfaPin) }
}

module.exports = { Messaage, Template, WabaAccount, Authentication, Audience, EmbeddedSignup }
