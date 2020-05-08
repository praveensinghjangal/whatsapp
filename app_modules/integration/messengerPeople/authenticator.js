const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const messengerPeopleIntegrationConfig = __config.integration.messengerPeople
class Authentication {
  constructor () {
    this.http = new HttpService(60000)
  }

  callAuthApi (clientData) {
    const deferred = q.defer()
    const inputRequest = {
      grant_type: clientData.grantType,
      client_id: clientData.clientId,
      client_secret: clientData.clientSecret,
      scope: clientData.scope
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    this.http.Post(inputRequest, 'form', messengerPeopleIntegrationConfig.authBaseUrl + messengerPeopleIntegrationConfig.endpoint.token, headers)
      .then(data => {
        if (data && data.access_token) {
          deferred.resolve({ success: true, message: 'token fetched successfully', token: data.access_token })
        } else {
          deferred.reject({ success: false, message: 'no token returned', data: {} })
        }
      })
      .catch(err => deferred.reject({ success: false, message: 'Error while fetching token', error: err }))
    return deferred.promise
  }
}

class AuthToken {
  constructor () {
    this.token = ''
    this.authentication = new Authentication()
  }

  getAuthToken () {
    return this.token
  }

  setToken () {
    const deferred = q.defer()
    const clientData = messengerPeopleIntegrationConfig.clientData
    this.authentication.callAuthApi(clientData)
      .then(data => {
        if (data.success && data.token) {
          this.token = data.token
        }
        deferred.resolve(data)
      })
      .catch(err => {
        deferred.reject(err)
      })
    return deferred.promise
  }
}

module.exports = { authToken: new AuthToken() }
