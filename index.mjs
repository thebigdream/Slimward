/* IMPORTS */
import { Client, Collection, Events, GatewayIntentBits,  SlashCommandBuilder } from "discord.js"
import * as cfg from "./config.mjs"
import * as func from "./functions.mjs"
import * as novelAPI from "./novelAPI.mjs"
import * as cmd from "./commands.mjs"
import random from 'random'

/* EXPORTS */
export var channel

// Variables
var messages = [] // Channel messages are stored locally to prevent fuckery with the Discord API

// Initialise Discord client
export const client = new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,]})
client.login(cfg.discordAPIKey)

// Establish connection to channel
client.on("ready", async () => {
    channel = client.channels.cache.get(cfg.channelID) // Decide channel using cfg file
    await channel.send('`Enward. You are. Turning. Me on.`') // Send opening message
    await client.application.commands.set(cmd.commands) // Load commands
})

// Respond to commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    // Store interaction name and user-defined options
    const { commandName, options } = interaction

    try {
        if (commandName === 'generate') {
            await interaction.deferReply()
            await interaction.editReply(await func.generateText(options.getString('prompt')))
        }
        if (commandName === 'list') {
            await interaction.deferReply()
            await interaction.editReply(await func.generateList(options.getString('prompt')))
        }
    } catch { }
})

// Send a random message occasionally
setInterval(async() => { if (random.int(0,100) === 0) {
    try { await channel.send(await novelAPI.generate(novelAPI.chat, `Enward: How's the weather today, raining cats and dogs?\nEnward: Yesterday I saw a snail and it looked at me funny. I stared back and pulled my tongue out.\nEnward: Get in bitch we're going shopping.\nEnward: Do you think Antarctica and Switzerland are really going to war? The thought keeps me up at night.\nEnward: I don't understand jokes about deez nuts. What's so funny about nuts? Oh wait. Testicles.\nEnward: So what's the deal with airplane food? Rhetorical question.\nEnward:`, 1, 64)) } catch { }}
}, 10000)

// Listen for messages and reply if valid
client.on("messageCreate", async (message) => {
    try {
        // Save message locally
        messages.push({"id":message.id, "parent":message.reference, "time":message.createdTimestamp, "author":func.getName(message), "content":func.sanitise(message.content)}) //push latest message to messages array

        // Check that channel is appropriate and author isn't Enward
        if ((message.channel.id == channel) && (message.author.id != 1068439682460942407) && (message.content.includes('1068439682460942407') || message.mentions.has(client.user) || message.content.toLowerCase().includes('enward'))) { 
            
            // Low chance to end bot conversation
            if (message.author.bot) if (random.int(0,10) === 0) return
            
            // Build chat history using previous messages (if available)
            var query = messages[messages.length-1] // Start query at latest message
            var prompt = []

            // Log previous messages so long as query does not fail to find another message
            while (typeof query !== 'undefined') { 
                try {                   
                    prompt.unshift(func.sanitise(query.author) + ': ' + func.sanitise(query.content))
                    query = messages.find(function(messages) { return messages.id === query.parent.messageId })
                } catch { query = undefined }
            }

            // Prepare response
            prompt = `${cfg.context}\n----\n${cfg.personality}\n----\n[Style: chat, chatroom.]\n${prompt.join("\n")}\nEnward:` // Add personality and style, then prime Enward's response
            var response = await novelAPI.generate(novelAPI.chat, prompt, 1, 64)
            console.log(prompt)

            // Reply
            func.reply(message, func.sanitise(response))
            console.log(response)
        } 
    } catch { console.error('Error:', error) }
})