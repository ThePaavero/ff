const showSourceCommand = () => {

  const getCommand = () => {
    return 'source'
  }

  const run = (state) => {
    // @todo Ha, this doesn't work anymore.
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
