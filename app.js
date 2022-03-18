'use strict'

// Imports dependencies and set up http server
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const Messenger = require('./messenger/webhook')
const { handleDialogFlowWebhook } = require('./dialogflow')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Post and Get messenger webhook
server.post('/webhook_messenger', Messenger.handleWebhookPost)
server.get('/webhook_messenger', Messenger.handleVerifyWebhook)

// Webhook dialogflow
server.post('/webhook_dialogflow', handleDialogFlowWebhook)

server.listen(process.env.PORT || 3000, () => console.log('Webhook Works!!'))
