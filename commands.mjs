export const commands = [
    {
        name: 'generate',
        description: 'Continues generating text from your prompt.',
        type: 1,
        options: [ {
            name: "prompt",
            description: "Initial prompt",
            type: 3,
            required: true,
        } ]
    },
]