import Parser from './parse.js'
import { chat_format_1, chat_format_2, chat_format_1_long, chat_format_1_variation_1 } from './chats.js'

// Intances
const result = new Parser(chat_format_1_variation_1)

// Elements
const mainViewDOM = document.querySelector('.main_view')
const usersDOM = document.querySelector('.users')
const containerDOM = document.querySelector('.container')
// Listeners
containerDOM.addEventListener('drop', (e) => {
  e.preventDefault()
  console.log('droppedd')
})

// Funcions
mainViewDOM.innerHTML = ''
result.messages.forEach(message => {
  const messageDOM = document.createElement('div')
  messageDOM.classList.add('message')
  if(result.users.indexOf(message.user) === 1) {
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


  mainViewDOM.appendChild(messageDOM)
})

usersDOM.innerHTML = ''
result.users.forEach(user => {
  const userDOM = document.createElement('div')
  userDOM.innerText = user
  usersDOM.appendChild(userDOM)
})


