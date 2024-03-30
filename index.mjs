/* TO DO
    - create general game concept - how do items, people, places, currency interact?
        - users generate prototype items, NPCs and locations
            - these are then used to fill the world using special events
            - the world should also be able to generate its own generic objects
    - create savefile system
    - sort out 'owner' display in embeds
    - add messages for buy, sell etc. commands
    - explore ephemeral embeds
    - create a function for displaying items, NPCs, locations etc.
    - clean up generateEmbed order of fields
    - spin event manager into its own .mjs file
    - send errors when items, messages or w/e fails to generate properly, rather than error text
    - perform error validation on /gen-npc
    - issue with not removing brackets for npcs like heman(her)
*/

/* IMPORTS */
import { Client, Collection, Events, GatewayIntentBits,  SlashCommandBuilder } from "discord.js"
import { world, prototypes } from "./saves/save_1.mjs"
import * as cfg from "./config.mjs"
import * as cmd from "./commands.mjs"
import * as func from "./functions.mjs"
import * as novelAPI from "./novelAPI.mjs"
import random from 'random'
import weighted from 'weighted'
import fs from 'fs'

/* EXPORTS */
export const colors = { info:"#2596be", alert:"#D0342C", success:"#ffcc5f" }
export var channel
export var defaultCharacter = { name: 'Enward', description: 'Enward is a witty, whimsical, enigmatic guy who enjoys verbose discussion. He has a yellow face with beckoning eyes and a wicked smile. He is not afraid to speak his mind.', personality: 'witty, chatty, crude', quote: "'Deez nuts.'"}
export var messages = [] // Channel messages are stored locally to prevent fuckery with the Discord API
export var rarities = { '☆': 0.8, '☆☆': 0.4, '☆☆☆': 0.2, '☆☆☆☆': 0.1, '☆☆☆☆☆': 0.05 }
export const client = new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,]}); client.login(cfg.discordAPIKey)

// Establish connection to channel
client.on("ready", async () => {
    channel = client.channels.cache.get(cfg.channelID) // Decide channel
    await channel.send({ embeds: [await func.generateEmbed(undefined, `A wild \`Cunt\` appears!`, colors.info)] }) // Send opening message
    await client.application.commands.set(cmd.commands) // Load commands

    // Add server members to player array
    channel.guild.members.fetch()
    .then(members => {
        members.forEach(member => {
            if ((!member.user.bot) && (!func.searchArray([world.players], ['name'], [member.user.tag]))) world.players.push({ name: member.user.tag, id: func.generateId(), type: 'player', value: 100 })
        })
    })
    .catch(console.error)
})

