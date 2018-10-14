const showClassesCommand = () => {

  const getCommand = () => {
    return 'show-classes'
  }

  const run = () => {
    console.log('Command "Show Classes" running!')
  }

  const getMessage = () => {
    return 'Showing classes for all elements'
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = showClassesCommand()
