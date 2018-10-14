const showSourceCommand = () => {

  const getCommand = () => {
    return 'source'
  }

  const run = (state) => {
    window.location.href = 'view-source:' + window.location.href
  }

  const getMessage = () => {
    return ''
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = showSourceCommand()
