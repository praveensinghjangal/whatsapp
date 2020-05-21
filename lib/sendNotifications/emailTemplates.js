module.exports = {
  verificationCodeTemplate: (code, firstName) => {
    return `hello ${firstName}
              <br/>following is ur one time code for email verification
              <br/> <h3>${code}</h3>`
  }
}
