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
    const matchingCommand = availableCommands.filter(ac => ac.commandString === cmd)[0]
    if (!matchingCommand) {
      onError()
    }
    matchingCommand.run()
    onSuccess(matchingCommand.getMessage())
  }

  return {process}
}

module.exports = command()
