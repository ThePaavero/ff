const rootDomainCommand = () => {

  const getCommand = () => {
    return 'root'
  }

  const run = (state) => {
    // https://stackoverflow.com/questions/6941533/get-protocol-domain-and-port-from-url
    window.location.href = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
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

module.exports = rootDomainCommand()
