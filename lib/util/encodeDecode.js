
class Base64 {
  decode (encodedString) {
    return Buffer.from(encodedString, 'base64').toString('utf8')
  }
}

module.exports = { Base64 }
