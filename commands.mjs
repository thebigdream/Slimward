/* EXPORTS */
export const commands = [
    {
        name: '8ball',
        description: 'Shake the magic 8ball',
        type: 1,
        options: [ {
            name: "question",
            description: "Your question for the magic 8ball.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'generate',
        description: 'Generate text based off an initial prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Initial prompt",
            type: 3,
            required: true, } ]
    },
    {
        name: 'list',
        description: 'Generate a list of things.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "What the list will be about.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'combine',
        description: 'Combine two objects together.',
        type: 1,
        options: [ 
        {
            name: "item1",
            description: "Object.",
            type: 3,
            required: true,
        },
        {
            name: "item2",
            description: "Object.",
            type: 3,
            required: true,
        }]
    },
]