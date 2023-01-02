const request = require('request')
const q = require('q')
const __logger = require('../../../lib/logger')
const saveApiLog = require('../../integration/service/saveApiLog')
// const Bottleneck = require('bottleneck/es5')
// const __config = require('../../../config')

class HttpRequestOg {
  constructor (timeout, maxConcurrent, userId) {
    __logger.warn('httpService: :: HttpRequestOg Class Initiated...')
    this.timeInSeconds = timeout || 3 * 60 * 60 * 1000 // hour * minutes * seconds * miliseconds
    // this.rateLimitter = new Bottleneck({
    //   maxConcurrent: maxConcurrent || 10,
    //   id: userId || 'generic',
    //   datastore: 'redis',
    //   clearDatastore: true,
    //   clientOptions: {
    //     host: __config.redis_local.host,
    //     port: __config.redis_local.port,
    //     auth_pass: __config.redis_local.auth_pass
    //   }
    // })
  }

  postDoNotUse (inputRequest, inputReqType, url, headers, serviceProviderId, isJson = null) {
    const deferred = q.defer()
    const options = {
      method: 'POST',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      [inputReqType]: inputRequest,
      json: (isJson === null) ? true : isJson,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      __logger.info('httpService: ::: POST ::: res:', { options, response, body })
      const apiLogUrl = options.url.split('/').slice(3).join('/') || options.url
      saveApiLog(serviceProviderId, apiLogUrl, options, response)
      if (error) {
        __logger.error('httpService: ::: POST ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  getDoNotUse (url, headers, serviceProviderId, encoding = true, isJson = null) {
    const deferred = q.defer()
    const options = {
      method: 'GET',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      json: (isJson === null) ? true : isJson,
      rejectUnauthorized: false
    }
    if (encoding === null) options.encoding = null
    request(options, (error, response, body) => {
      __logger.info('httpService: ::: GET ::: res:', { options, response, body })
      const url = options.url.split('/').slice(3).join('/')
      saveApiLog(serviceProviderId, url, options, response)
      if (error) {
        __logger.error('httpService: ::: GET ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(body)
      }
    })
    return deferred.promise
  }

  getMediaDoNotUse (url, headers, serviceProviderId) {
    const deferred = q.defer()
    const options = {
      method: 'GET',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      rejectUnauthorized: false,
      encoding: 'binary'
    }
    request(options, (error, response, body) => {
      __logger.info('httpService: ::: GET MEDIA ::: res:', { options, response, body })
      const url = options.url.split('/').slice(3).join('/')
      saveApiLog(serviceProviderId, url, options, response)
      if (error) {
        __logger.error('httpService: ::: GET MEDIA ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  patchDoNotUse (inputRequest, url, headers, serviceProviderId) {
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
      __logger.info('httpService: ::: PATCH ::: res:', { options, response, body })
      const url = options.url.split('/').slice(3).join('/')
      saveApiLog(serviceProviderId, url, options, response)
      if (error) {
        __logger.error('httpService: ::: PATCH ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  putDoNotUse (inputRequest, inputReqType, url, headers, isJson, serviceProviderId) {
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
      __logger.info('httpService: ::: PUT ::: res:', { options, response, body })
      const url = options.url.split('/').slice(3).join('/')
      saveApiLog(serviceProviderId, url, options, response)
      if (error) {
        __logger.error('httpService: ::: PUT ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  deleteDoNotUse (url, headers, serviceProviderId) {
    const deferred = q.defer()
    const options = {
      method: 'DELETE',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      json: true,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      __logger.info('httpService: ::: DELETE ::: res:', { options, response, body })
      const url = options.url.split('/').slice(3).join('/')
      saveApiLog(serviceProviderId, url, options, response)
      if (error) {
        __logger.error('httpService: ::: DELETE ::: error:', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  ResolvePostDoNotUse (inputRequest, inputReqType, url, headers, serviceProviderId) {
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
      __logger.info('httpService: ::: RESOLVE POST ::: res:', { options, response, body })
      const apiLogUrl = options.url.split('/').slice(3).join('/') || options.url
      saveApiLog(serviceProviderId, apiLogUrl, options, response)
      if (error) {
        __logger.error('httpService: ::: RESOLVE POST ::: error:', error)
        deferred.resolve({ err: true, error })
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }
}

class HttpRequest extends HttpRequestOg {
  constructor (timeout, maxConcurrent, userId) {
    super(timeout, maxConcurrent, userId)
    this.Get = this.getDoNotUse
    this.Post = this.postDoNotUse
    this.Put = this.putDoNotUse
    this.Patch = this.patchDoNotUse
    this.Delete = this.deleteDoNotUse
    this.resolvePost = this.ResolvePostDoNotUse
    this.getMedia = this.getMediaDoNotUse
  }
}

module.exports = HttpRequest
