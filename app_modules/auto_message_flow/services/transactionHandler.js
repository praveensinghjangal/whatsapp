const request = require('request')
const q = require('q')
const _ = require('lodash')
const DbServices = require('./dbData')
const __constants = require('../../../config/constants')
const ValidatonService = require('./validation')

class TransactionHandler {
  callPostApi (inputRequest, url, headers = {}) {
    console.log('calling API ==============')
    const deferred = q.defer()
    const options = {
      method: 'POST',
      url: url,
      timeout: this.timeInSeconds,
      headers: headers,
      body: inputRequest,
      json: true,
      rejectUnauthorized: false
    }
    request(options, (error, response, body) => {
      // console.log('pppppppppppppppppppp', response.statusCode)
      if (error) {
        console.log('errrrrrrrrrrrrr', error)
        deferred.reject(error)
      } else {
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  callGetApi (url, headers = {}) {
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
        deferred.resolve(response)
      }
    })
    return deferred.promise
  }

  formBodyAndCallGetText (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    console.log('Lets get text ===============', eventData, paramValueArr)
    let queryString = '?'
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      if (index === 0) {
        queryString += requiredParam + '=' + singleparam
      } else {
        queryString += '&' + requiredParam + '=' + singleparam
      }
    })
    console.log('queryyyyyy strrrrrrr ----->', queryString)
    // eventData.url = 'http://localhost:3003/sampleText'
    that.callGetApi(eventData.url + queryString, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body.text)
        if (apiRes && apiRes.body && apiRes.body.text) {
          dataPosted.resolve({ contentType: 'text', text: apiRes.body.text })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  formBodyAndCallGetImage (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    // console.log('Lets get Image ===============', eventData, paramValueArr)
    let queryString = '?'
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      if (index === 0) {
        queryString += requiredParam + '=' + singleparam
      } else {
        queryString += '&' + requiredParam + '=' + singleparam
      }
    })
    // console.log('queryyyyyy strrrrrrr ----->', queryString)
    // eventData.url = 'http://localhost:3003/sampleImage'
    that.callGetApi(eventData.url + queryString, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body.text)
        if (apiRes && apiRes.body && apiRes.body.url) {
          dataPosted.resolve({ contentType: 'media', media: { type: 'image', url: apiRes.body.url } })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  formBodyAndCallGetLocation (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    // console.log('Lets get Location ===============', eventData, paramValueArr)
    let queryString = '?'
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      if (index === 0) {
        queryString += requiredParam + '=' + singleparam
      } else {
        queryString += '&' + requiredParam + '=' + singleparam
      }
    })
    // console.log('queryyyyyy strrrrrrr ----->', queryString)
    // eventData.url = 'http://localhost:3003/sampleLocation'
    that.callGetApi(eventData.url + queryString, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body.text)
        if (apiRes && apiRes.body && apiRes.body.location) {
          dataPosted.resolve({ contentType: 'location', location: { longitude: apiRes.body.location.longitude, latitude: apiRes.body.location.latitude } })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  formBodyAndCallGetDocument (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    // console.log('Lets get Document ===============', eventData, paramValueArr)
    let queryString = '?'
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      if (index === 0) {
        queryString += requiredParam + '=' + singleparam
      } else {
        queryString += '&' + requiredParam + '=' + singleparam
      }
    })
    // console.log('queryyyyyy strrrrrrr ----->', queryString)
    // eventData.url = 'http://localhost:3003/sampleDocument'
    that.callGetApi(eventData.url + queryString, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body.text)
        if (apiRes && apiRes.body && apiRes.body.url) {
          dataPosted.resolve({ contentType: 'media', media: { type: 'document', url: apiRes.body.url } })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  formBodyAndCallGetVideo (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    // console.log('Lets get Video ===============', eventData, paramValueArr)
    let queryString = '?'
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      if (index === 0) {
        queryString += requiredParam + '=' + singleparam
      } else {
        queryString += '&' + requiredParam + '=' + singleparam
      }
    })
    console.log('queryyyyyy strrrrrrr ----->', queryString)
    that.callGetApi(eventData.url + queryString, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body)
        if (apiRes && apiRes.body && apiRes.body.url) {
          dataPosted.resolve({ contentType: 'media', media: { type: 'video', url: apiRes.body.url } })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  formBodyAndCallPost (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    console.log('Lets post ===============', eventData, paramValueArr)
    const reqBody = {}
    _.each(paramValueArr, (singleparam, index) => {
      const requiredParam = eventData.requiredKeys[index].split('|')[0] || eventData.requiredKeys[index]
      reqBody[requiredParam] = singleparam
    })
    console.log('bodyyyyyyyyyyyyyy ----->', reqBody)
    that.callPostApi(reqBody, eventData.url, eventData.headers)
      .then(apiRes => {
        // console.log('api res ==========================', apiRes.body.text)
        if (apiRes && apiRes.body && apiRes.body.text) {
          dataPosted.resolve({ contentType: 'text', text: apiRes.body.text })
        } else {
          dataPosted.resolve({ contentType: 'text', text: 'Thank you, Your request is under process.' })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        dataPosted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataPosted.promise
  }

  methodNotFound (eventData, paramValueArr) {
    const mnf = q.defer()
    mnf.resolve({ contentType: 'text', text: 'Uh Oh!, Please try again later' })
    return mnf.promise
  }

  callApiAndCloseTransaction (transactionDetails, paramValueArr) {
    const apiCalledAndTransactionClosed = q.defer()
    const dbServices = new DbServices()
    let func
    switch (transactionDetails[0].eventData.method) {
      case 'post':
        func = this.formBodyAndCallPost
        break
      case 'getText':
        func = this.formBodyAndCallGetText
        break
      case 'getImage':
        func = this.formBodyAndCallGetImage
        break
      case 'getLocation':
        func = this.formBodyAndCallGetLocation
        break
      case 'getDocument':
        func = this.formBodyAndCallGetDocument
        break
      case 'getVideo':
        func = this.formBodyAndCallGetVideo
        break
      default:
        func = this.methodNotFound
    }
    let messageData = {}
    func(transactionDetails[0].eventData, paramValueArr, this)
      .then(md => {
        console.log('messageData ==========================', md)
        messageData = md
        return dbServices.closeTransaction(transactionDetails[0].auotMessageTranscationId)
      })
      .then(data => apiCalledAndTransactionClosed.resolve(messageData))
      .catch(err => {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        apiCalledAndTransactionClosed.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCalledAndTransactionClosed.promise
  }

  saveCurrentParamValueInDbAndRequestNextParam (transactionDetails, currentParamValue, requiredParam, inputBody) {
    const paramsSavedAndRequested = q.defer()
    const dbServices = new DbServices()
    const transactionData = {
      auotMessageTranscationId: transactionDetails[0].auotMessageTranscationId,
      audiencePhoneNumber: inputBody.from,
      wabaPhoneNumber: inputBody.to,
      identifierText: transactionDetails[0].eventData.parentIdentifier,
      messageId: inputBody.messageId,
      messageText: currentParamValue,
      eventData: transactionDetails[0].eventData
    }
    dbServices.addEventTransaction(transactionData)
      .then(eventDetails => {
        const cancelStr = transactionDetails[0].eventData.transActionEndingIdentifier ? '\n\nNote : To cancel this transaction anytime enter ' + transactionDetails[0].eventData.transActionEndingIdentifier : ''
        return paramsSavedAndRequested.resolve({ contentType: 'text', text: 'Please provide ' + requiredParam + cancelStr })
      })
      .catch(err => paramsSavedAndRequested.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return paramsSavedAndRequested.promise
  }

  checkIfMoreParamRequired (transactionDetails, inputBody) {
    const paramsRequired = q.defer()
    const validatonService = new ValidatonService()
    console.log('here ---->', transactionDetails)
    const eventData = transactionDetails.transactionData[0].eventData
    let messageTextArr = _.map(transactionDetails.transactionData, 'messageText')
    messageTextArr = _.without(messageTextArr, null)
    // check regex here
    console.log('regexxxxxxxxxxxxxxxxx to chk input', messageTextArr, eventData.requiredKeys[messageTextArr.length], inputBody.content.text)
    const currentInputTextKeyArr = eventData.requiredKeys[messageTextArr.length].split('|')
    validatonService.checkRegex(currentInputTextKeyArr[2], currentInputTextKeyArr[3], currentInputTextKeyArr[4], inputBody.content.text)
      .then(data => {
        console.log('validation reesssssssssssssss', data)
        // if regex fails form msg body and flag invalid true and handle in then and return data to send message
        if (!data.invalid) {
          messageTextArr.push(inputBody.content.text)
          console.log('here 2 ---->', eventData, messageTextArr, eventData.requiredKeys)
          if (messageTextArr.length === eventData.requiredKeys.length) {
            paramsRequired.resolve({ requireMore: false, messageTextArr })
          } else {
            const requiredParam = eventData.requiredKeys[messageTextArr.length].split('|')[1] || eventData.requiredKeys[messageTextArr.length]
            paramsRequired.resolve({ requireMore: true, requiredParam, currentParamValue: inputBody.content.text })
          }
        } else {
          return paramsRequired.resolve({ invalid: true, messageData: { contentType: 'text', text: 'Please provide ' + currentInputTextKeyArr[1] + ' of type ' + currentInputTextKeyArr[2] + ' with minimum length of ' + currentInputTextKeyArr[3] + ' and maximum lenghth of ' + currentInputTextKeyArr[4] } })
        }
      })
      .catch(err => {
        console.log('errrrrrrrrrr', err)
        paramsRequired.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return paramsRequired.promise
  }

  continueTransaction (inputBody, transactionDetails) {
    const transactionCompleted = q.defer()
    console.log('lets continue ++++++++++++++++')
    if (inputBody.content && inputBody.content.text && inputBody.content.text === transactionDetails.transactionData[0].eventData.transActionEndingIdentifier) {
      transactionCompleted.resolve({ nonTransactionalFlow: true })
      return transactionCompleted.promise
    }
    this.checkIfMoreParamRequired(transactionDetails, inputBody)
      .then(paramsRes => {
        console.log('params response ----------->', paramsRes)
        if (paramsRes && paramsRes.invalid) {
          return paramsRes.messageData
        } else if (paramsRes && paramsRes.requireMore) {
          return this.saveCurrentParamValueInDbAndRequestNextParam(transactionDetails.transactionData, paramsRes.currentParamValue, paramsRes.requiredParam, inputBody)
        } else {
          return this.callApiAndCloseTransaction(transactionDetails.transactionData, paramsRes.messageTextArr)
        }
      })
      .then(messageData => transactionCompleted.resolve(messageData))
      .catch(err => {
        console.log('eeeeeeeeeeeeeeee', err)
        transactionCompleted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return transactionCompleted.promise
  }

  handle (inputBody) {
    const messageData = q.defer()
    const dbServices = new DbServices()
    dbServices.getTransactionData(inputBody.from, inputBody.to)
      .then(transactionDetails => {
        console.log('dbbbbbbbbbbbbbb====>', transactionDetails)
        if (!transactionDetails.transactionFound) return { nonTransactionalFlow: true }
        return this.continueTransaction(inputBody, transactionDetails)
      })
      .then(data => messageData.resolve(data))
      .catch(err => messageData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return messageData.promise
  }
}

module.exports = TransactionHandler
