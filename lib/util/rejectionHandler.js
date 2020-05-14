const q = require('q')
module.exports = error => {
  const defer = q.defer()
  defer.reject(error)
  return defer.promise
}
