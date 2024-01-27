/* EXPORTS */
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