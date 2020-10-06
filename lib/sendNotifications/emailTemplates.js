module.exports = {
  verificationCodeTemplate: (code, firstName) => {
    return `hello ${firstName}
              <br/>following is your one time code for email verification
              <br/> <h3>${code}</h3>`
  },
  passwordReset: (url, firstName) => {
    return `<table width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td>
            <table cellspacing="0" cellpadding="0">
                <tr>
                    <td>hello ${firstName}</td>
                </tr>
                <tr>
                    <td>Please use the below button to change password</td>
                </tr>
                <tr>
                    <td style="border-radius: 5px;text-align: center;" bgcolor="#009da0">
                        <a href="${url}" target="_blank"
                            style="padding: 8px 12px; border: 1px solid #009da0;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                            Change Password
                        </a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`
  },
  emailTfa: (code, firstName) => {
    return `hello ${firstName}
              <br/>below is your one time code for loging in into helo whatsapp portal
              <br/> <h3>${code}</h3>`
  }
}
