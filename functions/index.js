const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const { IncomingWebhook } = require('@slack/client')
const webhook = new IncomingWebhook(functions.config().slack.url)
admin.initializeApp()
const db = admin.firestore()
const linesCollection = db.collection('lines')

exports.checkLateTrains = functions.https.onRequest(async (request, response) => {
  const res = await fetch('https://tetsudo.rti-giken.jp/free/delay.json')
  const lateLines = await res.json()
  const lateLineNames = lateLines.map(line => line.name)
  const checkLinesNames = await getCheckLineNames()
  const notifyLineNames = checkLinesNames.filter(lineName => lateLineNames.indexOf(lineName) >= 0)
  const sendStr = `:train: *今遅れてる路線* :clock8:
  ${notifyLineNames.join(`
  `)}
  `
  try {
    await webhook.send(notifyLineNames.length > 0 ? sendStr : ':train: 遅れてる路線はありません :clock8:')
    response.send(sendStr)
  } catch (err) {
    response.send(err)
  }
})

exports.showCheckLines = functions.https.onRequest(async (request, response) => {
  const checkLineNames = await getCheckLineNames()
  response.send({response_type: 'in_channel', text: checkLineNames.filter(name => name).join(' ')})
})

const getCheckLineNames = async () => {
  const querySnapshot = await linesCollection.get()
  const docSnapShots = querySnapshot.docs
  const checkLines = docSnapShots.map(docSnapShot => docSnapShot.data())
  return [...new Set(checkLines.map(line => line.name))]
}