// Respond to commands
client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isCommand()) return
        await interaction.deferReply() // Defer reply by default
        const { commandName, options } = interaction // Store interaction name and user-defined options
        var player = func.searchArray([world.players], ['name'], [interaction.user.username])[0] // Log the player involved in case their object needs to be manipulated

        // Ask a magic 8 ball for advice.
        if (commandName === '8ball') {
            let input = func.sanitise(options.getString('question'))
            let output = func.sanitise(await novelAPI.generate(novelAPI.chat, `question:should I kill my friend?|answer:yes, but use an axe.|question:will I win the lottery today?|answer:absolutely not.|question:what are my chances of getting laid?|answer:oh buddy you don't want my answer.|question:what do you know about me?|answer:idk I'm here to say yes/no|question:is it okay to do LSD?|answer:maybe?|question:${input}|answer:`, 1, 6))
            var reply = await interaction.editReply({ embeds: [ await func.generateEmbed(undefined, `**Question:** ${input}\n**Answer:** ${output}`, colors.success) ] })
            messages.find(message => message.id === reply.id).content = output
        }

        // Buy item using ID
        if (commandName === 'buy') {
            let input = func.sanitise(options.getString('item'))
            let item = func.searchArray([world.items], ['id', 'prototype'], [input, false])?.[0]

            // Check that purchase request is valid
            if (!player) return await interaction.editReply({ embeds: [ await func.error('No player found matching your username.') ] }) 
            if (!item) return await interaction.editReply({ embeds: [ await func.error('No item found for this ID.') ] }) 
            if (item.owner) return await interaction.editReply({ embeds: [ await func.error('Item already has an owner.') ] }) 
            if (item.value > player.value) return await interaction.editReply({ embeds: [ await func.error(`Not enough brahcoin to buy this item.`) ] }) 

            player.value += -item.value // Subtract cost
            item.owner = player.name // Assign ownership
            var reply = await interaction.editReply({ embeds: [ await func.generateEmbed(undefined, `You buy \`${item.name}\` for \`${item.value}ḇ\`. You now have \`${player.value}ḇ\``, colors.success, undefined) ] })
        }

        // Combine two items and reply with result.
        if (commandName === 'combine') {
            let item1 = func.sanitise(options.getString('item1'))
            let item2 = func.sanitise(options.getString('item2'))
            let output = func.sanitise(await func.generateList(`item1:sword|item2:fire|output:sword of fire,sword on fire,flamesword,brightblade,lightbringer,hot sword,flaming sword of justice,pyroblade,\nitem1:Obama|item2:poverty|output:former president,man down on his luck,familiar janitor,mistaken identity,\nitem1:grapes|item2:France|output:vineyards,wine,Bordeaux,wine culture,fruit growing,southern France,Marseilles,fine grapes,agriculture,\nitem1:bath|item2:toaster|output:a bad time,death,electrocution,an electrifying experience,ZAP,regret,end of the road,watery toast,\nitem1:${item1}|item2:${item2}|output:`, 1))
            var reply = await interaction.editReply({ embeds: [ await func.generateEmbed(undefined, `You combine **${item1}** and **${item2}**, creating **${output}**.`, colors.success, undefined) ] })
            messages.find(message => message.id === reply.id).content = output
        }

        // Generate text.
        if (commandName === 'gen-text') {
            let input = func.sanitise(options.getString('prompt'))
            let output = await novelAPI.generate(novelAPI.chat, `He went to the store and bought himself a pair of pants. They were leather and quite elegant. Little did he know they were counterfeit, and later that day, he was stopped by police who arrested him! He professed his innocence, but it was to no avail.|My stupid bitch mom ruins everything! I can't believe she threw away my favourite dress without asking me! My day is ruined. If only I had some way to get back at her, some plot for revenge. Hmm...I'll think about it.|President Wilson was an American politician and academic who served as the 28th president of the United States from 1913 to 1921. A member of the Democratic Party, Wilson served as the president of Princeton University and as the governor of New Jersey before winning the 1912 presidential election.|Do you know where the old woman next door went? She hasn't been around for a while and nobody wants to clean her house. There's already a large flock of birds living in there. It would be nice to give them more room.|${input}`, 24, 64)
            var reply = await interaction.editReply({ embeds: [ await func.generateEmbed(undefined, `${input}${output}`, colors.success, undefined) ] })
            messages.find(message => message.id === reply.id).content = output
        }

        // Generate an image.
        if (commandName === 'gen-image') {
            let input = func.sanitise(options.getString('prompt'))
            let image = await novelAPI.generateImage(`${input}`)
            if (image === undefined) {
                return await interaction.editReply({ embeds: [ await func.error('Failed to generate image.') ] })
            }
            var reply = await interaction.editReply({ files: [image] })
            messages.find(message => message.id === reply.id).content = `[Image of a ${input}]`
        }

        // Generate an item.
        if (commandName === 'gen-item') {
            let input = func.sanitise(options.getString('name'))
            let description = func.sanitise(await novelAPI.generate(novelAPI.chat, `item:sword|description:Forged in fire and honed with the wisdom of centuries, this sword is a testament to craftsmanship and strength. Its blade, sharp as the bite of winter's chill, reflects the courage of its bearer, while the hilt, wrapped in leather weathered by time, speaks of resilience and determination. With each swing, it whispers tales of battles won and legends born, a silent guardian in a world of chaos. Its hilt is engraved with a snakelike figure, perhaps a deity or monster. Many covet this item, seeking its rare, radiant power.|item:cat|description:Sleek and silent, the cat moves with a graceful poise that captivates the eye. Its fur, a symphony of hues from ebony to dusk, shimmers in the soft light. With eyes like golden orbs, it observes the world with a knowing gaze, embodying both mystery and elegance in its every step. They say cats have nine lives, but the truth is they have but one, for they never die.|item:Bill Gates|description:Distinguished and visionary, Bill Gates commands the stage with an aura of intellect and purpose. His demeanor, a blend of humility and determination, reflects a lifetime of innovation and philanthropy. Behind his eyes, windows to a mind constantly in motion, lies a wealth of knowledge and foresight that has shaped the modern world. Many have tried to emulate his success, but who can say that they have stood in his shoes?|item:${input}|description:`, 48, 86))
            let thumbnail = await novelAPI.generateImage(`{{${input}}}, amazing quality, very aesthetic, [[black background]]`)
            var reply = await interaction.editReply({ embeds: [await func.generateEmbed(input, description, colors.success, thumbnail, 'Prototype') ], files: [thumbnail] })
            prototypes.items.push({ description:description, name:input, thumbnail:thumbnail })
            messages.find(message => message.id === reply.id).content = `${input}\n${description}`
        }

        // Generate a list using the user's prompt.
        if (commandName === 'gen-list') {
            let input = func.sanitise(options.getString('list'))
            let output = (await func.generateList(`Fruit:grape,melon,rotten apple,watermelon,orange,manderin,mouldy banana,kiwi fruit,blueberry,jack fruit,strawberry,\nWhere I left my keys:in your pockets,in the oven,in the car,under the couch,do you even have keys?,at your friends house,over the fence\nSwords:rapier,dagger (heirloom),sharp knife,ancient broadsword,claymore,greatsword,dirk,\ncountries:Venezuela,Brazil,Australia,United Kingdom,China,Yugoslavia,Japan,Mexico,Fiji,\nHow to get away with murder:bury the body well,bribe the cops,just don't murder anyone,blame someone else,escape to another country,construct a strong alibi,\nmagical artefacts:robe of sorcery,ring of teleportation,mysterious gloves of shimmering light,arthurian sword,cursed undead horse,mithril breastplace of ice,\n${input}:`, random.int(4,7))).join(', ')
            var reply = await interaction.editReply({ embeds: [await func.generateEmbed(undefined, `**${input}:** ${func.sanitise(output)}.`, colors.success, undefined)] })
            messages.find(message => message.id === reply.id).content = output
        }

        // Generate an NPC.
        if (commandName === 'gen-npc') {
            //NPC details
            let input = func.sanitise(options.getString('name'))
            let thumbnail = await novelAPI.generateImage(`{{${input}}}, amazing quality, very aesthetic, portrait, [[black background]]`)
            let details = func.sanitise(await novelAPI.generate(novelAPI.chat, `Blob Monster/A gelatinous being, the Blob Monster absorbs all misfortunate enough to wander into its path. It emits a sickening gurgling noise at all times, announcing its presence to all in earshot./unfriendly, ravenous, antagonist/'Glob blob glob, yummy yummy human flesh, glob glob.'/\nCat/A charming feline companion whose personality embodies the epitome of grace and independence. With sleek fur the color of midnight and luminous emerald eyes that seem to hold ancient secrets, it exudes an air of regal elegance. Yet beneath this dignified exterior lies a mischievous spirit, prone to playful antics and sudden bursts of affection./predatory, playful/'Purrrrr, got any catnip? How about a glass of purrrple drank?'/\nSir Ronald/Valiance personified, Sir Ronald is the bravest knight in the land, wielding a massive sword and gleaming white armour. Descended from noble blood, he has a certain uppishness about him, as if he believes himself destined for a noble fate above all others./loyal, brave, headstrong/'I fight for the king, and the king alone! Who are you to question me?'/\nObama/Former President of the United Stated, Obama spends his days giving lectures, supporting the Democratic Party, and championing his personal causes. He also loves playing basketball when he can find the time./intelligent, politically motivated/'Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for.'/\nTalking Rock/While at first glance it seems like just a rock, to your surprise, you find it begins speaking in a deep, gravelly tone./hardy, steadfast, strong/'I may be just a rock, but I've got heart, buster! Look at me while I'm talking to you.'/\n${input}/`, 124, 148)).split('/')                        
            let character = { name: input, description: details[0], personality: func.sanitise(details[1]), quote: details[2], thumbnail: thumbnail }
            var reply = await interaction.editReply({ embeds: [await func.generateEmbed(input, `**Description**\n${character.description}\n\n**Personality**\n${character.personality}.\n\n**Quote**\n${character.quote}`, colors.success, thumbnail, 'Prototype') ], files: [thumbnail] })
            prototypes.NPCs.push(character) // Add generated NPC to prototype array
            messages.find(message => message.id === reply.id).content = `[generate]`
            messages.find(message => message.id === reply.id).author = character
        }

        // Display player's inventory
        if (commandName === 'inventory') {
            let inventory = func.searchArray([world.items], ['owner', 'prototype'], [player.name, false])
            let output = ''
            if (!inventory) return await interaction.editReply({ embeds: [ await func.error('No items found for this player.') ] })
            for (var i = 0; i < inventory.length; i++) {
                output += `- **${inventory[i].name}** / \`#${inventory[i].id}\` / ${inventory[i].rarity} / \`${inventory[i].value}ḇ\`\n`
            }
            var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`Inventory`, `${output}`, colors.info, undefined)] })
            messages.find(message => message.id === reply.id).content = inventory
        }

        // List all players
        if (commandName === 'players') {
            let output = ''
            for (var i = 0; i < world.players.length; i++) output += `${func.sanitise(world.players[i].name)} / \`#${world.players[i].id}\` / \`${world.players[i].value}ḇ\`\n`
            var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`Players`, `${output}`, colors.info, undefined)] })
        }

        // Look up object by ID
        if (commandName === 'search') {
            let input = func.sanitise(options.getString('id'))
            let object = func.searchArray([world.items, world.players], ['id'], [input])?.[0]
            var replySegments // The segments the embed will be constructed from

            // Send error message if no matching item
            if (!object) return await interaction.editReply({ embeds: [ await func.error('Search returned no results.') ] })

            else if (object.type === 'item') {
                replySegments = { embeds: [ await func.generateEmbed(object.name, object.description, colors.info, object.thumbnail, `#${object.id} / ${object.rarity} / ${object.value}ḇ / Owner: ${object.owner}`) ], }
                if (object.thumbnail) replySegments.files = [ object.thumbnail ] // Add thumbnail if available
            }

            else if (object.type === 'player') {
                replySegments = { embeds: [ await func.generateEmbed(object.name, undefined, colors.info, undefined, `#${object.id} / ${object.value}ḇ`) ], }
            }

            // Send embed
            var reply = await interaction.editReply(replySegments) 
            messages.find(message => message.id === reply.id).content = object.description
        }

        // Sell item using ID
        if (commandName === 'sell') {
            let input = func.sanitise(options.getString('item'))
            let item = func.searchArray([world.items], ['id', 'prototype'], [input, false])?.[0]

            // Check that purchase request is valid
            if (!player) return await interaction.editReply({ embeds: [ await func.error('No player found matching your username.') ] }) 
            if (!item) return await interaction.editReply({ embeds: [ await func.error('No item found for this ID.') ] }) 
            if (item.owner != player.name) return await interaction.editReply({ embeds: [ await func.error('Item not owned by player.') ] }) 

            player.value += item.value
            item.owner = null
            var reply = await interaction.editReply({ embeds: [ await func.generateEmbed(undefined, `You sell the \`${item.name}\` for \`${item.value}ḇ\`. You now have \`${player.value}ḇ\``, colors.success, undefined) ] })
        }
    } catch (error) { console.log('Error:' + error) }
})

