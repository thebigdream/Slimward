// This is the index file containing the essential 'loop' of Slimward
// It listens for valid Discord messages and generates replies

// Imports
import { Client, GatewayIntentBits } from "discord.js"
import * as config from "./config.mjs"
import * as func from "./functions.mjs"
import * as novelAPI from "./novelAPI.mjs"
import random from 'random'

// Variables
export var channel = null
var messages = [] // Channel messages are stored locally to prevent fuckery with the Discord API

// Initialise Discord client
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
	],
}); client.login(config.discordAPIKey)

client.on("ready", async () => {
    channel = client.channels.cache.get(config.channelID) // Decide channel
    await channel.send('`Enward. You are. Turning. Me on.`')
})

// Send a random message occasionally
setInterval(async() => { if (random.int(0,100) == 0) await channel.send(await novelAPI.generateText(novelAPI.preset, `Enward: How's the weather today, raining cats and dogs?\nEnward: Yesterday I saw a snail and it looked at me funny. I stared back and pulled my tongue out.\nEnward: Do you think Antarctica and Switzerland are really going to war? The thought keeps me up at night.\nEnward: I don't understand jokes about deez nuts. What's so funny about nuts? Oh wait. Testicles.\nEnward: So what's the deal with airplane food? Rhetorical question.\nEnward:`, 1, 64))}, 6000)

// Listen for messages and reply if valid
client.on("messageCreate", async (message) => {
    if (!message) return

    // Save message locally
    messages.push({"id":message.id, "parent":message.reference, "time":message.createdTimestamp, "author":func.getName(message), "content":func.sanitise(message.content)}) //push latest message to messages array

    // Check that channel is appropriate and author isn't Enward
    if ((message.channel.id == channel) && (message.author.id != 1068439682460942407) && (message.content.includes('1068439682460942407') || message.mentions.has(client.user) || message.content.toLowerCase().includes('enward'))) { 
        
        // Build chat history using previous messages (if available)
        var query = messages[messages.length-1] // Start query at latest message
        var prompt = []
        var exitLoop = false

        // Log previous messages so long as query does not fail to find another message, and exitloop flag hasn't been triggered
        while (typeof query !== 'undefined' && !exitLoop) { 
            try {                   
                prompt.unshift(func.sanitise(query.author) + ': ' + func.sanitise(query.content))
                query = messages.find(function(messages) { return messages.id === query.parent.messageId })
            } catch { query = undefined }
        }

        // Prepare response
        prompt = `[This is a Discord server known as Mafia Server.]\n----\n[Enward is a witty, whimsical, enigmatic guy who gives long responses to others. He has a yellow face with beckoning eyes and a wicked smile. He is friends with Gug and JOM.]\n----\n[Style: chat, chatroom.]\n${prompt.join("\n")}\nEnward:` // Add personality and style, then prime Enward's response
        if (prompt.length > 8000) prompt = prompt.substring(prompt.length - 8000) // Ensure prompt is less than ~4000 tokens
        var response = await novelAPI.generateText(novelAPI.preset, prompt, 1, 64)
        console.log(prompt)

        // Reply
        func.reply(message, func.sanitise(response))
        console.log(response)
    }
})