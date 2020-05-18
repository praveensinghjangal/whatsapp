const providerConfig = require('../../config').provider_id_to_provider_name_mapping
const providers = { // keep on adding providers here
  messengerPeople: require('./messengerPeople'),
  demo: require('./demo'),
  sinch: require('./sinch')
}
// functions will be called as per provider
class Messaage {
  constructor (providerId) {
    this.providerName = providerConfig[providerId] // id will be fetched from db by on user login and extracted frm jwt and sent here
    this.message = new providers[this.providerName].Messaage()
  }

  sendMessage (businessNumber, recieverNumber, payload) { return this.message.sendMessage(businessNumber, recieverNumber, payload) }
}

class WebHooks {
  constructor () {
    this.sinch = new providers.sinch.Webhooks()
    this.sendSinchPayloadToQUeue = this.sinch.sendToQueue
  }
}

module.exports = { Messaage, WebHooks }
