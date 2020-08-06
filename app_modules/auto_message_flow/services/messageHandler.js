const q = require('q')

class MessageHandler {
  getMessageEventAndEventData (body) {
    const eventData = q.defer()
    if (body && body.content && body.content.contentType && body.content.contentType.toLowerCase() === 'text' && body.content.text) {
      eventData.resolve({ eventName: 'defaultMessage', eventData: {} })
    } else {
      eventData.resolve({ eventName: 'defaultMessage', eventData: {} })
    }
    return eventData.promise
  }
}

module.exports = MessageHandler
