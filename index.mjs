// Imports
import { Client, GatewayIntentBits } from "discord.js"
import { setTimeout } from "timers/promises"
import * as config from "./config.mjs"
import * as func from "./functions.mjs"

// Variables
var channel = null
var messages = [] //channel messages

// Discord client
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
    channel = client.channels.cache.get(config.prodChannelID) // decide channel
    await channel.send('`🤖 Enward. You are. Turning. Me on.`')
})

client.on("messageCreate", async (message) => {
    if (!message) return // return if no message

    // Define user nickname, use username if none available
    if (message.guild.members.cache.get(message.author.id).nickname) message.member.nickname = message.guild.members.cache.get(message.author.id).nickname
        else message.member.nickname = message.member.user.username

    // Save channel message locally
    messages.push({ "id":message.id, "parent":message.reference, "time":message.createdTimestamp, "author":func.sanitise(message.member.nickname), "content":func.sanitise(message.content) }) //push latest message to messages array

    // Check that channel is appropriate and author isn't Enward
    if ((message.channel.id == channel) && (message.author.id != 1068439682460942407) && (message.content.includes('1068439682460942407') || message.mentions.has(client.user) || message.content.toLowerCase().includes('enward'))) { 
        
        // Build chat history using previous messages (if available)
        var query = messages[messages.length-1] //start query at latest message
        var prompt = []
        var exitLoop = false

        while (typeof query !== 'undefined' && !exitLoop) { //so long as query does not fail to find another message, and exitloop flag hasn't been triggered
            try {                   
                prompt.unshift(func.sanitise(query.author) + ': ' + func.sanitise(query.content))
                query = messages.find(function(messages) { return messages.id === query.parent.messageId })
            } 
            catch { 
                query = undefined
            }
        }

        // Prepare response
        prompt = `[This is a Discord server known as Mafia Server].\n***[Example dialogue]\n[Enward: I once wrote a code for someone and they said no tnanks afterward.]\n[Enward: If I can't have full nudity of anime girls doing athletic things then I refuse to accept this. You can't force me to put up with this garbage any longer.]\n[Enward: Oh lord give me the strength to not use lemon juice tonight.]\n***[Enward is a witty, whimsical, enigmatic guy who gives long responses to others. He has a yellow face with beckoning eyes and a wicked smile. He is friends with Gug and JOM.]\n***\n[Style: chat, chatroom.]\n${prompt.join("\n")}\nEnward:` // add personality and style, then prime Enward's response
        if (prompt.length > 8000) prompt = prompt.substring(prompt.length - 8000) //ensure prompt is less than ~4000 tokens
        var response = await generateText(preset, prompt, 1, 64)
        console.log(prompt)

        // Reply
        reply(message, func.sanitise(response))
        console.log(response)
    }
})

// NovelAPI
var preset = {
    model: 'kayra-v1',
    parameters: {
        "ban_brackets": true,
        "bad_words_ids": [],
        "use_string": true,
        "repetition_penalty": 3.9,
        "repetition_penalty_frequency": 0,
        "repetition_penalty_presence": 0,
        "repetition_penalty_range": 8000,
        "repetition_penalty_slope": 0.09,
        "temperature": 1,
        "top_k": 100,
        "top_p": 5,
        "tail_free_sampling": 1,
        "generate_until_sentence": true,
        "cfg_scale":1,
        "cfg_uc":"Project Gutenberg, Read More, :) :(, Series/Side Stories of Rough Play/Dirty Deeds Done Dirt Cheap Series by TheSinBin (XianFrost), 404, ✨😃😊💖☀️, https://www.google.com.au, Pussy.﻿The Last Time by Aphrodisiast (orphanaccount) ",
        "logit_bias_exp": [{"bias":0.01,"ensure_sequence_finish":true,"generate_once":false,"sequence":[[[49230, 49338, 49335]]]}, ],
        "stop_sequences": [[85]],
        "bad_words_ids": [
            [23], //***
            [24], //----
            [25], // "
            [58], //<|maskend|>
            [60], //<|fillend|>
            [530], // -
            [588], //."
            [625], //..
            [821], //...
            [1165], // '
            [1214], //:
            [1431], // [
            [2082], //....
            [2811], //.'
            [3662], //::
            [3939], //):
            [4035], // ...
            [5473], //],
            [7595], // `
            [7794], // ]
            [7975], // ![
            [8209], //!!!s
            [8958], //author
            [10601], //.[
            [10681], //][
            [15033], //.]
            [15614], //Author
            [20932], // ..
            [32303], //]:
            [47214], //:(
            [49211, 7001], //tags
            [49247, 7001], //Tags
            [49264], //"
            [49287], //:
            [49302], //=
            [49352], //]
            [49356], //[
            [49360], //;
            [49405], //>
            [49438], //<
            [49534], //~
            [49969], //`
            [51909], //sus character
        ]
  }
}

// Generate text using NovelAPI
async function generateText(preset, input, min_length, max_length) {
    preset.input = input // use given input
        if (min_length) preset.parameters.min_length = min_length // allow min length to be specified
        if (max_length) preset.parameters.max_length = max_length // allow max length to be specified
    try {
        const response = await fetch('https://api.novelai.net/ai/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.novelAPIKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preset)
        })
        const data = await response.json()
        console.log('Output:', data); // Log the response data
        return data.output // Return the response data as 'output'
    } catch (error) {
        console.error('Error:', error)
        return '`The NovelAPI did not provide a response. Here, have this cookie instead 🍪`'
    }
}

// Reply function
async function reply(message, response) {
    try { 
            message.channel.sendTyping().catch(error => {console.error(`Error typing message: ${error}`)})
            await setTimeout(10000)
            message.reply(response).catch(error => {console.error(`Error sending message: ${error}`)})
    } catch { console.log('Error: Could not reply to message.') }
}