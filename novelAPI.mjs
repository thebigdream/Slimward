// This file contains functions and variables relating to the NovelAPI

// Imports
import * as config from "./config.mjs"

// Exports
export const preset = {
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
        //"cfg_scale":1,
        //"cfg_uc":"Project Gutenberg, Read More, :) :(, Series/Side Stories of Rough Play/Dirty Deeds Done Dirt Cheap Series by TheSinBin (XianFrost), 404, ✨😃😊💖☀️, https://www.google.com.au, Pussy.﻿The Last Time by Aphrodisiast (orphanaccount) ",
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
            [803], //,"
            [821], //...
            [877], //?"
            [1165], // '
            [1214], //:
            [1431], // [
            [1538], //!"
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
            [20680], //._
            [20932], // ..
            [32303], //]:
            [47214], //:(
            [49211, 7001], //tags
            [49247, 7001], //Tags
            [49264], //"
            [49287], //:
            [49302], //=
            [49313], //_
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

export async function generateText(preset, input, min_length, max_length) {
    preset.input = input // use given input
        if (min_length) preset.parameters.min_length = min_length // allow min length to be specified
        if (max_length) preset.parameters.max_length = max_length // allow max length to be specified
        if (input.length > 8000) input = input.substring(prompt.length - 8000) // Ensure prompt is less than ~4000 tokens
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