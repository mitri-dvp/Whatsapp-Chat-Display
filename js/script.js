import Parser from './parse.js'
import { chat_format_1, chat_format_2, chat_format_1_long, chat_format_1_variation_1 } from './chats.js'


const result = new Parser(chat_format_1_variation_1)

// Elements
const main_view = document.querySelector('.main_view')

// Listeners


// Funcions
main_view.innerHTML = ''
result.messages.forEach(message => {
  const messageDOM = document.createElement('div')
  messageDOM.classList.add('message')
  if(result.users.indexOf(message.user) === 0) {
    messageDOM.classList.add('rigth')
  }

  const textDOM = document.createElement('div')
  textDOM.classList.add('text')
  textDOM.innerText = message.message
  
  const timeDOM = document.createElement('div')
  timeDOM.classList.add('time')
  timeDOM.textContent = message.time

  messageDOM.appendChild(textDOM)
  messageDOM.appendChild(timeDOM)


  main_view.appendChild(messageDOM)
})


