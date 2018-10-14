const availableCommands = [
  'showClassesCommand'
]

const loadedCommands = []

availableCommands.forEach(c => {
  const program = require('./commands/' + c)
  loadedCommands.push({
    program,
    commandString: program.getCommand()
  })
})

const showClassesCommand = require('./commands/showClassesCommand')

const command = () => {

  const process = (cmd, onError, onSuccess) => {
    try {
      const matchingCommand = loadedCommands.filter(ac => ac.commandString === cmd)[0]
      if (typeof matchingCommand === 'undefined') {
        return onError()
      }
      matchingCommand.program.run()
      onSuccess(matchingCommand.program.getMessage())
    } catch (e) {
      onError()
    }
  }

  return {process}
}

module.exports = command()
