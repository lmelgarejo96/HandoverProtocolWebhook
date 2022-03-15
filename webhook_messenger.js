const axios = require('axios')
const {
  FACEBOOK_GRAPH_API_URL,
  FACEBOOK_ACCESS_TOKEN,
  DIALOGFLOW_WEBHOOK_MESSENGER,
  VERIFY_TOKEN
} = require('./config')

const axiosFB = axios.create({
  baseURL: FACEBOOK_GRAPH_API_URL
})

const handlePostRequest = (req, res) => {
  const body = req.body

  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      const webhookEv = entry.messaging[0]

      const isHandoverProtocol = webhookEv.request_thread_control || webhookEv.pass_thread_control || webhookEv.take_thread_control

      console.log({
        url: DIALOGFLOW_WEBHOOK_MESSENGER,
        isHandoverProtocol,
        webhookEv
      })
      if (isHandoverProtocol) {
        const fbReqBody = {
          recipient: webhookEv.sender,
          metadata: 'Changing control thread'
        }

        const isRequestThreadControl = webhookEv.request_thread_control
        const isPassThreadControl = webhookEv.pass_thread_control

        if (isRequestThreadControl) {
          fbReqBody.target_app_id = webhookEv.request_thread_control.requested_owner_app_id

          axiosFB.post(
            '/pass_thread_control',
            fbReqBody, {
              params: {
                access_token: FACEBOOK_ACCESS_TOKEN
              }
            }
          ).then(function (response) { })
            .catch(function (error) {
              console.log('Fb error', error)
            })
        } else if (isPassThreadControl) {
          axiosFB.post(
            '/take_thread_control',
            fbReqBody, {
              params: {
                access_token: FACEBOOK_ACCESS_TOKEN
              }
            }
          ).then(function (response) { })
            .catch(function (error) {
              console.log('Fb error', error)
            })
        }
      } else {
        axios.post(`${DIALOGFLOW_WEBHOOK_MESSENGER}`, body)
          .then(function (response) { })
          .catch(function (error) {
            console.log('Dialogflow error', error.response)
          })
      }
    })

    res.status(200).send('EVENT_RECEIVED')
  } else {
    res.status(404).end()
  }
}

const handleGetRequest = (req, res) => {
  try {
    console.log('entró a solicitud get')
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED')
        res.status(200).send(challenge)
      } else {
        res.status(403).end()
      }
    }
    res.status(403).end()
  } catch (error) {
    console.log('error en get', error)
  }
}

module.exports = {
  handlePostRequest,
  handleGetRequest
}
