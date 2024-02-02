/* IMPORTS */
import * as config from "./config.mjs"

/* EXPORTS */
// Used when generating chat-like text or descriptions.
export const chat = {
    model: 'kayra-v1',
    parameters: {
        "ban_brackets": true,
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
        "logit_bias_exp": [{"bias":0.01,"ensure_sequence_finish":true,"generate_once":false,"sequence":[[[49230, 49338, 49335]]]}, ],
        "stop_sequences": [[85]],
        "bad_words_ids": []
  }
}

// Used when generating lists of items. Biases commas and bans periods to ensure lists successfully generate.
export const list = {
    model: 'kayra-v1',
    parameters: {
        "ban_brackets": true,
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
        "logit_bias_exp": [{"bias":0.05,"ensure_sequence_finish":true,"generate_once":false,"sequence":[[49231]]}, {"bias":-2.0,"ensure_sequence_finish":true,"generate_once":true,"sequence":[[30]]}],
        "bad_words_ids": [
            [85], // newline
            [49230], //.
        ],
    }
}

// Array of tokens that should ALWAYS be banned because they degrade output quality.
const defaultBannedTokens = [
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
    [900], //).
    [1214], //:
    [1431], // [
    [1538], //!"
    [1821], // *
    [2082], //....
    [2531], //**
    [2811], //.'
    [3662], //::
    [3939], //):
    [4035], // ...
    [5473], //],
    [7595], // `
    [7794], // ]
    [7975], // ![
    [8209], //!!!s
    [8552], //,,
    [8958], //author
    [10601], //.[
    [10681], //][
    [15033], //.]
    [15614], //Author
    [20680], //._
    [20932], // ..
    [22549], // **
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
    [49399], //*
    [49405], //>
    [49438], //<
    [49534], //~
    [49969], //`
    [51909], //sus space character
]

export async function generate(preset, input, min_length, max_length) {
    console.log(input)
    var tempPreset = JSON.parse(JSON.stringify(preset)) // Create a temporary version of the preset object so it can be manipulated.
    tempPreset.input = input
    tempPreset.parameters.bad_words_ids.push(...defaultBannedTokens)
        if (min_length) tempPreset.parameters.min_length = min_length
        if (max_length) tempPreset.parameters.max_length = max_length
        if (input.length > 8000) input = input.substring(input.length - 8000) // Ensure prompt is less than ~4000 tokens.
    try {
        const response = await fetch('https://api.novelai.net/ai/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.novelAPIKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tempPreset)
        })
        const data = await response.json()
        console.log('Output:', data); // Log the response data
        return data.output // Return the response data as 'output'
    } catch (error) {
        console.error('Error:', error)
        return '`The NovelAPI did not provide a response. Here, have this cookie instead 🍪`'
    }
}