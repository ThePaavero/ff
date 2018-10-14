const command = () => {

  const process = (cmd, onError, onSuccess) => {
    switch (cmd) {
      case 'sc':
        console.log('Show classes!')
        onSuccess('Showing classes for all elements')
        break
      default:
        onError()
        break
    }
  }

  return {process}
}

module.exports = command()
