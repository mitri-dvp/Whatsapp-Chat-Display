import Parser from './parse.js'
import { chat_english, chat_spanish} from './chats.js'

// Elements
const containerDOM = document.querySelector('.container')
const mainViewDOM = document.querySelector('.main_view')
const modalDOM = document.querySelector('.modal')
const fileUploadDOM = document.querySelector('.file_upload')
const inputDOM = document.querySelector('.file_upload input')
const infoDOM = document.querySelector('.info')
const downloadDOM = document.querySelector('.download')



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

downloadDOM.addEventListener('click', () => {
  const data = new Blob([chat_spanish], {type: 'text/plain'});
  const url = window.URL.createObjectURL(data);
  downloadDOM.href = url;
})

// Funcions
function readChatFile(file) {
  const fileReader = new FileReader()
  fileReader.readAsText(file)

  fileReader.onload = () => {
    modalDOM.classList.remove('dnone')
    modalDOM.innerHTML = `
    <div style="height: 100%; width:100%;display:flex;justify-content:center;align-items:center;">
    <img src="./assets/loading.gif" style="margin: auto;" width="200px" height="">
    </div>
    `
    runWhatsAppParser(fileReader.result)
  }

  fileReader.onerror = () => {
    console.log(fileReader.error)
  }
}

function runWhatsAppParser(chat) {
  let result;
  try {
    
    result = new Parser(chat)
  } catch (error) {
    modalDOM.innerHTML = `
    <p style="text-align: center; margin-top: 1rem;">Seleccione un chat válido...</p>
    `
    return
  }

  modalDOM.classList.add('dnone')

  populateMainView(result)
  populateModal(result) 
}


function populateMainView(result) {
  mainViewDOM.innerHTML = ''

  let prevUser = -1;
  let prevDate = -1;

  result.messages.forEach(message => {
    const messageDOM = document.createElement('div')
    messageDOM.classList.add('message')
    
    if(result.users[message.user].number === 1) {
      messageDOM.classList.add('rigth')
    }
    
    // USER
    const currentDate = message.date
    if(result.users[message.user].number != prevUser || currentDate != prevDate) {
      const userDOM = document.createElement('div')
      userDOM.classList.add('user')
      userDOM.innerHTML = message.user
      prevUser = result.users[message.user].number
      messageDOM.appendChild(userDOM)
    }

    // DATE
    if(currentDate != prevDate) {
      const dateDOM = document.createElement('div')
      dateDOM.classList.add('date')
      dateDOM.innerHTML = message.date
      prevDate = currentDate
      mainViewDOM.appendChild(dateDOM)
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
  // Messages
  let messagesHTML = `<p>
    <span>Total:</span>
    <span>${result.messages.length}</span>
    <span>100%</span>
  </p>
  <div class="bar">
    <div class="amount"></div>
  </div>`

  // Users
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

  // Activity
  let activityHTML = ``
  const sortedDates = Object.entries(result.dates)
  .sort(([,a],[,b]) => b-a)
  .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  const arraySortedDates = Object.entries(sortedDates)
  for (let i = 0; i < arraySortedDates.length; i++) {
    const date = arraySortedDates[i];
    // const percentage = ((date[1] * 100) / result.messages.length).toFixed(2)
    const percentage = ((date[1] * 100) / arraySortedDates[0][1]).toFixed(2)
    activityHTML += `<div>
      <p>${date[0]}</p>
      <div class="bar" >
        <div class="percent">${percentage}%</div>
        <div class="amount" style="height: ${percentage}%"></div>
      </div>
      <p>${date[1]}</p>
    </div>`
    // if(i > 3) {
    //   break
    // }
  }

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
  <h1>actividad</h1>
  <div class="activity">
    ${activityHTML}
  </div>
  `

}
