import Parser from './parse.js'
import { chat_format_1, chat_format_2, chat_format_1_long, chat_format_1_variation_1 } from './chats.js'


const messages = new Parser(chat_format_1_variation_1).messages

messages.forEach(message => {})


