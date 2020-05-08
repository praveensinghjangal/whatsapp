const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const messengerPeopleIntegrationConfig = __config.integration.messengerPeople
const authToken = require('./authenticator').authToken // todo remove

class Message {
  constructor () {
    this.http = new HttpService(60000)
    // console.log('=======', messengerPeopleIntegrationConfig)
  }

  sendMessage (businessNumber, recieverNumber, payload) {
    const deferred = q.defer()
    const inputRequest = {
      identifier: businessNumber + ':' + recieverNumber,
      payload: payload
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authToken.getAuthToken()
    }
    this.http.Post(inputRequest, 'body', messengerPeopleIntegrationConfig.baseUrl + messengerPeopleIntegrationConfig.endpoint.sendMessage, headers)
      .then(apiRes => {
        console.log('datatattatatattatatat', apiRes)
        if (apiRes && apiRes.hint && apiRes.hint === 'The request has not been authenticated.') {
          return authToken.setToken()
        } else {
          console.log('successs-------------')
          return { firstAttempSuccess: true, data: apiRes }
        }
      })
      .then(data => {
        if (data.firstAttempSuccess) {
          console.log('i am hererererrererererrere')
          return data
        } else {
          headers.Authorization = 'Bearer ' + authToken.getAuthToken()
          console.log('new token set retru now')
          return this.http.Post(inputRequest, 'body', messengerPeopleIntegrationConfig.baseUrl + messengerPeopleIntegrationConfig.endpoint.sendMessage, headers)
        }
      })
      .then(finalRes => {
        if (finalRes.firstAttempSuccess) finalRes = finalRes.data
        console.log('final res --->', finalRes)
        if (finalRes && finalRes.error) {
          deferred.reject({ success: false, message: 'Message not sent', error: finalRes })
        } else {
          deferred.reject({ success: true, message: 'Message sent', data: finalRes })
        }
      })
      .catch(err => deferred.reject({ success: false, message: 'Error while sending message', error: err }))
    return deferred.promise
  }
}

module.exports = Message
