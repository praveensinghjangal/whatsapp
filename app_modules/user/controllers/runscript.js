const shell = require('shelljs')
const q = require('q')
const fs = require('fs')
const __constants = require('../../../config/constants')

const runScriptToSpawnContainersAndGetTheIP = (userId, wabaNumber) => {
  const getIp = q.defer()
  const version = '2.37.2'
  // const command = 'bash shell_scripts/launch_server/launch.bash 2.37.2 917666004488 helo_test_917666004488'
  const command = `bash shell_scripts/launch_server/launch_customer.bash ${version} ${wabaNumber} ${userId}_${wabaNumber}`
  // return new Promise((resolve, reject) => {
  shell.exec(command, async (code, stdout, stderr) => {
    if (!code) {
      const filePath = `shell_scripts/launch_server/output/${userId}_${wabaNumber}.txt`
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.log('error while reading', err)
          return getIp.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [err] })
        }
        console.log('success while reading')
        let text = data.replace(/ /g, '') // removes white spaces from string
        text = text.replace(/(\r\n|\n|\r)/gm, '') // removes all line breaks (new lines) from string
        text = text.split('=')[1]
        getIp.resolve({ privateIp: text })
      })
    } else {
      getIp.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [stderr] })
    }
  })
  // })
  return getIp.promise
}

const controller = (req, res) => {
  runScriptToSpawnContainersAndGetTheIP(req.body.userId, req.body.wabaNumber)
    .then(data => {
      console.log('data', data)
      return res.json(data)
    })
    .catch(err => {
      console.log('err', err)
      return res.json(err)
    })
}

module.exports = controller
