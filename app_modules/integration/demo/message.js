const q = require('q')

class Message {
  constructor (maxConcurrent, userId) {
    this.http = ''
  }

  sendMessage (payload) {
    const deferred = q.defer()
    deferred.resolve({ success: true, message: 'message sent', data: {} })
    return deferred.promise
  }
}

module.exports = Message
