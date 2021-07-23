import Parser from './parse.js'
import { chat_english, chat_spanish} from './chats.js'

// Elements
const containerDOM = document.querySelector('.container')
const mainViewDOM = document.querySelector('.main_view')
const modalDOM = document.querySelector('.modal')
const fileUploadDOM = document.querySelector('.file_upload')
const inputDOM = document.querySelector('.file_upload input')
const infoDOM = document.querySelector('.info')
const homeDOM = document.querySelector('.home')
const downloadDOM = document.querySelector('.download')
const introductionDOM = document.querySelector('.introduction')
let _i = 0
let prevUser = -1;
let prevDate = -1;
let buttonsContainerDOM;


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

homeDOM.addEventListener('click', () => {
  modalDOM.classList.add('dnone')
  introductionDOM.classList.remove('dnone')
  mainViewDOM.innerHTML = ''
  modalDOM.innerHTML = `<p style="text-align: center; margin-top: 1rem;">Seleccione un chat...</p>`
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
    setTimeout(() => {
      runWhatsAppParser(fileReader.result)
    }, 0);
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
    console.error(error)
    modalDOM.innerHTML = `
    <p style="text-align: center; margin-top: 1rem;">Seleccione un chat válido...</p>
    `
    return
  }

  _i = 0
  modalDOM.classList.add('dnone')
  introductionDOM.classList.add('dnone')

  populateMainView(result)
  populateModal(result) 
}


function populateMainView(result) {
  mainViewDOM.innerHTML = ''

  // MESSAGES
  for (let i = 0; i < result.messages.length; i++) { 
    _i++
    if(_i > 50) {
      const newButtonsContainerDOM = document.createElement('div')
      newButtonsContainerDOM.classList.add('buttons')

      const newViewMoreDOM = document.createElement('div')
      newViewMoreDOM.classList.add('view_more')
      newViewMoreDOM.innerHTML = `ver más`
      newButtonsContainerDOM.appendChild(newViewMoreDOM)

      const newViewAllDOM = document.createElement('div')
      newViewAllDOM.classList.add('view_all')
      newViewAllDOM.innerHTML = `ver todos`
      newButtonsContainerDOM.appendChild(newViewAllDOM)
      
      mainViewDOM.appendChild(newButtonsContainerDOM)

      buttonsContainerDOM = newButtonsContainerDOM
      

      newViewMoreDOM.onclick = () => {
        viewMoreMessages(result, _i)
      }
 
      newViewAllDOM.onclick = () => {
        newViewAllDOM.classList.add('loading')
        setTimeout(() => {
          viewAllMessages(result)
        }, 0);
      }
      break
    }

    const message = result.messages[i];
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
      dateDOM.id = message.date
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
  }
}

