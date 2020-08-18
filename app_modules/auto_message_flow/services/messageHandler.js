const q = require('q')
const DbServices = require('./dbData')
const __constants = require('../../../config/constants')

class MessageHandler {
  getMessageEventAndEventData (body) {
    const eventData = q.defer()
    if (body.isVavaOptin) {
      eventData.resolve({ eventName: 'optinEventHandler', eventData: { wabaNumber: body.to } })
      return eventData.promise
    }
    if (body && body.content && body.content.contentType && body.content.contentType.toLowerCase() === 'text' && body.content.text) {
      const dbServices = new DbServices()
      dbServices.getEventDetailsFromIdentifierOrTopic(body.to, body.content.text)
        .then(eventDetails => {
          if (eventDetails.length > 0) {
            // console.log('lets compute ====>', eventDetails)
            if (eventDetails[0].resultOf === 'i') {
              const eventDataJson = eventDetails[0].eventData || {}
              eventDataJson.wabaNumber = body.to
              eventDataJson.parentIdentifier = body.content.text
              eventDataJson.audiencePhoneNumber = body.from
              return eventData.resolve({ eventName: eventDetails[0].event, eventData: eventDataJson })
            } else {
              return eventData.resolve({ eventName: 'showMenu', eventData: { wabaNumber: body.to, rows: eventDetails } })
            }
          } else {
            return eventData.resolve({ eventName: 'defaultMessage', eventData: { wabaNumber: body.to } })
          }
        })
        .catch(err => eventData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    } else {
      eventData.resolve({ eventName: 'defaultMessage', eventData: { wabaNumber: body.to } })
    }
    return eventData.promise
  }
}

module.exports = MessageHandler
