/* IMPORTS */
import * as novelAPI from "./novelAPI.mjs"
import * as cfg from "./config.mjs"
import { channel } from "./index.mjs"
import { EmbedBuilder } from "discord.js"
import { setTimeout } from "timers/promises"
import { world } from "./savefile.mjs"
import random from 'random'
import path from 'path'

/* EXPORTS */
// Generate an error message embed
export async function error(message) {
    return generateEmbed(undefined, message, cfg.colors.alert, undefined, undefined)
}

// Generate a Discord embed
export async function generateEmbed(title, description, colour, thumbnail, footer) {
    try {
        var embed = new EmbedBuilder()
            if (colour) embed.setColor(colour)
            if (description) embed.setDescription(description)
            if (thumbnail) embed.setThumbnail(`attachment://${path.basename(thumbnail)}`) 
            if (title) title = title.substring(0, 256), embed.setTitle(title) // If there is a title, ensure it is less than ~256 char
            if (footer) embed.setFooter({ text: footer })
        return embed
    } catch {
        return await error('There was an issue generating an embed message.')
    }
}

// Generate an unused ID
export function generateId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let id
    let exists
    do {
        const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length))
        const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        id = randomLetter + randomNumber
        exists = Object.values(world).flat().some(obj => obj.id === id)
    } while (exists) return id
}

// Generate a list of comma-separated items
export async function generateList(prompt, num) {
    let list
    let generated
    if (!num) num = 1

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
    if (num === 1) return list.toString(); else return list
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

// Search for object using ID
export function searchArray(property, value) {
    var matchingItems = []
    for (const key in world) {
        if (world.hasOwnProperty(key) && Array.isArray(world[key])) {
            var results = world[key].filter(item => item[property] === value)
            matchingItems.push(...results)
        }
    }
    console.log(matchingItems)
    return matchingItems.length > 0 ? matchingItems : null
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
        if (str.charAt(0) == ' ') str = str.slice(1) // Remove opening space, if present
        str = str.replace(/ {2,}/g, ' ') // Replace double and triple spaces with a single space
        str = str.replace(/\si\s/g, ' I ') // Capitalize any 'i' that is on its own
        str = str.replace(/([!?])\1+/g, "$1") // Replace multiple exclamation or question marks with a single one
        str = str.replace(/([^ ,])(,)([^ ])/g, '$1, $3') // Add space after commas if one not already existent
        str = str.replace(/_/g, "") // Remove underscores
        str = str.replace(/<@.*?>\s*/g, '') // Remove @s
        str = str.replace(/\n/g, '') // Remove newlines
        str = str.replace(/<[^>]+>/g, "") // Remove any emotes

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

        str = str.replace(/^\S/, (match) => match.toUpperCase()) // Replace first letter of string with uppercase
        str = str.replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase()) // Capitalize the first letter of each sentence

        // Make URLs lowercase
        str = str.replace(/(?:^|\s)(https?:\/\/\S+)/gi, function(match) {
            return match.toLowerCase();
        })
    } catch { }
    return str
}