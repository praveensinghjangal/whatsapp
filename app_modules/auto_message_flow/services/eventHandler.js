const q = require('q')
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const redisService = new RedisService()
const _ = require('lodash')
const DbServices = require('./dbData')

class EventHandler {
  defaultMessage (eventData) {
    const defaultMessage = q.defer()
    redisService.getWabaDataByPhoneNumber(eventData.wabaNumber)
      .then(data => {
        // console.log('dataatatatat', data, typeof data)
        if (data && data.chatDefaultMessage) {
          return defaultMessage.resolve({ contentType: 'text', text: data.chatDefaultMessage })
        } else {
          return defaultMessage.resolve({ contentType: 'text', text: __constants.FLOW_MESSAGE_SYSTEM_DEFAULT_TEXT })
        }
      })
      .catch(err => defaultMessage.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return defaultMessage.promise
  }

  showMenu (eventData) {
    const menu = q.defer()
    let meunuStr = 'Please enter number from the following menu to proceed :'
    _.each(eventData.rows, singleObj => {
      meunuStr += '\n' + singleObj.identifierText + ' - ' + singleObj.identifierTextName
    })
    menu.resolve({ contentType: 'text', text: meunuStr })
    return menu.promise
  }

  predefinedText (eventData) {
    const predefined = q.defer()
    predefined.resolve({ contentType: 'text', text: eventData.text })
    return predefined.promise
  }

  noEvent (eventData) {
    const predefined = q.defer()
    predefined.resolve({ contentType: 'text', text: 'Uh Oh!, Please try again later' })
    return predefined.promise
  }

  moreMenu (eventData) {
    const moreMenu = q.defer()
    const dbServices = new DbServices()
    dbServices.getMoreMenuFromParentIdentifier(eventData.wabaNumber, eventData.parentIdentifier)
      .then(menuData => {
        let meunuStr = 'Please enter number from the following menu to proceed :'
        _.each(menuData, singleObj => {
          meunuStr += '\n' + singleObj.identifierText + ' - ' + singleObj.identifierTextName
        })
        moreMenu.resolve({ contentType: 'text', text: meunuStr })
      })
      .catch(err => moreMenu.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return moreMenu.promise
  }
}

module.exports = EventHandler
