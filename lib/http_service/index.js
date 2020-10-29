const request = require('request')
var __logger = require('../../lib/logger')
const q = require('q')
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
      // __logger.info('pppppppppppppppppppp', response.statusCode)
      if (error) {
        __logger.info('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  Get (url, headers) {
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
      if (error) {
        deferred.reject(error)
      } else {
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
    // __logger.info('pppppppppppppppppppp', response)
      if (error) {
        __logger.info('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }

  Put (inputRequest, inputReqType, url, headers, isJson) {
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
      __logger.info('response from api ', error, response, body)
      if (error) {
        __logger.error('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }
}

module.exports = HttpRequest
