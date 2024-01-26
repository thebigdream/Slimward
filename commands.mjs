// Imports
import * as func from "./functions.mjs"
import * as novelAPI from "./novelAPI.mjs"
import random from 'random'

// Exports
export const commands = [
    {
        name: 'generate',
        description: 'Generate text based off an initial prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Initial prompt",
            type: 3,
            required: true,
        } ]
    },
    {
        name: 'list',
        description: 'Generate a list of things.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "What the list will be about.",
            type: 3,
            required: true,
        } ]
    },
]

// Continues generating text after the user's prompt
export async function generateText(prompt) {
    var response = await novelAPI.generate(novelAPI.chat, `He went to the store and bought himself a pair of pants. They were leather and quite elegant. Little did he know they were counterfeit.\nMy stupid bitch mom ruins everything! I can't believe she threw away my favourite dress without asking me! My day is ruined.\nPresident Wilson was an American politician and academic who served as the 28th president of the United States from 1913 to 1921. A member of the Democratic Party, Wilson served as the president of Princeton University and as the governor of New Jersey before winning the 1912 presidential election.\nA song about smallpox: 🎶In days of old, a foe so bold, Smallpox came, its story told🎶.\n${prompt}`, 1, 64)
    return func.sanitise(prompt + response)
}

export async function generateList(prompt) {
    var list
    var generated
    var num = random.int(5,8)

    // Generate list
    while (!generated) {
        var list = await novelAPI.generate(novelAPI.list, `fruit:grape,melon,apple,watermelon,orange,manderin,banana,kiwi fruit,blueberry,jack fruit,strawberry,\nswords:rapier,dagger,knife,broadsword,claymore,greatsword,dirk,\ncountries:Venezuela,Brazil,Australia,United Kingdom,China,Yugoslavia,Japan,Mexico,Fiji,\nsmelly farts:gross,disgusting,how could you do that,gas,cloud,evacuate,flatulence,ass blast,\n${prompt}:`, 48, 64)
        if (list != undefined && list.includes(',') && !list.includes('.') && !list.includes('!') && !list.includes('?') && !list.includes('[') && !list.includes(']') && list.length > num) {
            generated = true
        } else list = ""
    }

    // Trim list
    list = list.split(',').slice(0, num);
    if (num == 1) list = list[0] //don't return as array if just one requested

    // Return list
    return func.sanitise(`**${prompt}**: ${list}`)
}