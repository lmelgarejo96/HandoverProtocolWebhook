// const dialogflow = require('dialogflow')
const config = require('./config')
const { passThreadControlToAppId } = require('./messenger/helpers/handover')

/* const credentials = {
  client_email: config.GOOGLE_CLIENT_EMAIL,
  private_key: config.GOOGLE_PRIVATE_KEY
}

const sessionClient = new dialogflow.SessionsClient({
  projectId: config.GOOGLE_PROJECT_ID,
  credentials
})

async function sendToDialogFlow (msg, session, source, params) { // ya no se usará
  const textToDialogFlow = msg
  try {
    const sessionPath = sessionClient.sessionPath(
      config.GOOGLE_PROJECT_ID,
      session
    )

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: config.LANGUAGE_CODE
        }
      },
      queryParams: {
        payload: {
          data: params
        }
      }
    }
    const responses = await sessionClient.detectIntent(request)
    const result = responses[0].queryResult
    console.log('INTENT EMPAREJADO: ', result.intent.displayName)
    const defaultResponses = []
    if (result.action !== 'input.unknown') {
      result.fulfillmentMessages.forEach((element) => {
        if (element.platform === source) {
          defaultResponses.push(element)
        }
      })
    }
    if (defaultResponses.length === 0) {
      result.fulfillmentMessages.forEach((element) => {
        if (element.platform === 'PLATFORM_UNSPECIFIED') {
          defaultResponses.push(element)
        }
      })
    }
    result.fulfillmentMessages = defaultResponses
    return result
  } catch (e) {
    console.log('error')
    console.log(e)
  }
} */

async function handleDialogFlowWebhook (req, res) {
  const { action } = req.body.queryResult

  const ACTIONS = {
    BOT_OFF: handleDialogFlowBotOff
    // MORE ACTIONS ..
  }

  await ACTIONS[action](req.body)

  res.end()
}

async function handleDialogFlowBotOff (body) {
  const { originalDetectIntentRequest } = body
  if (originalDetectIntentRequest.source === 'facebook') { // Facebook Source
    const sender = originalDetectIntentRequest.payload.data.sender
    const recipient = originalDetectIntentRequest.payload.data.recipient
    const message = originalDetectIntentRequest.payload.data.message
    console.log('SENDER', sender)
    console.log('RECIPIENT', recipient)
    console.log('MESSAGE', message)
    await passThreadControlToAppId(sender, config.PLATFORM_APP_ID)
  } else if (originalDetectIntentRequest.source === 'telegram') {
    // Code to telegram response
  }
}

module.exports = {
  handleDialogFlowWebhook
}
