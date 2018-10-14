const command = () => {

  const process = (cmd) => {
    switch (cmd) {
      case 'sc':
        console.log('Show classes!')
        break
    }
  }

  return {process}
}

module.exports = command()
