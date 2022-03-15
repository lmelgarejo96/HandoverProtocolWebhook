'use strict'

// Imports dependencies and set up http server
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const Messenger = require('./webhook_messenger')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Post and Get messenger webhook
server.post('/webhook_messenger', Messenger.handlePostRequest)
server.get('/webhook_messenger', Messenger.handleGetRequest)

// Webhook dialogflow
server.post('/webhook_dialogflow', (req, res) => {
  console.log('DIALOGFLOW REQUEST', req.body, req.body.originalDetectIntentRequest)
  res.end()
})

server.listen(process.env.PORT || 3000, () => console.log('Webhook Works!!'))
