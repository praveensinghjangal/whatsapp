class EventHandler {
  defaultMessage (eventData) {
    return {
      contentType: 'text',
      text: 'Can you say that again?'
    }
  }
}

module.exports = EventHandler
