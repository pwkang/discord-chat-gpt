const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const { OPENAI_TOKEN, BOT_ID } = process.env;

const configuration = new Configuration({
	apiKey: OPENAI_TOKEN,
});

const openai = new OpenAIApi(configuration);

exports.sendMessage = async (channel, messages, systemMessages) => {
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			...messages.filter(m => !m.content.startsWith('```js\n')).map(m => {
				return { role: m.author === BOT_ID ? 'assistant' : 'user', content: m.content };
			}),
		],
	});

	let answer = completion.data.choices[0].message.content;
	// answer = answer.replaceAll('```\\n', '```js\\n');
	channel.send(answer);
	channel.send(
		'```js\n' +
		`Prompt Token: ${ completion.data.usage.prompt_tokens }\n` +
		`Completion Token: ${ completion.data.usage.completion_tokens }\n` +
		`Total Tokens: ${ completion.data.usage.total_tokens }\n` +
		`USD ${ completion.data.usage.total_tokens / 1000 * 0.002 }` +
		'```',
	);
};
