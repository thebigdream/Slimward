/* IMPORTS */
import * as novelAPI from "./novelAPI.mjs"
import * as cfg from "./config.mjs"
import { channel } from "./index.mjs"
import { EmbedBuilder } from "discord.js"
import { setTimeout } from "timers/promises"
import { world, prototypes } from "./saves/save_1.mjs"
import path from 'path'
import random from 'random'
import weighted from 'weighted'

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

// Generate an unused ID.
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

// Generate a list of comma-separated items.
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

    // Convert to array, remove last item, shuffle list, remove any additional items.
    list = list.split(',')
    list.pop()
    list = shuffle(list)
    list = list.slice(0, num)
    if (num === 1) return list.toString(); else return list
}

// Generate an object using an existing prototype.
export function generateObject(type) {
    var searchResults = searchArray([prototypes], ['type'], [type]) // Get a list of all prototypes matching the desired type.
        if (!searchResults) return
        console.log(searchResults)
    var object = Object.assign(searchResults[random.int(0, searchResults.length-1)]) // Clone the prototype into a new object.
        object.id = generateId()
        object.rarity = weighted.select({ '☆': 0.8, '☆☆': 0.4, '☆☆☆': 0.2, '☆☆☆☆': 0.1, '☆☆☆☆☆': 0.05 })
            if (object.type === 'Item') object.value = object.rarity.length * random.int(1,50)
            else if (object.type === 'NPC') object.value = object.rarity.length * random.int(50,100)
            else if (object.type === 'Location') object.value = object.rarity.length * random.int(100,200)
        world.push(object)
    return object
}

// Generate a prototypical object.
export async function generatePrototype(name) {
    let properties = sanitise(await novelAPI.generate(novelAPI.generator,`
##This is a generator that strictly follows the specification.
##[Specification]
##Type MUST ONLY BE 'NPC', 'location', or 'item'. Items are objects like food or weapons, locations are physical spaces like a field, and NPCs are living things.
##Rarity is a value from 1 to 10, where 1 is something very common, and 10 is something very special and one-of-a-kind.
##[Generator]
##ID|Name|Type|Description|Rarity|Traits
##====|====|====|====|====
01|Sad Sam|NPC|A man with a sorrowful demeanour. Why is he so sad? Maybe he needs a hug.|Sad, depressed, morose
02|Donut|Item|A delicious pink donut that demands to be eaten. Looks kind of like the one from the Simpsons.|Tasty, fun, colourful
03|Epic Flamesword|Item|A flaming hot sword that gleams with fury.|scathing, hot, epic
04|Barack Obama|NPC|The former president of the United States. Now in retirement, he lives a quiet but dignified life.|Intelligent, disarming, diplomatic
05|Grenade|Item|An explosive thrown device that will destroy almost anything. Kaboom!|Explosive
06|The Leaning Tower of Pisa|Location|A tower with a terrifying lean, threatening to fall over at any moment.|Fragile, old
07|Village|location|Just your average, peaceful vilage. Sometimes things happen here, but more often than note, they don't.|Bustling
08|Guy Down the Street|NPC|He's a guy down the street, everyone knows him. Sometimes he waves and people wave back.|Distant, neighbourly
09|Gunblade|Item|Simultaneously a blade and a gun, you don't want either side pointed at you. Users beware, it's all too easy to stab yourself while shooting.|Multifaceted, deadly
10|The Starry Night painting by Vincent Van Gogh|Item|A masterpiece painted by a master painter.|Classic, inventive
11|${name}|`, 100, 150)).match(/^[^\n]*/)[0].split('|')
    let thumbnail = await novelAPI.generateImage(`{{${name}}}, amazing quality, very aesthetic, [[black background]]`)
    let object = { description:properties[1], name:name, thumbnail:thumbnail, traits:properties[3], type:properties[0] }
    prototypes.push(object)
    return object
}

// Get user's nickname, or failing that, their username
export function getName(message) { 
    if (message.guild.members.cache.get(message.author.id).nickname) return sanitise(message.guild.members.cache.get(message.author.id).nickname)
    else if (message.member.user.username) return sanitise(message.member.user.username) 
    else return 'User'
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
export function searchArray(arrays, propertiesArray, valuesArray) {
    var matches = arrays.flatMap(array => {
        return array.filter(item => {
            return propertiesArray.every((props, index) => {
                return item.hasOwnProperty(props) && item[props] === valuesArray[index]
            })
        })
    });
    return matches.length > 0 ? matches : null;
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
        str = str.replace(/<[^>]+>/g, '') // Remove any emotes
        str = str.replace(/\(as\s*[^)]*\):\s*/g, '') // Remove impersonation text

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