module.exports = {
  phoneVerification: (code, firstName) => {
    return `hello ${firstName},\n${code} is ur one time code for phone number verification`
  },
  smsTfa: (code, firstName) => {
    return `hello ${firstName},\n${code} is ur one time code for logging into helo whatsapp portal`
  }
}
