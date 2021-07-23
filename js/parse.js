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

    this.usersCount = 0
    this.users = {}

    this.currentDate = -1
    this.dates = {}
    
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
        break
      }
    }
  }

  parseDate() {
    while(true) {
      if(this.char === ',' || this.char === ' ') {
        this.message.date = this.string
        if(this.char === ' ') this.i--
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
        const user = this.string.trimStart()

        // Add User to Message
        this.message.user = user

        // Add User to Users
        if(this.users[user] === undefined) {
          this.users[user] = {}
          this.users[user].number = this.usersCount
          this.users[user].messages = []
          this.usersCount = this.usersCount + 1
        }

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
    this.skip(1)
    while(true) {
      if(this.char === '\n') {

        if(this.checkIfDate()) {
          this.message.message = this.string

          if(this.message.date === this.currentDate) {
            this.dates[this.currentDate] = this.dates[this.currentDate] + 1
          } else {
            this.dates[this.message.date] = 1
            this.currentDate = this.message.date 
          }

          this.users[this.message.user].messages.push(this.message.message)

          this.advanceToNextParser()
          break
        }
      }
      
      if(this.i > this.chat.length - 1) {
        this.message.message = this.string
        this.advanceToNextParser()
        if(this.message.date === this.currentDate) {
          this.dates[this.currentDate] = this.dates[this.currentDate] + 1
        } else {
          this.dates[this.message.date] = 1
          this.currentDate = this.message.date 
        }
        break
      }
      
      this.advanceToNextCharacter()
    }
  }

  checkIfDate() {
    let _i = this.i
    let _j = 0
    let tempString = ''
    while(true) {
      const char = this.chat[_i]
      if(char === ',' || char === ' ') {
        return tempString.split('/').length === 3
      }
      
      if(_j > 10) {
        return false
      }
      
      if(char === undefined) {
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
    let _i = this.i
    let tempString = ''
    while(true) {
      const char = this.chat[_i]
      if(char === '\n') {
        if(tempString.includes(': ')) break
        _i++
        this.i = _i
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
