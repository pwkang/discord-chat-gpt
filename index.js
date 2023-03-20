// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { sendMessage } = require('./openai');
require('dotenv').config();
const { TOKEN, CATEGORY_ID } = process.env;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.commands = new Collection();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${ c.user.tag }`);
});

client.on(Events.MessageCreate, async message => {
	if ( message.channel.parentId !== CATEGORY_ID ) return;
	if ( message.content.startsWith('new') ) return;
	if ( message.author.bot ) return;
	let messages = await message.channel.messages.fetch();
	messages = messages.map(m => ({
		author: m.author.id,
		content: m.content,
	}));
	const indexOfNew = messages.findIndex(m => m.content.startsWith('new'));
	const systemMessage = messages[indexOfNew]?.content.replace('new', '').trim() || '';
	if ( indexOfNew !== -1 ) {
		messages = messages.slice(0, indexOfNew);
	}
	// invert the messages
	messages = messages.reverse();
	// console.log(messages, systemMessage);
	await sendMessage(message.channel, messages, systemMessage);
});

// Log in to Discord with your client's token
client.login(TOKEN);