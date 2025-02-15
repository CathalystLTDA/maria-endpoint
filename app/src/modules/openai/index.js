// const { OpenAI } = require('openai');
// const { waitForRunCompletion } = require('../../utils');
// const prisma = require('../../modules/database');

// require('dotenv').config();

// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// class OpenAIModule {
//     constructor() {
//         this.openai = openai
//     }

//     async createThread() {
//         try {
//             const thread = await this.openai.beta.threads.create();
//             return thread.id
//         } catch (error) {
//             console.error('Erro ao criar thread na OpenAI:', error);
//             throw error;
//         }
//     }

//     async saveMessage(chatId, state, messageContent, threadId) {
//         const chat = await prisma.chat.upsert({
//             where: { chatId: chatIdString },
//             update: {},
//             create: { chatId: chatIdString }
//         });
//         try {
//             await prisma.conversationstates.create({
//                 data: {
//                     chatId: chat.id,
//                     threadId: threadId,
//                     messageContent: messageContent,
//                     lastAssistantMessageTimestamp: state.lastAssistantMessageTimestamp,
//                     createdat: state.lastAssistantMessageTimestamp,
//                     updatedat: state.lastAssistantMessageTimestamp,
//                 }
//             });
//         } catch (error) {
//             console.error('Erro ao salvar a mensagem:', error);
//             throw error;
//         }
//     }

//     async getAssistantResponse(threadId, runId, newAssistantMessage, assistant_id = null) {
//         let interval
//         try {
//             return new Promise((resolve, reject) => {
//                 interval = setInterval(async () => {
//                     try {
//                         const runStatus = await this.openai.beta.threads.runs.retrieve(threadId, runId);

//                         if (runStatus.status === "completed") {
//                             const message = await this.openai.beta.threads.messages.retrieve(
//                                 threadId,
//                                 newAssistantMessage
//                             );

//                             clearInterval(interval);
//                             resolve(message.content[0].text.value);
//                         }
//                     } catch (error) {
//                         console.error("Erro na promise: " + error)
//                         reject(error);
//                     }
//                 }, 2500); // Adjust this interval as necessary
//             });

//         } catch (error) {
//             console.error("Erro no try catch: " + error)
//             throw error; // Rethrow the error to handle it in the calling function
//         }
//     }

//     async ensureThreadId(chatId) {
//         const checkIfThreadIdExists = await prisma.userState.findUnique({
//             where: { chatId: chatId }
//         });

//         if (checkIfThreadIdExists === null || checkIfThreadIdExists.threadId === null) {
//             const emptyThread = await this.openai.beta.threads.create();
//             return emptyThread.id
//         }

//         const existingThread = await this.openai.beta.threads.retrieve(
//             checkIfThreadIdExists.threadId
//         );

//         return existingThread.id
//     }

//     async handleAddMessageToThread(threadId, msg) {
//         await this.openai.beta.threads.messages.create(threadId, {
//             role: "user",
//             content: msg.body || transcription || location
//         });

//         // TEMPORARY - REMOVE KEY
//         const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: "asst_Lpc5taxnpowDuMOfOZeiSvkM" });

//         try {
//             const assistantMessageId = await waitForRunCompletion(threadId, run.id);
//             return [assistantMessageId, run.id]
//         } catch (error) {
//             console.error(`Error waiting for run completion for chat ${threadId}:`, error)
//             return;
//         }
//     }

//     async handleAddVoiceMessageToThread(threadId, transcription ) {
//         await this.openai.beta.threads.messages.create(threadId, {
//             role: "user",
//             content: transcription
//         });

//         const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: "asst_Lpc5taxnpowDuMOfOZeiSvkM" });

//         try {
//             const assistantMessageId = await waitForRunCompletion(threadId, run.id);
//             return [assistantMessageId, run.id]
//         } catch (error) {
//             console.error(`Error waiting for run completion for chat ${threadId}:`, error)
//             return;
//         }
//     }

//     async handleAddLocationMessageToThread(threadId, msg) {
//         await this.openai.beta.threads.messages.create(threadId, {
//             role: "user",
//             content: msg
//         });

//         const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: "asst_Lpc5taxnpowDuMOfOZeiSvkM" });