function populateModal(result) {
  modalDOM.innerHTML = ''
  // Messages
  const messagesHeaderDOM = document.createElement('h1')
  messagesHeaderDOM.textContent = `mensajes`
  modalDOM.appendChild(messagesHeaderDOM)

  const messagesContainerDOM = document.createElement('div')
  messagesContainerDOM.classList.add('messages')
  messagesContainerDOM.innerHTML = getModalMessagesHTML(result)
  modalDOM.appendChild(messagesContainerDOM)

  const datesHeaderDOM = document.createElement('h1')
  datesHeaderDOM.textContent = `fecha`
  modalDOM.appendChild(datesHeaderDOM)

  const datesContainerDOM = document.createElement('div')
  datesContainerDOM.classList.add('dates')
  datesContainerDOM.innerHTML = getModalDatesHTML(result)
  modalDOM.appendChild(datesContainerDOM)

  const activityHeaderDOM = document.createElement('h1')
  activityHeaderDOM.textContent = `días mas activos`
  modalDOM.appendChild(activityHeaderDOM)

  // Activity
  const activityContainerDOM = document.createElement('div')
  activityContainerDOM.classList.add('activity')

  const arraySortedDates = getModalSortedDates(result)
  let i = 0;
  while (true) {
    const date = arraySortedDates[i];
    
    const percentage = ((date[1] * 100) / result.messages.length).toFixed(2)
    // const percentage = ((date[1] * 100) / arraySortedDates[0][1]).toFixed(2)

    const activityBodyDOM = document.createElement('div')

    const dateDOM = document.createElement('p')
    dateDOM.classList.add('date')
    dateDOM.innerText = date[0]
    dateDOM.onclick = () => {
      dateDOM.classList.add('loading')
      setTimeout(() => {
        while (true) {
          if(document.getElementById(date[0])) {
            const dateFoundDOM = document.getElementById(date[0])
            mainViewDOM.scrollTop = dateFoundDOM.offsetTop - dateFoundDOM.offsetHeight *2
            modalDOM.classList.add('dnone')
            dateDOM.classList.remove('loading')
            break
          }
          viewMoreMessages(result, _i)
        }
      }, 0);
    }
    activityBodyDOM.appendChild(dateDOM)
    
    const barDOM = document.createElement('div')
    barDOM.classList.add('bar')
    barDOM.innerHTML = `<div class="percent">${percentage}%</div>
    <div class="amount" style="height: ${percentage}%"></div>`
    activityBodyDOM.appendChild(barDOM)

    const countDOM = document.createElement('p')
    countDOM.innerText = date[1]
    activityBodyDOM.appendChild(countDOM)

    activityContainerDOM.appendChild(activityBodyDOM)

    i++
    if(i > arraySortedDates.length - 1) {
      activityContainerDOM.classList.remove('with_view_more')
      break
    }

    if(i > 4) {
      const newViewMoreActivity = document.createElement('div')
      newViewMoreActivity.classList.add('view_more')
      newViewMoreActivity.innerHTML = `ver más`
      activityContainerDOM.appendChild(newViewMoreActivity)

      const newViewAllActivityDOM = document.createElement('div')
      newViewAllActivityDOM.classList.add('view_all')
      newViewAllActivityDOM.innerHTML = `ver todos`
      activityContainerDOM.appendChild(newViewAllActivityDOM)

      newViewMoreActivity.onclick = () => {
        viewMoreActivity(result, arraySortedDates, i, activityContainerDOM, [newViewAllActivityDOM, newViewMoreActivity])
      }

      newViewAllActivityDOM.onclick = () => {
        viewAllActivity(result, arraySortedDates, i, activityContainerDOM, [newViewAllActivityDOM, newViewMoreActivity])
      }
      activityContainerDOM.classList.add('with_view_more')
      break
    }
  }
  modalDOM.appendChild(activityContainerDOM)

}

function viewMoreMessages(result, prevIndex) {
  buttonsContainerDOM.remove()
  while (true) {
    _i++
    if(_i > result.messages.length - 1) break
    
    if(_i > (prevIndex + 50)) {
      const newButtonsContainerDOM = document.createElement('div')
      newButtonsContainerDOM.classList.add('buttons')

      const newViewMoreDOM = document.createElement('div')
      newViewMoreDOM.classList.add('view_more')
      newViewMoreDOM.innerHTML = `ver más`
      newButtonsContainerDOM.appendChild(newViewMoreDOM)

      const newViewAllDOM = document.createElement('div')
      newViewAllDOM.classList.add('view_all')
      newViewAllDOM.innerHTML = `ver todo`
      newButtonsContainerDOM.appendChild(newViewAllDOM)
      
      mainViewDOM.appendChild(newButtonsContainerDOM)

      buttonsContainerDOM = newButtonsContainerDOM
      

      newViewMoreDOM.onclick = () => {
        viewMoreMessages(result, _i)
      }
 
      newViewAllDOM.onclick = () => {
        newViewAllDOM.classList.add('loading')
        setTimeout(() => {
          viewAllMessages(result)
        }, 0);
      }
      break
    }

    const message = result.messages[_i];
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
      dateDOM.id = message.date
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
  }
}

function viewAllMessages(result) {
  buttonsContainerDOM.remove()
  while (true) {
    _i++
    if(_i > result.messages.length - 1) break
    
    const message = result.messages[_i];
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
      dateDOM.id = message.date
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
  }
}


