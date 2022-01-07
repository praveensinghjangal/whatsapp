module.exports = ((promise, err) => {
  if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 13) === "doesn't exist") {
    promise.resolve(null)
} else {
    promise.reject(err)
  }
  return promise.promise
})
