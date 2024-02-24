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
        name: 'debug',
        description: 'testing',
        type: 1,
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
    {
        name: 'generate',
        description: 'Generate text based off an initial prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Initial prompt.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'generate-item',
        description: 'Generate an item.',
        type: 1,
        options: [ {
            name: "name",
            description: "What your item is called.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'generate-list',
        description: 'Generate a list of things.',
        type: 1,
        options: [ {
            name: "list",
            description: "What the list will be about.",
            type: 3,
            required: true, } ]
    },
]