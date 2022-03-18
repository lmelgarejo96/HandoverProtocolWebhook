const request = require('request')
const uuid = require('uuid')
const axios = require('axios')
// files
const config = require('../../config')
const { takeThreadControl } = require('./handover')
// const dialogflow = require('../dialogflow')
// const { structProtoToJson } = require('./helpers/struct_functions')
const sessionIds = new Map()

async function receivedMessage (event) {
  const senderId = event.sender.id
  const recipientID = event.recipient.id
  const timeOfMessage = event.timestamp
  const message = event.message
  console.log(
    'Received message for user %d and page %d at %d with message:',
    senderId,
    recipientID,
    timeOfMessage
  )

  const isEcho = message.is_echo
  const messageId = message.mid
  const appId = message.app_id
  const metadata = message.metadata

  // You may get a text or attachment but not both
  const messageText = message.text
  const messageAttachments = message.attachments
  const quickReply = message.quick_reply

  if (isEcho) {
    handleEcho(messageId, appId, metadata)
    return
  } else if (quickReply) {
    handleQuickReply(senderId, quickReply, messageId)
    return
  }
  if (messageText) {
    // send message to dialogflow
    console.log('MENSAJE DEL USUARIO: ', messageText)
    if (messageText === 'ACTIVE_BOT') {
      await takeThreadControl(event.sender)
      return
    }
    await sendToDialogFlow(senderId, messageText)
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderId)
  }
}

function handleMessageAttachments (messageAttachments, senderId) {
  // for now just reply
  sendTextMessage(senderId, 'Archivo adjunto recibido... gracias! .')
}

async function setSessionAndUser (senderId) {
  if (!sessionIds.has(senderId)) {
    sessionIds.set(senderId, uuid.v1())
  }
}

function handleEcho (messageId, appId, metadata) {
  console.log('Received echo for message %s and app %d with metadata %s', messageId, appId, metadata)
}

async function handleQuickReply (senderId, quickReply, messageId) {
  const quickReplyPayload = quickReply.payload
  console.log(
    'Quick reply for message %s with payload %s',
    messageId,
    quickReplyPayload
  )
  // send payload to api.ai
  sendToDialogFlow(senderId, quickReplyPayload)
}

/* async function handleDialogFlowAction (
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  switch (action) {
    default:
      // unhandled action, just send back the text
      handleMessages(messages, sender)
  }
} */

/* async function handleMessage (message, sender) {
  switch (message.message) {
    case 'text': { // text
      for (const text of message.text.text) {
        if (text !== '') {
          await sendTextMessage(sender, text)
        }
      }
      break
    }
    case 'quickReplies': { // quick replies
      const replies = []
      message.quickReplies.quickReplies.forEach((text) => {
        const reply = {
          content_type: 'text',
          title: text,
          payload: text
        }
        replies.push(reply)
      })
      await sendQuickReply(sender, message.quickReplies.title, replies)
      break
    }
    case 'image': { // image
      await sendImageMessage(sender, message.image.imageUri)
      break
    }
    case 'payload': {
      const desestructPayload = structProtoToJson(message.payload)

      const messageData = {
        recipient: {
          id: sender
        },
        message: desestructPayload.facebook
      }

      await callSendAPI(messageData)
      break
    }

    default:
      break
  }
} */

/* async function handleCardMessages (messages, sender) {
  const elements = []
  for (let m = 0; m < messages.length; m++) {
    const message = messages[m]
    const buttons = []
    for (let b = 0; b < message.card.buttons.length; b++) {
      const isLink = message.card.buttons[b].postback.substring(0, 4) === 'http'
      let button
      if (isLink) {
        button = {
          type: 'web_url',
          title: message.card.buttons[b].text,
          url: message.card.buttons[b].postback
        }
      } else {
        button = {
          type: 'postback',
          title: message.card.buttons[b].text,
          payload:
              message.card.buttons[b].postback === ''
                ? message.card.buttons[b].text
                : message.card.buttons[b].postback
        }
      }
      buttons.push(button)
    }

    const element = {
      title: message.card.title,
      image_url: message.card.imageUri,
      subtitle: message.card.subtitle,
      buttons
    }
    elements.push(element)
  }
  await sendGenericMessage(sender, elements)
} */

/* async function handleMessages (messages, sender) {
  try {
    let i = 0
    let cards = []
    while (i < messages.length) {
      switch (messages[i].message) {
        case 'card':
          for (let j = i; j < messages.length; j++) {
            if (messages[j].message === 'card') {
              cards.push(messages[j])
              i += 1
            } else j = 9999
          }
          await handleCardMessages(cards, sender)
          cards = []
          break
        case 'text':
          await handleMessage(messages[i], sender)
          break
        case 'image':
          await handleMessage(messages[i], sender)
          break
        case 'quickReplies':
          await handleMessage(messages[i], sender)
          break
        case 'payload':
          await handleMessage(messages[i], sender)
          break
        default:
          break
      }
      i += 1
    }
  } catch (error) {
    console.log(error)
  }
} */

