export default function parse(text) {
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
    console.log(conditions[j], j)
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
      console.log('eval if new message')
      console.log(i, text[i])
      i--
      if(Number.isInteger(+text[i])) {
        console.log(text[i], 'is a number')
        if(Number.isInteger(+text[i+1]) || (text[i + 1] === '/')) {
          console.log(text[i+1], 'is a number or slash')
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

// messages.forEach(message => {
//   if(message.message === undefined) {
//     console.log(message)
//   }
//   if(users.indexOf(message.user) === -1) {
//     if(message.user === undefined) {
//       console.log(message)
//     }
//     users.push(message.user)
//   }
// })