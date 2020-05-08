const request = require('request')
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
      // console.log('pppppppppppppppppppp', response)
      if (error) {
        console.log('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
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
    // console.log('pppppppppppppppppppp', response)
      if (error) {
        console.log('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }
}

module.exports = HttpRequest
