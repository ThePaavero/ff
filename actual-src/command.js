const command = () => {

  const process = (cmd, onError) => {
    console.log('Command module got a command: "' + cmd + '"')
    switch (cmd) {
      case 'sc':
        console.log('Show classes!')
        break
      default:
        onError()
        break
    }
  }

  return {process}
}

module.exports = command()
