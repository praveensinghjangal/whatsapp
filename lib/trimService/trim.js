const q = require('q')

class TrimService {
  singleInputTrim (input) {
    // console.log('Input', input)
    const dataTrimmed = q.defer()
    Object.keys(input).map(k => {
      input[k] = typeof input[k] === 'string' ? input[k].trim() : input[k]
    })
    dataTrimmed.resolve(input)
    return dataTrimmed.promise
  }
}

module.exports = TrimService
