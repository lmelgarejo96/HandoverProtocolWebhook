'use strict'

// Imports dependencies and set up http server
const express = require('express')
const server = express()
const Messenger = require('./webhook_messenger')

server.use(express.json())

// Post and Get messenger webhook
server.post('/webhook_messenger', Messenger.handlePostRequest)
server.get('/webhook_messenger', Messenger.handleGetRequest)

server.listen(process.env.PORT || 3000, () => console.log('Webhook Works!!'))
