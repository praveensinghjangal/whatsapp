const ObjectID = require('mongodb').ObjectID

class UiqueIdGenerator {
  intId () {
    return parseInt((new Date().getTime()).toString() + (Math.floor(Math.random() * 9) + 10))
  }

  mongoId () {
    return ObjectID().toString()
  }
}
module.exports = UiqueIdGenerator
