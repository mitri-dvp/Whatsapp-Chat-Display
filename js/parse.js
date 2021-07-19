// TO-DO
// Loop through chat, create strings and evaluate the type of the string.
export default class WhatsAppChatParser {
  constructor(chat) {
    this.chat = chat
    this.string = ''
    this.char = ''
    this.i = 0
    
    this.messages = []
    this.message = {}
    this.users = []

    this.parse()
  }

  parse() {
    this.char = this.chat[this.i]
    this.checkAndSkipE2EMessage()
    while(true) {
      this.parseDate()
      this.parseTime()
      this.parseUser()
      this.parseMessage()

      this.messages.push(this.message)
      this.message = {}

      if(this.i > this.chat.length - 1) {
        // console.log('Parse End')
        break
      }
    }
    this.getUsers()
  }

  parseDate() {
    while(true) {
      if(this.char === ',') {
        this.message.date = this.string
        this.advanceToNextParser()
        break
      }
      
      if(this.i > this.chat.length) {
        break
      }

      this.advanceToNextCharacter()
    }
  }

  parseTime() {
    this.skip(1)
    while(true) {
      if(this.char === '-') {
        this.message.time = this.string.trimEnd()
        this.advanceToNextParser()
        break
      }
      
      if(this.i > this.chat.length) {
        break
      }

      this.advanceToNextCharacter()
    }
  }

  parseUser() {
    while(true) {
      if(this.char === ':') {
        this.message.user = this.string.trimStart()
        this.advanceToNextParser()
        break
      }
      
      if(this.i > this.chat.length) {
        break
      }

      this.advanceToNextCharacter()
    }
  }

  parseMessage() {
    // console.log('Parse message start', this.string)
    this.skip(1)
    while(true) {
      if(this.char === '\n') {
        // console.log('Parse message found break line', this.string)

        if(this.checkIfDate()) {
          // console.log('PrintMessage: It was a date')
          this.message.message = this.string
          this.advanceToNextParser()
          break
        }
      }
      
      if(this.i > this.chat.length) {
        break
      }
      
      this.advanceToNextCharacter()
    }
  }

  getUsers() {
    this.messages.forEach(message => {
      if(this.users.indexOf(message.user) === -1) {
        this.users.push(message.user)
      }
    })
  }

  checkIfDate() {
    // console.log('Analyze After', this.string)
    let _i = this.i + 1
    let _j = 0
    let tempString = ''
    while(true) {
      const char = this.chat[_i]
      if(char === ',') {
        // console.log('Comma detected', tempString)
        return new Date(tempString).toString() != 'Invalid Date'
      }

      if(_j > 10) {
        // console.log('Too long', tempString)
        return false
      }
      
      if(char === undefined) {
        // console.log('EOF', tempString)
        return true
      }

      tempString = tempString + char
      _i++
      _j++

      if(_i > this.chat.length) {
        break
      }
    }
  }

  checkAndSkipE2EMessage() {
    let _i = this.i + 1
    let tempString = ''
    while(true) {
      const char = this.chat[_i]
      if(char === '\n') {
        if(tempString.includes('Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.'))
        this.i =_i
        break
      }

      tempString = tempString + char
      _i++

      if(_i > this.chat.length) {
        break
      }
    }
  }

  advanceToNextCharacter() {
    this.string = this.string + this.char
    this.i = this.i + 1
    this.char = this.chat[this.i]
    // console.log('string modified')
  }

  advanceToNextParser() {
    this.string = ''
    this.i = this.i + 1
    this.char = this.chat[this.i]
  }

  skip(n) {
    this.i = this.i + n
    this.char = this.chat[this.i]
  }
}

function parse(text) {
  const targets = ['date', 'time', 'user', 'message']
  const conditions = [',', '-', ':', `\n`]

  const messages = []
  let message = {}
  const users = []

  let string = ''
  let i = 0;
  let j = 0;

  while (true) {    
    const char = text[i];
    // console.log(conditions[j], j)
    if(j > 5) break
    if(char === conditions[j]) {
      i++
      message[targets[j]] = string
      i++
      j++
      string = ''
      continue
    }

    if(j === 4) {
      // console.log('eval if new message')
      // console.log(i, text[i])
      i--
      if(Number.isInteger(+text[i])) {
        // console.log(text[i], 'is a number')
        if(Number.isInteger(+text[i+1]) || (text[i + 1] === '/')) {
          // console.log(text[i+1], 'is a number or slash')
          messages.push(message)
          message = {}
          j = 0
          string = ''
          continue
        }
        i++
      } else {
        i++
      }
    }

    string = string + char
    i++
    if(i > text.length) {
      message[targets[j]] = string
      break
    }
  }
  return messages
}