function viewMoreActivity(result, arraySortedDates, prevIndex, activityContainerDOM, buttons) {
  buttons.forEach(btn => btn.remove())
  // 9
  let i = prevIndex
  while (true) {
    const date = arraySortedDates[i];
    const percentage = ((date[1] * 100) / result.messages.length).toFixed(2)
    // const percentage = ((date[1] * 100) / arraySortedDates[0][1]).toFixed(2)

    const activityBodyDOM = document.createElement('div')

    const dateDOM = document.createElement('p')
    dateDOM.classList.add('date')
    dateDOM.innerText = date[0]
    dateDOM.onclick = () => {
      dateDOM.classList.add('loading')
      setTimeout(() => {
        while (true) {
          if(document.getElementById(date[0])) {
            const dateFoundDOM = document.getElementById(date[0])
            mainViewDOM.scrollTop = dateFoundDOM.offsetTop - dateFoundDOM.offsetHeight *2
            modalDOM.classList.add('dnone')
            dateDOM.classList.remove('loading')
            break
          }
          viewMoreMessages(result, _i)
        }
      }, 0);
    }
    activityBodyDOM.appendChild(dateDOM)
    
    const barDOM = document.createElement('div')
    barDOM.classList.add('bar')
    barDOM.innerHTML = `<div class="percent">${percentage}%</div>
    <div class="amount" style="height: ${percentage}%"></div>`
    activityBodyDOM.appendChild(barDOM)

    const countDOM = document.createElement('p')
    countDOM.innerText = date[1]
    activityBodyDOM.appendChild(countDOM)

    activityContainerDOM.appendChild(activityBodyDOM)

    i++
    if(i > arraySortedDates.length - 1) {
      activityContainerDOM.classList.remove('with_view_more')
      break
    }

    if(i > (prevIndex + 4)) {
      const newViewMoreActivity = document.createElement('div')
      newViewMoreActivity.classList.add('view_more')
      newViewMoreActivity.innerHTML = `ver más`
      activityContainerDOM.appendChild(newViewMoreActivity)

      const newViewAllActivityDOM = document.createElement('div')
      newViewAllActivityDOM.classList.add('view_all')
      newViewAllActivityDOM.innerHTML = `ver todos`
      activityContainerDOM.appendChild(newViewAllActivityDOM)

      newViewMoreActivity.onclick = () => {
        viewMoreActivity(result, arraySortedDates, i, activityContainerDOM, [newViewAllActivityDOM, newViewMoreActivity])
      }

      newViewAllActivityDOM.onclick = () => {
        viewAllActivity(result, arraySortedDates, i, activityContainerDOM, [newViewAllActivityDOM, newViewMoreActivity])
      }
      activityContainerDOM.classList.add('with_view_more')
      break
      break
    }

    if(prevIndex > arraySortedDates.length) {
      break
    }
  }
}

function viewAllActivity(result, arraySortedDates, prevIndex, activityContainerDOM, buttons) {
  buttons.forEach(btn => btn.remove())
  // 9
  let i = prevIndex
  while (true) {
    const date = arraySortedDates[i];
    const percentage = ((date[1] * 100) / result.messages.length).toFixed(2)

    const activityBodyDOM = document.createElement('div')

    const dateDOM = document.createElement('p')
    dateDOM.classList.add('date')
    dateDOM.innerText = date[0]
    dateDOM.onclick = () => {
      dateDOM.classList.add('loading')
      setTimeout(() => {
        while (true) {
          if(document.getElementById(date[0])) {
            const dateFoundDOM = document.getElementById(date[0])
            mainViewDOM.scrollTop = dateFoundDOM.offsetTop - dateFoundDOM.offsetHeight *2
            modalDOM.classList.add('dnone')
            dateDOM.classList.remove('loading')
            break
          }
          viewMoreMessages(result, _i)
        }
      }, 0);
    }
    activityBodyDOM.appendChild(dateDOM)
    
    const barDOM = document.createElement('div')
    barDOM.classList.add('bar')
    barDOM.innerHTML = `<div class="percent">${percentage}%</div>
    <div class="amount" style="height: ${percentage}%"></div>`
    activityBodyDOM.appendChild(barDOM)

    const countDOM = document.createElement('p')
    countDOM.innerText = date[1]
    activityBodyDOM.appendChild(countDOM)

    activityContainerDOM.appendChild(activityBodyDOM)

    i++
    if(i > arraySortedDates.length - 1) {
      activityContainerDOM.classList.remove('with_view_more')
      break
    }
  }
}

function getModalMessagesHTML(result) {
  let html = `
  <p>
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
    html += `<p>
    <span>${user}:</span>
    <span>${result.users[user].messages.length}</span>
    <span>${percentage}%</span>
  </p>
  <div class="bar">
    <div class="amount" style="width: ${percentage}%;"></div>
  </div>`
  })

  return html
}

function getModalDatesHTML(result) {
  return   `
  <p>
    <span>Inicio:</span>
    <span>${result.messages[0].date}</span>
  </p>
  <p>
    <span>Final:</span>
    <span>${result.messages[result.messages.length - 1].date}</span>
  </p>`
}

function getModalSortedDates(result) {
  const sortedDates = Object.entries(result.dates)
  .sort(([,a],[,b]) => b-a)
  .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  
  return Object.entries(sortedDates)
}