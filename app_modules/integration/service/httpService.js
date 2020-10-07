const request = require('request')
const q = require('q')
const __logger = require('../../../lib/logger')
const saveApiLog = require('../../integration/service/saveApiLog')
class HttpRequest {
  constructor (timeout) {
    this.timeInSeconds = timeout || 3 * 60 * 60 * 1000 // hour * minutes * seconds * miliseconds
  }

  Post (inputRequest, inputReqType, url, headers) {
    const deferred = q.defer()
    const options = {
      method: 'POST',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      [inputReqType]: inputRequest,
      json: true,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      // console.log('pppppppppppppppppppp', response.statusCode)
      if (error) {
        __logger.error('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  Get (url, headers, serviceProviderId) {
    const deferred = q.defer()
    const options = {
      method: 'GET',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      json: true,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      const url = options.url.split('/').slice(3).join('/')
      if (error) {
        deferred.reject(error)
      } else {
        saveApiLog(serviceProviderId, url, options, response)
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }

  Patch (inputRequest, url, headers) {
    const deferred = q.defer()
    const options = {
      method: 'PATCH',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      body: inputRequest,
      json: true,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
    // console.log('pppppppppppppppppppp', response)
      if (error) {
        __logger.error('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }

  Put (inputRequest, inputReqType, url, headers, isJson, serviceProviderId) {
    const deferred = q.defer()
    const options = {
      method: 'PUT',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      [inputReqType]: inputRequest,
      json: isJson,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      const url = options.url.split('/').slice(3).join('/')
      if (error) {
        __logger.error('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        saveApiLog(serviceProviderId, url, options, response)
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }
}

module.exports = HttpRequest