// Event manager 
setInterval(async() => {
    try {
        // Send one-shot message
        if (random.int(0,50) === 0) {
            await channel.send('(as Enward) ' + await novelAPI.generate(novelAPI.chat, `Enward: How's the weather today, raining cats and dogs?\nEnward: Yesterday I saw a snail and it looked at me funny. I stared back and pulled my tongue out.\nEnward: Get in bitch we're going shopping.\nEnward: Do you think Antarctica and Switzerland are really going to war? The thought keeps me up at night.\nEnward: I don't understand jokes about deez nuts. What's so funny about nuts? Oh wait. Testicles.\nEnward: So what's the deal with airplane food? Rhetorical question.\nEnward:`, 1, 64))
        }

        // Save world file
        console.log('World saved.')
        fs.writeFileSync('./saves/save_1.mjs', `export var world = ${JSON.stringify(world)}\nexport var prototypes = ${JSON.stringify(prototypes)}\n//export var world = {"items":[],"locations":[],"NPCs":[],"players":[]}\n//export var prototypes = {"items":[],"locations":[],"NPCs":[]}`)
    } catch (error) { console.log('Error:' + error) }
}, 60000)

// Listen for messages and reply if valid
client.on("messageCreate", async (message) => {
    try {
        // Save message locally
        messages.push({"id":message.id, "parent":message.reference, "time":message.createdTimestamp, "author":{name:func.getName(message)}, "content":func.sanitise(message.content)}) //push latest message to messages array

        // Check that channel is appropriate and author isn't Enward
        if ((message.channel.id == channel) && (message.author.id != 1068439682460942407) && (message.content.includes('1068439682460942407') || message.mentions.has(client.user) || message.content.toLowerCase().includes('enward'))) { 

            //Low chance to end bot conversations
            if (message.author.bot) if (random.int(0,10) === 0) return

            // Add one brahcoin for each interaction
            try { func.searchArray([world.players], ['name'], [message.author.username])[0].value++ } catch { }
            
            // Build chat history using previous messages (if available)
            var query = messages[messages.length-1] // Start query at latest message
            var prompt = []
            var character = defaultCharacter // Default to Enward

            // Log previous messages so long as query does not fail to find another message
            while (typeof query !== 'undefined') { 
                try {  
                    try { if (query.content.includes('[generate]')) character = query.author, query = undefined } catch { } // Try to make generated thing the character                 
                    prompt.unshift(func.sanitise(query.author.name) + ': ' + func.sanitise(query.content))
                    query = messages.find(function(messages) { return messages.id === query.parent.messageId })

                } catch (error) { console.log(error), query = undefined }
            }

            prompt = prompt.join('\n')
            prompt = prompt.replace(/Enward/g, character.name)
            prompt = func.sanitise(prompt)
            prompt = `[Description of ${character.name}: ${character.description}.]\n[Personality of ${character.name}: ${func.sanitise(character.personality)}.]\n----\n[Style: chat.]\n----\n${prompt}\n${character.name}:` // Add personality and style, then prime Enward's response
            var response = func.sanitise(await novelAPI.generate(novelAPI.chat, prompt, 1, random.int(1,64)))

            // Reply
            func.reply(message, `(as ${character.name}): ${response}`)
        } 
    } catch (error) { console.error('Error:', error) }
})