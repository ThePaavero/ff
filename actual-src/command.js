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

  const process = (state, cmd, onError, onSuccess) => {
    try {
      const matchingCommand = loadedCommands.filter(ac => ac.commandString === cmd)[0]
      if (typeof matchingCommand === 'undefined') {
        return onError()
      }
      state.okToReset = false
      matchingCommand.program.run(state)
      onSuccess(matchingCommand.program.getMessage())
      setTimeout(() => {
        state.okToReset = true
      }, 0)
    } catch (e) {
      onError()
    }
  }

  return {process}
}

module.exports = command()
