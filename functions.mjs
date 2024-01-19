// This file contains commonly used functions.

// Imports
import { setTimeout } from "timers/promises"
import { channel } from "./index.mjs"

// Exports
// Message cleansing
export function sanitise(str) {
    try {
        // Remove opening space, if present
        if (str.charAt(0) == ' ') str = str.slice(1)

        // Replace double and triple spaces with a single space
        str = str.replace(/ {2,}/g, ' ');

        // Capitalize any 'i' that is on its own
        str = str.replace(/\si\s/g, ' I ');

        // Replace multiple exclamation or question marks with a single one
        str = str.replace(/([!?])\1+/g, "$1");

        // Add space after commas if one not already existent
        str = str.replace(/([^ ,])(,)([^ ])/g, '$1, $3');

        // Remove any underscores
        str = str.replace(/_/g, "");

        // Remove any emotes
        str = str.replace(/<[^>]+>/g, "");

        // Replace n-word with Enward
        str = str.replace(/nigger/g, '**Enward**');

        // Replace n-word with Enward
        str = str.replace(/nigga/g, '**Enward**');

        // Replace f-slur with Frogurt
        str = str.replace(/faggot/g, '**Frogurt**');

        // Replace f-slur
        str = str.replace(/fag/g, '**French**');

        // Replace pedo with Pedro
        str = str.replace(/pedo/g, '**Pedro**');

        // Replace r-word with RAM RANCH
        str = str.replace(/retard/g, '**RAM RANCH**');

        // Replace rape with rap battle
        str = str.replace(/rape/g, '**rap battle**');

        // Replace first letter of string with uppercase
        str = str.replace(/^\S/, (match) => match.toUpperCase());

        // Capitalize the first letter of each sentence
        str = str.replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase());

    } catch { }
    return str
}

// Discord reply function
export async function reply(message, response) {
    try { 
            message.channel.sendTyping().catch(error => {console.error(`Error typing message: ${error}`)})
            await setTimeout(10000)
            message.reply(response).catch(error => {console.error(`Error sending message: ${error}`)})
    } catch { console.log('Error: Could not reply to message.') }
}