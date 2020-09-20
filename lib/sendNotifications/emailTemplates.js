module.exports = {
  verificationCodeTemplate: (code, firstName) => {
    return `hello ${firstName}
              <br/>following is ur one time code for email verification
              <br/> <h3>${code}</h3>`
  },
  passwordReset: (url, firstName) => {
    return `hello ${firstName}
              <br/>Please use the below link to reset password
              <br/> <h3>${url}</h3>`
  },
  emailTfa: (code, firstName) => {
    return `hello ${firstName}
              <br/>below is ur one time code for loging in into helo whatsapp portal
              <br/> <h3>${code}</h3>`
  }
}
