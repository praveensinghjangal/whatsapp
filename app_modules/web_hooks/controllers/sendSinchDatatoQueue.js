const WebHooks = require('../../integration').WebHooks
const webhooks = new WebHooks()

module.exports = (req, res) => {
  webhooks.sendSinchPayloadToQUeue(req.body)
    .then(data => res.status(202).send(data))
    .catch(err => res.status(500).send(err))
}
