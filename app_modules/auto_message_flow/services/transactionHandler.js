const request = require('request')
const q = require('q')
const _ = require('lodash')
const DbServices = require('./dbData')
const __constants = require('../../../config/constants')

class TransactionHandler {
  callPostApi (inputRequest, url, headers) {
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

  callGetApi (url, headers) {
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

  formBodyAndCallPost (eventData, paramValueArr, that) {
    const dataPosted = q.defer()
    console.log('Lets post ===============', eventData, paramValueArr)
    const reqBody = {}
    _.each(paramValueArr, (singleparam, index) => {
      reqBody[eventData.requiredKeys[index]] = singleparam
    })
    console.log('bodyyyyyyyyyyyyyy ----->', reqBody)
    that.callPostApi(reqBody, eventData.url, {})
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
      eventData: JSON.stringify(transactionDetails[0].eventData)
    }
    dbServices.addEventTransaction(transactionData)
      .then(eventDetails => paramsSavedAndRequested.resolve({ contentType: 'text', text: 'Please provide ' + requiredParam + '\n\nNote : To cancel this transaction anytime enter ' + transactionDetails[0].eventData.transActionEndingIdentifier }))
      .catch(err => paramsSavedAndRequested.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return paramsSavedAndRequested.promise
  }

  checkIfMoreParamRequired (transactionDetails, inputBody) {
    const paramsRequired = q.defer()
    console.log('here ---->', transactionDetails)
    const eventData = transactionDetails.transactionData[0].eventData
    let messageTextArr = _.map(transactionDetails.transactionData, 'messageText')
    messageTextArr.push(inputBody.content.text)
    messageTextArr = _.without(messageTextArr, null)
    console.log('here 2 ---->', eventData, messageTextArr, eventData.requiredKeys)
    if (messageTextArr.length === eventData.requiredKeys.length) {
      paramsRequired.resolve({ requireMore: false, messageTextArr })
    } else {
      paramsRequired.resolve({ requireMore: true, requiredParam: eventData.requiredKeys[messageTextArr.length], currentParamValue: inputBody.content.text })
    }
    return paramsRequired.promise
  }

  continueTransaction (inputBody, transactionDetails) {
    const transactionCompleted = q.defer()
    console.log('lets continue ++++++++++++++++')
    this.checkIfMoreParamRequired(transactionDetails, inputBody)
      .then(paramsRes => {
        console.log('params response ----------->', paramsRes)
        if (paramsRes && paramsRes.requireMore) {
          return this.saveCurrentParamValueInDbAndRequestNextParam(transactionDetails.transactionData, paramsRes.currentParamValue, paramsRes.requiredParam, inputBody)
        } else {
          return this.callApiAndCloseTransaction(transactionDetails.transactionData, paramsRes.messageTextArr)
        }
      })
      .then(messageData => transactionCompleted.resolve(messageData))
      .catch(err => transactionCompleted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
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