//         try {
//             const assistantMessageId = await waitForRunCompletion(threadId, run.id);
//             return [assistantMessageId, run.id]
//         } catch (error) {
//             console.error(`Error waiting for run completion for chat ${threadId}:`, error)
//             return;
//         }
//     }

// }

// module.exports = new OpenAIModule();
const { OpenAI } = require('openai')
const { waitForRunCompletion } = require('../../utils')
const prisma = require('../../modules/database')

require('dotenv').config()

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	defaultHeaders: {
		'OpenAI-Beta': 'assistants=v2',
	},
})

class OpenAIModule {
	constructor() {
		this.openai = openai
	}

	async createThread() {
		try {
			const thread = await this.openai.beta.threads.create()
			return thread.id
		} catch (error) {
			console.error('Error creating thread in OpenAI:', error)
			throw error
		}
	}

	async saveMessage(chatId, state, messageContent, threadId) {
		const chat = await prisma.chat.upsert({
			where: { chatId: chatId },
			update: {},
			create: { chatId: chatId },
		})
		try {
			await prisma.conversationstates.create({
				data: {
					chatId: chat.id,
					threadId: threadId,
					messageContent: messageContent,
					lastAssistantMessageTimestamp: state.lastAssistantMessageTimestamp,
					createdat: state.lastAssistantMessageTimestamp,
					updatedat: state.lastAssistantMessageTimestamp,
				},
			})
		} catch (error) {
			console.error('Error saving message:', error)
			throw error
		}
	}

	async getAssistantResponse(threadId, runId, newAssistantMessage, assistant_id = null) {
		let interval
		try {
			return new Promise((resolve, reject) => {
				interval = setInterval(async () => {
					try {
						const runStatus = await this.openai.beta.threads.runs.retrieve(threadId, runId)
						if (runStatus.status === 'completed') {
							const message = await this.openai.beta.threads.messages.retrieve(threadId, newAssistantMessage)
							clearInterval(interval)
							resolve(message.content[0].text.value)
						}
					} catch (error) {
						console.error('Error in promise:', error)
						reject(error)
					}
				}, 2500) // Adjust this interval as necessary
			})
		} catch (error) {
			console.error('Error in try catch:', error)
			throw error
		}
	}

	async ensureThreadId(chatId) {
		const checkIfThreadIdExists = await prisma.userState.findUnique({
			where: { chatId: chatId },
		})

		if (checkIfThreadIdExists === null || checkIfThreadIdExists.threadId === null) {
			const emptyThread = await this.openai.beta.threads.create()
			return emptyThread.id
		}

		const existingThread = await this.openai.beta.threads.retrieve(checkIfThreadIdExists.threadId)
		return existingThread.id
	}

	async handleAddMessageToThread(threadId, msg) {
		// Since we're handling plain text messages, we use msg.body.
		// (If additional data types are needed, handle them in the respective functions.)
		await this.openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: msg.body,
		})

		// TEMPORARY - REMOVE KEY
		const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: 'asst_Lpc5taxnpowDuMOfOZeiSvkM' })

		try {
			const assistantMessageId = await waitForRunCompletion(threadId, run.id)
			return [assistantMessageId, run.id]
		} catch (error) {
			console.error(`Error waiting for run completion for chat ${threadId}:`, error)
			return
		}
	}

	async handleAddVoiceMessageToThread(threadId, transcription) {
		await this.openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: transcription,
		})

		const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: 'asst_Lpc5taxnpowDuMOfOZeiSvkM' })

		try {
			const assistantMessageId = await waitForRunCompletion(threadId, run.id)
			return [assistantMessageId, run.id]
		} catch (error) {
			console.error(`Error waiting for run completion for chat ${threadId}:`, error)
			return
		}
	}

	async handleAddLocationMessageToThread(threadId, msg) {
		await this.openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: msg,
		})

		const run = await this.openai.beta.threads.runs.create(threadId, { assistant_id: 'asst_Lpc5taxnpowDuMOfOZeiSvkM' })

		try {
			const assistantMessageId = await waitForRunCompletion(threadId, run.id)
			return [assistantMessageId, run.id]
		} catch (error) {
			console.error(`Error waiting for run completion for chat ${threadId}:`, error)
			return
		}
	}
}

module.exports = new OpenAIModule()
