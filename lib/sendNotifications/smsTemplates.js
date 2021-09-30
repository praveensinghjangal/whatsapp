module.exports = {
  phoneVerification: (code, firstName) => {
    return `Hello ${firstName},\nYour one time passcode for your phone number verification is ${code}. Please do not share it with anyone.`
  },
  smsTfa: (code, firstName) => {
    return `Hello ${firstName},\nYour one time passcode for logging on whatsapp.helo.ai is ${code}. Please do not share it with anyone.`
  }
}
