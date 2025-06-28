 require('dotenv').config();
const { default: Baileys,
       DisconnectReason, 
       useMultiFileAuthState, 
       fetchLatestBaileysVersion,
       makeInMemoryStore, 
       delay } = require('@WhiskeySockets/baileys')
  const { QuickDB } = require('quick.db') 
    const { MongoDriver } = require('quickmongo') 
      const { Collection } = require('discord.js')
        const auth = require("./handlers/auth")
          const MessageHandler = require('./handlers/Message')
            const EventsHandler = require('./handlers/events')
              const callHandler = require('./handlers/call');
const contact = require('./lib/contacts')
  const CardHandler = require('./handlers/card') 
    const gpt = require('./lib/gpt') 
      const utils = require('./lib/function')
        const YT = require('./lib/YT')
          const AI_lib = require('./lib/AI_lib')
            const express = require("express"); 
const app = express(); 
 const qr = require('qr-image')
  const mongoose = require('mongoose') 
    const P = require('pino') 
      const { Boom } = require('@hapi/boom') 
        const { join } = require('path') 
          const { readdirSync, writeFileSync, unlink } = require('fs-extra') 

            const port = process.env.PORT || 3000 
              const driver = new MongoDriver(process.env.URL) 
                const chalk = require('chalk') 
                  const button = require("./handlers/button") 
                    const EconomyDb = require('./handlers/economy.js') 
                      const { logMessage } = require("./lib/log")

const cardResponse = new Map(); 
const auctionResponse = new Map(); 
const pokemonMap = new Map(); 
const sellResponse = new Map(); 
const pokemonMoveLearningMap = 
new Map(); const evoMap = new Map();

const start = async () =>
  { 
    await mongoose.connect(process.env.SESSION_URL);
    const { useAuthFromDatabase } = new auth(process.env.SESSION); 
    const { saveState, state, clearState } = await useAuthFromDatabase();

const client = Baileys(
  { version: (await fetchLatestBaileysVersion()).version, 
   auth: state, logger: P({ level: 'silent' }),
   printQRInTerminal: true });

client.name = process.env.NAME || 'GhostBot' 
client.owner = process.env.OWNER || 'Deryl' 
client.prefix = process.env.PREFIX || '.' 
client.proUser = (process.env.proUser  || '263788671478').split(',') 
client.writesonicAPI = process.env.WRITE_SONIC || null 
client.bgAPI = process.env.BG_API_KEY || null 
client.API_URL = process.env.API_URL || 'https://d-mail-api.vercel.app/' 
client.mods = (process.env.MODS || '263788671478').split(',')

client.aucMap = auctionResponse; 
client.sellMap = sellResponse; 
client.pokemonResponse = pokemonMap; 
client.pokemonMoveLearningResponse = pokemonMoveLearningMap; 
client.pokemonEvolutionResponse = evoMap;

client.DB = new QuickDB({ driver }) 
client.contactDB = client.DB.table('contacts') 
client.contact = contact client.AI = AI_lib 
client.cards = client.DB.table('cards') 
client.cradit = client.DB.table('cradit') 
client.rpg = client.DB.table('rpg_game') 
client.chara = client.DB.table('chara') 
client.media = client.DB.table('media') 
client.charm = client.DB.table('charm') 
client.delay = client.DB.table('delay') 
client.cmd = new Collection() 
client.pkmn = client.DB.table('pkmn') 
client.utils = utils 
client.gpt = gpt client.YT = YT;

client.textButton = async 
(from, text, text2, text3, M) => { 
  let msg = generateWAMessageFromContent( 
    from, { viewOnceMessage: 
    { 
      message: { messageContextInfo:
        { deviceListMetadata: {}, 
         deviceListMetadataVersion: 2, }, 
                interactiveMessage: proto.Message.InteractiveMessage.create({ 
                  body: proto.Message.InteractiveMessage.Body.create({ text }), 
                  footer: proto.Message.InteractiveMessage.Footer.create({ 
                  text: 👤 Owned by Deryl • © GhostBot 2025 }), 
                  header: proto.Message.InteractiveMessage.Header.create({ 
                  title: "", subtitle: "Cat is Love", 
                  hasMediaAttachment: false, }), 
                  nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ 
                  buttons: [ { 
                  name: "quick_reply", 
                  buttonParamsJson: {"display_text":${text2},"id":${text3}}, }, ], }), }), }, }, }, {}, ); 
                await client.relayMessage(from, 
                                          msg.message,
                                          { messageId:
                                          msg.key.id },
                                          { quoted: M 
                                          }
                                         ); };

client.log = (text, color = 'green') => color ? console.log(chalk.keyword(color)(text)) : console.log(chalk.green(text))

const loadCommands = async () => { 
  const readCommand = (rootDir) => { readdirSync(rootDir).forEach(($dir) => { 
  const commandFiles = readdirSync(join(rootDir, $dir)).filter((file) => file.endsWith('.js')) 
  for (let file of commandFiles) { 
  const command = require(join(rootDir, $dir, file)) client.cmd.set(command.name, command) } }) 
  client.log('✅ Commands loaded for GhostBot') } readCommand(join(__dirname, '.', 'commands')) }

await EconomyDb.deleteMany({})

client.ev.on('connection.update', async (update) => { const { connection, lastDisconnect } = update

if (update.qr) {
  client.log(`[${chalk.red('!')}]`, 'white')
  client.log(`Scan the QR code above | Or authenticate via http://localhost:${port}`, 'blue')
  client.QR = qr.imageSync(update.qr)
}

if (connection === 'close') {
  const { statusCode } = new Boom(lastDisconnect?.error).output
  if (statusCode !== DisconnectReason.loggedOut) {
    client.log('Reconnecting GhostBot...')
    setTimeout(() => start(), 3000)
  } else {
    clearState()
    client.log('Restarting GhostBot...')
    setTimeout(() => start(), 3000)
  }
}

if (connection === 'connecting') {
  client.state = 'connecting'
  client.log('🔗 Establishing encrypted link with GhostBot HQ for Commander Deryl...')
}

if (connection === 'open') {
  client.state = 'open'
  loadCommands()
  client.log(`🤖 GhostBot is now live. Welcome back, Commander Deryl!`)
}

})

CardHandler(client)

app.get('/', (req, res) => { res.status(300).setHeader('Content-Type', 'image/png').send(client.QR) })

client.ev.on('messages.upsert', 
async (messages) => 
await MessageHandler(messages, client)) 
client.ev.on('group-participants.update',
async (event) => await EventsHandler(event, client)) 
client.ev.on('contacts.update', async (update) => 
await contact.saveContacts(update, client)) 
client.ev.on('creds.update', saveState) return client }

if (!process.env.URL) return console.error('You have not provided any MongoDB URL!!')

driver.connect().then(() => { console.log(Connected to the database!) start() }).catch((err) => console.error(err))

app.listen(port, () => console.log(Server started on PORT : ${port}))
