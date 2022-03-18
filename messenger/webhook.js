// files
const config = require('../config')
const { receivedMessage, receivedPostback } = require('./helpers/functions')

// Messenger API parameters
if (!config.FACEBOOK_ACCESS_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN')
}
if (!config.FACEBOOK_VERIFY_TOKEN) {
  throw new Error('missing FB_VERIFY_TOKEN')
}
if (!config.FACEBOOK_APP_SECRET) {
  throw new Error('missing FB_APP_SECRET')
}
/* if (!config.GOOGLE_PROJECT_ID) {
  throw new Error('missing GOOGLE_PROJECT_ID')
}
if (!config.LANGUAGE_CODE) {
  throw new Error('missing DF_LANGUAGE_CODE')
}
if (!config.GOOGLE_CLIENT_EMAIL) {
  throw new Error('missing GOOGLE_CLIENT_EMAIL')
}
if (!config.GOOGLE_PRIVATE_KEY) {
  throw new Error('missing GOOGLE_PRIVATE_KEY')
} */

// for Facebook verification
const handleVerifyWebhook = (req, res) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === config.FACEBOOK_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
}

// for webhook facebook
const handleWebhookPost = (req, res) => {
  try {
    const data = req.body
    if (data.object === 'page') {
      data.entry.forEach(function (pageEntry) {
        // const pageID = pageEntry.id
        // let timeOfEvent = pageEntry.time
        // Iterate over each messaging event
        pageEntry.messaging.forEach(function (messagingEvent) {
          console.log('Messaging event', messagingEvent)
          if (messagingEvent.message) {
            receivedMessage(messagingEvent)
          } else if (messagingEvent.postback) {
            receivedPostback(messagingEvent)
          } else {
            console.log(
              'Webhook received unknown messagingEvent: ',
              messagingEvent
            )
          }
        })
      })
      res.sendStatus(200)
    }
  } catch (error) {
    console.log('error webhook', error)
    res.sendStatus(403)
  }
}

module.exports = {
  handleVerifyWebhook,
  handleWebhookPost
}
