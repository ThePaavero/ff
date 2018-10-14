const stfuCommand = () => {

  const getCommand = () => {
    return 'stfu'
  }

  const run = (state) => {
    Array.from(document.querySelectorAll('video, audio')).forEach(element => {
      element.muted = true
    })
  }

  const getMessage = () => {
    return 'STFU activated'
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = stfuCommand()
