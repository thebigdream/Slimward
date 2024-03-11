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
        name: 'buy',
        description: 'Buy an item.',
        type: 1,
        options: [ {
            name: "item",
            description: "ID of the item you're buying.",
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
    {
        name: 'gen-image',
        description: 'Generate an image using a text prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Prompt.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'gen-text',
        description: 'Generate text based off the initial prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Initial prompt.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'gen-item',
        description: 'Generate an item.',
        type: 1,
        options: [ {
            name: "name",
            description: "What your item is called.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'gen-list',
        description: 'Generate a list of things.',
        type: 1,
        options: [ {
            name: "list",
            description: "What the list will be about.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'inventory',
        description: 'Display a list of owned items.',
        type: 1,
    },
    {
        name: 'players',
        description: 'List all players.',
        type: 1,
    },
    {
        name: 'search',
        description: 'Search for an object.',
        type: 1,
        options: [ {
            name: "id",
            description: "ID of object.",
            type: 3,
            required: true, } ]
    },
    {
        name: 'sell',
        description: 'Sell an item.',
        type: 1,
        options: [ {
            name: "item",
            description: "ID of the item you're selling.",
            type: 3,
            required: true, } ]
    },
]