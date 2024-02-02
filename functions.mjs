/* IMPORTS */
import * as novelAPI from "./novelAPI.mjs"
import { EmbedBuilder } from "discord.js"
import { setTimeout } from "timers/promises"
import { channel } from "./index.mjs"
import random from 'random'

/* EXPORTS */
// Combine two concepts into one

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

    // Convert to array, remove last item, shuffle list, remove any additional items, return as string
    list = list.split(', ')
    //list.pop()
    list = shuffle(list)
    list = list.slice(0, num).toString()
    return list
}

// Continues generating text after the user's prompt
export async function generateText(prompt) {
    var response = await novelAPI.generate(novelAPI.chat, `He went to the store and bought himself a pair of pants. They were leather and quite elegant. Little did he know they were counterfeit.\nMy stupid bitch mom ruins everything! I can't believe she threw away my favourite dress without asking me! My day is ruined.\nPresident Wilson was an American politician and academic who served as the 28th president of the United States from 1913 to 1921. A member of the Democratic Party, Wilson served as the president of Princeton University and as the governor of New Jersey before winning the 1912 presidential election.\nA song about smallpox: 🎶In days of old, a foe so bold, Smallpox came, its story told🎶.\n${prompt}`, 1, 64)
    return sanitise(`${prompt} ${response}`)
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
    console.log(array)
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