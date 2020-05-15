const WebHooks = require('../../integration').WebHooks
const webhooks = new WebHooks()

module.exports = (req, res) => {
  webhooks.sendSinchPayloadToQUeue(req.body)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}