async function sendToDialogFlow (senderId, messageText) {
  sendTypingOn(senderId)
  try {
    setSessionAndUser(senderId)
    sendTextMessage(senderId, 'He recibido tu mensaje desde la otra app')
    sendTypingOff(senderId)
    /* const session = sessionIds.get(senderId)
    const result = await dialogflow.sendToDialogFlow(
      messageText,
      session,
      'FACEBOOK'
    )
    handleDialogFlowResponse(senderId, result) */
  } catch (error) {
    console.log('salio mal en sendToDialogflow...', error)
  }
}

/* function handleDialogFlowResponse (sender, response) {
  const responseText = response.fulfillmentMessages.fulfillmentText
  const messages = response.fulfillmentMessages
  const action = response.action
  const contexts = response.outputContexts
  const parameters = response.parameters

  sendTypingOff(sender)

  if (isDefined(action)) {
    handleDialogFlowAction(sender, action, messages, contexts, parameters)
  } else if (isDefined(messages)) {
    handleMessages(messages, sender)
  } else if (responseText === '' && !isDefined(action)) {
    // dialogflow could not evaluate input.
    sendTextMessage(sender, 'No entiendo lo que trataste de decir ...')
  } else if (isDefined(responseText)) {
    sendTextMessage(sender, responseText)
  }
} */

async function getUserData (senderId) {
  const accessToken = config.FACEBOOK_ACCESS_TOKEN
  try {
    const userData = await axios.get(
        `${config.FACEBOOK_GRAPH_API_URL}/${senderId}`,
        {
          params: {
            accessToken
          }
        }
    )
    return userData.data
  } catch (err) {
    return {
      first_name: '',
      last_name: '',
      profile_pic: ''
    }
  }
}

async function sendTextMessage (recipientId, text) {
  if (text.includes('{first_name}') || text.includes('{last_name}')) {
    const userData = await getUserData(recipientId)
    text = text
      .replace('{first_name}', userData.first_name)
      .replace('{last_name}', userData.last_name)
  }
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  }
  await callSendAPI(messageData)
}

/*
   * Send an image using the Send API.
   *
   */
/* async function sendImageMessage (recipientId, imageUrl) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl
        }
      }
    }
  }
  await callSendAPI(messageData)
} */

/*
   * Send a button message using the Send API.
   *
   */
/* async function sendButtonMessage (recipientId, text, buttons) {
    const messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: text,
            buttons: buttons
          }
        }
      }
    }
    await callSendAPI(messageData)
  } */

/* async function sendGenericMessage (recipientId, elements) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }
    }
  }

  await callSendAPI(messageData)
} */

/*
   * Send a message with Quick Reply buttons.
   *
   */
/* async function sendQuickReply (recipientId, text, replies, metadata) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : '',
      quick_replies: replies
    }
  }

  await callSendAPI(messageData)
} */

/*
   * Turn typing indicator on
   *
   */
function sendTypingOn (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on'
  }

  callSendAPI(messageData)
}

/*
   * Turn typing indicator off
   *
   */
function sendTypingOff (recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_off'
  }

  callSendAPI(messageData)
}

/*
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   *
   */
function callSendAPI (messageData) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `${config.FACEBOOK_GRAPH_API_URL}/me/messages`,
        qs: {
          access_token: config.FB_PAGE_TOKEN
        },
        method: 'POST',
        json: messageData
      },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          const recipientId = body.recipient_id
          const messageId = body.message_id

          if (messageId) {
            console.log(
              'Successfully sent message with id %s to recipient %s',
              messageId,
              recipientId
            )
          } else {
            console.log(
              'Successfully called Send API for recipient %s',
              recipientId
            )
          }
          resolve()
        } else {
          reject(new Error('something bad happened'))
          console.error(
            'Failed calling Send API',
            response.statusCode,
            response.statusMessage,
            body.error
          )
        }
      }
    )
  })
}

async function receivedPostback (event) {
  const senderId = event.sender.id
  const recipientID = event.recipient.id
  const timeOfPostback = event.timestamp

  const payload = event.postback.payload
  switch (payload) {
    default:
      // unindentified payload
      sendToDialogFlow(senderId, payload)
      break
  }

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + 'at %d',
    senderId,
    recipientID,
    payload,
    timeOfPostback
  )
}

/* function isDefined (obj) {
  if (typeof obj === 'undefined') {
    return false
  }

  if (!obj) {
    return false
  }

  return obj != null
} */

module.exports = {
  receivedMessage,
  receivedPostback
}
