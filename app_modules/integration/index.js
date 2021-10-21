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

  getTemplateList (wabaNumber) { return this.template.getTemplateList(wabaNumber) }

  getTemplateInfo (wabaNumber, templateId, queryParam) { return this.template.getTemplateInfo(wabaNumber, templateId, queryParam) }

  deleteTemplate (wabaNumber, templateId) { return this.template.deleteTemplate(wabaNumber, templateId) }
}

class WabaAccount {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.wabaAccount = new providers[this.providerName].WabaAccount(maxConcurrent, userId)
  }

  getAccountInfo (wabaNumber) { return this.wabaAccount.getAccountInfo(wabaNumber) }

  updateProfilePic (wabaNumber, profilePic) { return this.wabaAccount.updateProfilePic(wabaNumber, profilePic) }

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
}

class Audience {
  constructor (providerId, maxConcurrent, userId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    // this.providerName = 'facebook'
    this.audience = new providers[this.providerName].Audience(maxConcurrent, userId)
  }

  saveOptin (wabaNumber, payload) { return this.audience.saveOptin(wabaNumber, payload) }
}

module.exports = { Messaage, Template, WabaAccount, Authentication, Audience }
