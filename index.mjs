/* TO DO
    - add emoji recognition
        - what is the point? for the bot to see and use them?
    - investigate using pm2 again
    - ban }
*/

/* IMPORTS */
import { Client, Collection, Events, GatewayIntentBits,  SlashCommandBuilder } from "discord.js"
import * as cfg from "./config.mjs"
import * as func from "./functions.mjs"
import * as novelAPI from "./novelAPI.mjs"
import * as cmd from "./commands.mjs"
import random from 'random'

/* EXPORTS */
export var channel
export const client = new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,]}); client.login(cfg.discordAPIKey)

// Variables
var messages = [] // Channel messages are stored locally to prevent fuckery with the Discord API

// Establish connection to channel
client.on("ready", async () => {
    channel = client.channels.cache.get(cfg.channelID) // Decide channel using cfg file
    //await channel.send({ embeds: [await func.generateEmbed('What\'s that?', `A wild \`Cunt\` appears! ${client.emojis.cache.find(emoji => emoji.name === 'NPC')}`, cfg.colors.info)] })
    await channel.send({ embeds: [await func.generateEmbed('What\'s that?', `A wild \`Cunt\` appears!`, cfg.colors.info)] })
    await client.application.commands.set(cmd.commands) // Load commands
    //var emojis = channel.guild.emojis.cache
    //var emojiNames = emojis.map(emoji => emoji.name)
    //console.log(emojiNames)
})

// Respond to commands
client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isCommand()) return
        await interaction.deferReply() // Defer reply by default
        const { commandName, options } = interaction // Store interaction name and user-defined options

        if (commandName === '8ball') {
            var input = func.sanitise(options.getString('question'))
                var output = func.sanitise(await novelAPI.generate(novelAPI.chat, `question:should I kill my friend?|answer:yes, but use an axe.|question:will I win the lottery today?|answer:absolutely not.|question:what are my chances of getting laid?|answer:oh buddy you don't want my answer.|question:what do you know about me?|answer:idk I'm here to say yes/no|question:is it okay to do LSD?|answer:maybe?|question:${input}|answer:`, 1, 6))
                var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`🎱 Magic 8 Ball`, `**Question:** ${input}\n**Answer:** ${output}`, cfg.colors.success)] })
            messages.find(message => message.id === reply.id).content = output
        }


        // Combine two items and reply with result.
        if (commandName === 'combine') {
                var item1 = func.sanitise(options.getString('item1'))
                var item2 = func.sanitise(options.getString('item2'))
                var combinedItem = func.sanitise(await func.generateList(`item1:sword|item2:fire|output:sword of fire,sword on fire,flamesword,brightblade,lightbringer,hot sword,flaming sword of justice,pyroblade,\nitem1:Obama|item2:poverty|output:former president,man down on his luck,familiar janitor,mistaken identity,\nitem1:grapes|item2:France|output:vineyards,wine,Bordeaux,wine culture,fruit growing,southern France,Marseilles,fine grapes,agriculture,\nitem1:bath|item2:toaster|output:a bad time,death,electrocution,an electrifying experience,ZAP,regret,end of the road,watery toast,\nitem1:${item1}|item2:${item2}|output:`, 1))
                var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`Combine`, `You combine **${item1}** and **${item2}**, creating **${combinedItem}**.`, cfg.colors.success)] })
            messages.find(message => message.id === reply.id).content = reply.content
        }

        // Generate text using the user's prompt.
        if (commandName === 'generate') {
                var input = func.sanitise(options.getString('prompt'))
                var output = await novelAPI.generate(novelAPI.chat, `He went to the store and bought himself a pair of pants. They were leather and quite elegant. Little did he know they were counterfeit, and later that day, he was stopped by police who arrested him! He professed his innocence, but it was to no avail.|My stupid bitch mom ruins everything! I can't believe she threw away my favourite dress without asking me! My day is ruined. If only I had some way to get back at her, some plot for revenge. Hmm...I'll think about it.|President Wilson was an American politician and academic who served as the 28th president of the United States from 1913 to 1921. A member of the Democratic Party, Wilson served as the president of Princeton University and as the governor of New Jersey before winning the 1912 presidential election.|Do you know where the old woman next door went? She hasn't been around for a while and nobody wants to clean her house. There's already a large flock of birds living in there. It would be nice to give them more room.|${input}`, 24, 64)
                var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`Generate`, `${input}${output}`, cfg.colors.success)] })
            messages.find(message => message.id === reply.id).content = output
        }

        // Generate a list using the user's prompt.
        if (commandName === 'list') {
                var input = func.sanitise(options.getString('prompt'))
                var output = (await func.generateList(`Fruit:grape,melon,rotten apple,watermelon,orange,manderin,mouldy banana,kiwi fruit,blueberry,jack fruit,strawberry,\nWhere I left my keys:in your pockets,in the oven,in the car,under the couch,do you even have keys?,at your friends house,over the fence\nSwords:rapier,dagger (heirloom),sharp knife,ancient broadsword,claymore,greatsword,dirk,\ncountries:Venezuela,Brazil,Australia,United Kingdom,China,Yugoslavia,Japan,Mexico,Fiji,\nHow to get away with murder:bury the body well,bribe the cops,just don't murder anyone,blame someone else,escape to another country,construct a strong alibi,\nmagical artefacts:robe of sorcery,ring of teleportation,mysterious gloves of shimmering light,arthurian sword,cursed undead horse,mithril breastplace of ice,\n${input}:`)).join(', ')
                var reply = await interaction.editReply({ embeds: [await func.generateEmbed(`List`, `**${input}:** ${func.sanitise(output)}.`, cfg.colors.success)] })
            messages.find(message => message.id === reply.id).content = reply.content
        }
    } catch (error) { console.log('Error:' + error) }
})

// Send a random message occasionally
setInterval(async() => { if (random.int(0,100) === 0) {
    try { await channel.send(await novelAPI.generate(novelAPI.chat, `Enward: How's the weather today, raining cats and dogs?\nEnward: Yesterday I saw a snail and it looked at me funny. I stared back and pulled my tongue out.\nEnward: Get in bitch we're going shopping.\nEnward: Do you think Antarctica and Switzerland are really going to war? The thought keeps me up at night.\nEnward: I don't understand jokes about deez nuts. What's so funny about nuts? Oh wait. Testicles.\nEnward: So what's the deal with airplane food? Rhetorical question.\nEnward:`, 1, 64)) } catch (error) { console.log('Error:' + error) }}
}, 10000)

// Listen for messages and reply if valid
client.on("messageCreate", async (message) => {
    try {
        // Save message locally
        messages.push({"id":message.id, "parent":message.reference, "time":message.createdTimestamp, "author":func.getName(message), "content":func.sanitise(message.content)}) //push latest message to messages array

        // Check that channel is appropriate and author isn't Enward
        if ((message.channel.id == channel) && (message.author.id != 1068439682460942407) && (message.content.includes('1068439682460942407') || message.mentions.has(client.user) || message.content.toLowerCase().includes('enward'))) { 

            if (message.author.bot) if (random.int(0,10) === 0) return // Low chance to end bot conversations
            
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

            // Reply
            func.reply(message, func.sanitise(response))
        } 
    } catch (error) { console.error('Error:', error) }
})