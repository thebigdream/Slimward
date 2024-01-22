// This file contains commonly used functions

// Imports
import { setTimeout } from "timers/promises"
import { channel } from "./index.mjs"

// Exports

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

// Cleanse message of common grammar mistakes, offensive language etc.
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

        // Remove emotes
        str = str.replace(/<[^>]+>/g, "")

        // Censored words
        str = str.replace(/fag/gi, '**french**')
        str = str.replace(/faggot/gi, '**frogurt**')
        str = str.replace(/Hitler/gi, '**Shitler**')
        str = str.replace(/nigga/gi, '**enward**')
        str = str.replace(/nigger/gi, '**enward**')
        str = str.replace(/pedo/gi, '**pedro**')
        str = str.replace(/retard/gi, '**RAM RANCH**')
        str = str.replace(/rape/gi, '**rap battle**')
        str = str.replace(/nazi/gi, '**nasi goreng**')

        // Replace first letter of string with uppercase
        str = str.replace(/^\S/, (match) => match.toUpperCase());

        // Capitalize the first letter of each sentence
        str = str.replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase());

    } catch { }
    return str
}