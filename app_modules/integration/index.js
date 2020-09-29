const providerConfig = require('../../config').provider_config
const providers = { // keep on adding providers here
  demo: require('./demo'),
  tyntec: require('./tyntec')
}
// functions will be called as per provider
class Messaage {
  constructor (providerId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.message = new providers[this.providerName].Messaage()
  }

  sendMessage (payload) { return this.message.sendMessage(payload) }
}

class Template {
  constructor (providerId) {
    this.providerName = providerConfig[providerId].name // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.template = new providers[this.providerName].Template()
  }

  addTemplate (data, wabaNumber) { return this.template.addTemplate(data, wabaNumber) }

  getTemplateList (wabaNumber) { return this.template.getTemplateList(wabaNumber) }

  getTemplateInfo (wabaNumber, templateId) { return this.template.getTemplateInfo(wabaNumber, templateId) }
}

module.exports = { Messaage, Template }
