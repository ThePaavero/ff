const command = () => {

  const process = (cmd) => {
    console.log('Command module got a command: "' + cmd + '"')
    switch (cmd) {
      case 'sc':
        console.log('Show classes!')
        break
    }
  }

  return {process}
}

module.exports = command()
