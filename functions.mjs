/* IMPORTS */
import * as novelAPI from "./novelAPI.mjs"
import * as cfg from "./config.mjs"
import { EmbedBuilder } from "discord.js"
import { setTimeout } from "timers/promises"
import { channel, ids } from "./index.mjs"
import random from 'random'

/* EXPORTS */
// Generate a Discord embed
export async function generateEmbed(title, description, colour) {
    if (title.length >= 256) title = title.substring(title.length - 256) //ensure title is less than ~256 char
    if (description.length >= 2048) description = description.substring(description.length - 2048) //ensure desc is less than ~2048 char
    try {
        var embed = new EmbedBuilder()
            .setColor(colour)
            .setTitle(title)
            .setDescription(description)
        return embed
    } catch {
        var embed = new EmbedBuilder()
            .setColor(cfg.colors.alert)
            .setTitle('System')
            .setDescription('There was an issue generating an embed message.')
        return embed
    }
}

// Generate an unused ID
export function generateId() {
    // Generate a random number between 1000 and 9999, and a random letter between 'A' and 'Z'
    const randomId = (String.fromCharCode(65 + Math.floor(Math.random() * 26))) + (Math.floor(Math.random() * 9000) + 1000) 
  
    // Check if the random ID already exists in the array, repeat function if so
    for (let i = 0; i < ids.length; i++) {
        if (ids[i] === randomId) {
            return generateId()
        }
    }
  
    // Return the generated random ID
    return randomId
}


// Generate a list of comma-separated items
export async function generateList(prompt, num) {
    let list
    let generated
    if (!num) num = random.int(3,7)

    // Generate list
    while (!generated) {
        list = await novelAPI.generate(novelAPI.list, prompt, 32, 48)
        if (list != undefined && list.includes(',') && !list.includes('!') && !list.includes('?') && list.length > num + 1) {
            generated = true
        } else list = ""
    }

    // Convert to array, remove last item, shuffle list, remove any additional items
    list = list.split(',')
    list.pop()
    list = shuffle(list)
    list = list.slice(0, num)
    return list
}

// Get user's nickname, or failing that, their username
export function getName(message) { 
    if (message.guild.members.cache.get(message.author.id).nickname) return sanitise(message.guild.members.cache.get(message.author.id).nickname)
    else return sanitise(message.member.user.username)
}

// Reply to message author
export async function reply(message, response) {
    try { 
            message.channel.sendTyping().catch(error => {console.error(`Error typing message: ${error}`)})
            await setTimeout(10000)
            message.reply(response).catch(error => {console.error(`Error sending message: ${error}`)})
    } catch { console.log('Error: Could not reply to message.') }
}

// Shuffle items in an array
export function shuffle(array) {
    var count = array.length,
        randomnumber,
        temp
    while( count ){
        randomnumber = Math.random() * count-- | 0
        temp = array[count]
        array[count] = array[randomnumber]
        array[randomnumber] = temp
    }
    return array
}

// Cleanse string of common grammar mistakes, offensive language etc.
export function sanitise(str) {
    try {
        // Remove opening space, if present
        if (str.charAt(0) == ' ') str = str.slice(1)

        // Replace double and triple spaces with a single space
        str = str.replace(/ {2,}/g, ' ')

        // Capitalize any 'i' that is on its own
        str = str.replace(/\si\s/g, ' I ')

        // Replace multiple exclamation or question marks with a single one
        str = str.replace(/([!?])\1+/g, "$1")

        // Add space after commas if one not already existent
        str = str.replace(/([^ ,])(,)([^ ])/g, '$1, $3')

        // Remove underscores
        str = str.replace(/_/g, "")

        // Remove @s
        str = str.replace(/<@.*?>\s*/g, '')

        // Remove newlines
        str = str.replace(/\n/g, '')

        // Remove any emotes
        str = str.replace(/<[^>]+>/g, "")

        // Censored words
        str = str.replace(/fag/gi, '**frenchman**')
        str = str.replace(/faggot/gi, '**frogurt**')
        str = str.replace(/Hitler/gi, '**Shitler**')
        str = str.replace(/nigga/gi, '**enward**')
        str = str.replace(/nigger/gi, '**enward**')
        str = str.replace(/pedo/gi, '**pedro**')
        str = str.replace(/retard/gi, '**RAM RANCH**')
        str = str.replace(/rape/gi, '**rap battle**')
        str = str.replace(/nazi/gi, '**nasi goreng**')
        str = str.replace(/tard/gi, '**toyota**')

        // Replace first letter of string with uppercase
        str = str.replace(/^\S/, (match) => match.toUpperCase())

        // Capitalize the first letter of each sentence
        str = str.replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase())

        // Make URLs lowercase
        str = str.replace(/(?:^|\s)(https?:\/\/\S+)/gi, function(match) {
            return match.toLowerCase();
        })
    } catch { }
    return str
}