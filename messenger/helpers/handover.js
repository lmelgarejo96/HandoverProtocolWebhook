const axios = require('axios')
const { FACEBOOK_ACCESS_TOKEN } = require('../../config')

async function passThreadControlToAppId (sender, appId) {
  // Pass thread control to appId
  const fbReqBody = {
    recipient: sender,
    target_app_id: appId,
    metadata: 'Changing control thread'
  }
  const url = `https://graph.facebook.com/v13.0/me/pass_thread_control?access_token=${FACEBOOK_ACCESS_TOKEN}`
  const { data, status } = await axios.post(url, fbReqBody)
  console.log('PASS THREAD CONTROL', data)
  if (status !== 200 || status !== 201) return false
  return data.success === true
}

async function takeThreadControl (sender) {
  // Recovery the thread control in default primary app
  const fbReqBody = {
    recipient: sender,
    metadata: 'Take the thread control'
  }
  const url = `https://graph.facebook.com/v11.0/me/take_thread_control?access_token=${FACEBOOK_ACCESS_TOKEN}`
  const { data, status } = await axios.post(url, fbReqBody)
  if (status !== 200 || status !== 201) return false
  console.log('TAKE THREAD CONTROL', data)
  return true
}

module.exports = {
  passThreadControlToAppId,
  takeThreadControl
}
