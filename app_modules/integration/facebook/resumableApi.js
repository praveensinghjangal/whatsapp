const q = require('q')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const HttpService = require('../service/httpService')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
class ResumableApi {
  constructor () {
    this.imageBuffer = {}
    this.imagelength = 0
    this.fileOffset = 0
    this.http = new HttpService()
  }

  getUploadAfterSession (sessionToken, accessToken) {
    __logger.info('Inside getUploadAfterSession in resumable api')
    const deferred = q.defer()
    const api = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}/${sessionToken}`
    const headers = {
      Authorization: `OAuth ${accessToken}`
    }
    this.http.Get(api, headers).then((apiResponse) => {
      if (apiResponse.file_offset) {
        this.fileOffset = apiResponse.file_offset
      }
      deferred.resolve(this.fileOffset)
    }).catch((err) => {
      __logger.error('error inside getUploadAfterSession : ', err)
      deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
    return deferred.promise
  }

  postUploadAfterSession (sessionToken, accessToken, fileType) {
    __logger.info('Inside postUploadAfterSession in resumable api')
    const deferred = q.defer()
    const api = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}/${sessionToken}`
    const headers = {
      Authorization: `OAuth ${accessToken}`,
      'Content-Type': fileType,
      file_offset: this.fileOffset
    }
    const body = this.imageBuffer
    this.http.Post(body, 'body', api, headers, __config.service_provider_id.facebook, false)
      .then((apiresponse) => {
        deferred.resolve(apiresponse)
      })
      .catch((err) => {
        __logger.error('error inside postUploadAfterSession : ', err)
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  async uploadAfterSession (sessionToken, accessToken, fileType) {
    __logger.info('Inside uploadAfterSession  in resumable api')
    let fileHandleData = ''
    while (this.imagelength - this.fileOffset > 0) {
      try {
        const responseOfPostUpload = await this.postUploadAfterSession(sessionToken, accessToken, fileType)
        const parsedResponse = responseOfPostUpload && responseOfPostUpload.body ? JSON.parse(responseOfPostUpload.body) : null
        if (parsedResponse && parsedResponse.h) {
          fileHandleData = parsedResponse.h
        }
        await this.getUploadAfterSession(sessionToken, accessToken)
      } catch (error) {
        __logger.error('error inside addTemplate : ', error)
        throw new Error(error)
      }
    }
    __logger.info(' UploadAfterSession  in resumable api', { fileHandleData })
    return fileHandleData
  }

  createHeaderHandleDataFromMediaUrl (url, accesToken) {
    __logger.info('Inside createHeaderHandleDataFromMediaUrl  in resumable api')
    const deferred = q.defer()
    let fileType
    this.http.Get(url, {}, __config.service_provider_id.facebook, null, false)
      .then(response => {
        __logger.info('Image buffer in resumable api')
        this.imageBuffer = Buffer.from(response, 'utf-8')
        this.imagelength = Buffer.byteLength(this.imageBuffer)
        const mimeVal = url.split('.')
        const fileType = __constants.MIMETYPE[mimeVal[mimeVal.length - 1]]
        __logger.info('Image buffer,imagelengh and filetype in resumable api', this.imageBuffer, this.imagelength, fileType)
        let api = __constants.FACEBOOK_GRAPHURL + __constants.FACEBOOK_GRAPHURL_VERSION + '/' + __constants.FACEBOOK_APP_ID
        api = `${api}/uploads?file_length=${this.imagelength}&file_type=${fileType}&access_token=${accesToken}`
        const headers = {
          'Content-Type': 'application/json'
        }
        if (fileType) return this.http.Post({}, 'body', api, headers)
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE })
      })
      .then(sessionTokenResponse => {
        __logger.info('sessionTokenResponse resumable api', { sessionTokenResponse })
        if (sessionTokenResponse && sessionTokenResponse.body && sessionTokenResponse.body.id) {
          return this.uploadAfterSession(sessionTokenResponse.body.id, accesToken, fileType)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER })
        }
      })
      .then(headerHandleData => {
        __logger.info('headerHandleData resumable api', { headerHandleData })
        if (headerHandleData) {
          deferred.resolve(headerHandleData)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.HEADER_HANDLE_NOT_CREATED })
        }
      })
      .catch((err) => {
        __logger.error('error inside addTemplate : ', err)
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }
}
module.exports = ResumableApi
