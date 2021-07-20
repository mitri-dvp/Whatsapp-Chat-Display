import Parser from './parse.js'
// import { chat_format_1, chat_format_2, chat_format_1_long, chat_format_1_variation_1 } from './chats.js'

// Elements
const containerDOM = document.querySelector('.container')
const mainViewDOM = document.querySelector('.main_view')
const modalDOM = document.querySelector('.modal')
const fileUploadDOM = document.querySelector('.file_upload')
const inputDOM = document.querySelector('.file_upload input')
const infoDOM = document.querySelector('.info')



// Listeners
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  containerDOM.addEventListener(eventName, (e) => {
    e.preventDefault()
    e.stopPropagation()
  }, false)
})

;['dragenter', 'dragover'].forEach(eventName => {
  containerDOM.addEventListener(eventName, (e) => {
    fileUploadDOM.parentElement.classList.add('active')
  }, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  containerDOM.addEventListener(eventName, (e) => {
    fileUploadDOM.parentElement.classList.remove('active')
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

infoDOM.addEventListener('click', () => {
  modalDOM.classList.toggle('dnone')
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
  console.log(result)

  populateMainView(result)
  populateModal(result) 
}


function populateMainView(result) {
  mainViewDOM.innerHTML = ''

  let prevUser = -1;
  let prevDay = -1;

  result.messages.forEach(message => {
    const messageDOM = document.createElement('div')
    messageDOM.classList.add('message')

    if(result.users[message.user].number === 1) {
      messageDOM.classList.add('rigth')
    }
  
    // DATE
    const currentDay = message.date.split('/')[1]
    if(currentDay != prevDay) {
      const dateDOM = document.createElement('div')
      dateDOM.classList.add('date')
      dateDOM.innerHTML = message.date
      prevDay = currentDay
      messageDOM.classList.add('date')
      messageDOM.appendChild(dateDOM)
    }

    // USER
    if(result.users[message.user].number != prevUser) {
      const userDOM = document.createElement('div')
      userDOM.classList.add('user')
      userDOM.innerHTML = message.user
      prevUser = result.users[message.user].number
      messageDOM.appendChild(userDOM)
    }

    // TEXT
    const textDOM = document.createElement('div')
    textDOM.classList.add('text')
    textDOM.innerText = message.message
    messageDOM.appendChild(textDOM)
    
    // TIME
    const timeDOM = document.createElement('div')
    timeDOM.classList.add('time')
    timeDOM.textContent = message.time
    messageDOM.appendChild(timeDOM)
  
    mainViewDOM.appendChild(messageDOM)
  })
}

function populateModal(result) {
  let messagesHTML = `<p>
    <span>Total:</span>
    <span>${result.messages.length}</span>
    <span>100%</span>
  </p>
  <div class="bar">
    <div class="amount"></div>
  </div>`

  Object.keys(result.users).forEach(user => {
    const percentage = (result.users[user].messages.length * 100 / result.messages.length).toFixed(2)
    messagesHTML += `<p>
    <span>${user}:</span>
    <span>${result.users[user].messages.length}</span>
    <span>${percentage}%</span>
  </p>
  <div class="bar">
    <div class="amount" style="width: ${percentage}%;"></div>
  </div>`
  })

  modalDOM.innerHTML = `
  <h1>Mensajes</h1>
  <div class="messages">
    ${messagesHTML}
  </div>
  <h1>Fecha</h1>
  <div class="dates">
    <p>
      <span>Inicio:</span>
      <span>${result.messages[0].date}</span>
    </p>
    <p>
      <span>Final:</span>
      <span>${result.messages[result.messages.length - 1].date}</span>
    </p>
  </div>
  `

}
