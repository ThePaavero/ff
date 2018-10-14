const availableCommands = {
  showClassesCommand: require('./commands/showClassesCommand'),
  stfuCommand: require('./commands/stfuCommand'),
}

const loadedCommands = []

Object.keys(availableCommands).forEach(c => {
  console.log('Loading command "' + c + '"')
  const program = availableCommands[c]
  loadedCommands.push({
    program,
    commandString: program.getCommand()
  })
})

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
