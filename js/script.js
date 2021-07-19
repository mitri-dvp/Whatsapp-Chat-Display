import Parser from './parse.js'
import { chat_format_1, chat_format_2, chat_format_1_long, chat_format_1_variation_1 } from './chats.js'

// Elements
const mainViewDOM = document.querySelector('.main_view')
const usersDOM = document.querySelector('.users')
const fileUploadDOM = document.querySelector('.file_upload')
const inputDOM = document.querySelector('.file_upload input')



// Listeners
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  fileUploadDOM.addEventListener(eventName, (e) => {
    e.preventDefault()
    e.stopPropagation()
  }, false)
})

;['dragenter', 'dragover'].forEach(eventName => {
  fileUploadDOM.addEventListener(eventName, (e) => {
    fileUploadDOM.classList.add('active')
  }, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  fileUploadDOM.addEventListener(eventName, (e) => {
    fileUploadDOM.classList.remove('active')
  }, false)
})

fileUploadDOM.addEventListener('drop', (e) => {
  let dt = e.dataTransfer
  const file = dt.files[0]
  readChatFile(file)
}, false)

inputDOM.addEventListener('input', (e) => {
  const file = e.target.files[0]
  readChatFile(file)
})

// Funcions
function readChatFile(file) {
  mainViewDOM.innerHTML = `
  <img src="./assets/loading.gif" width="200px" height="" style="margin: auto;">
  `
  const fileReader = new FileReader()
  fileReader.readAsText(file)

  fileReader.onload = () => {
    runWhatsAppParser(fileReader.result)
  }

  fileReader.onerror = () => {
    console.log(fileReader.error)
  }
}

function runWhatsAppParser(chat) {
  const result = new Parser(chat)

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
}
