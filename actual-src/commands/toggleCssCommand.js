const toggleCssCommand = () => {

  const myDisablingPrefix = 'FF-CSS-TOGGLE_'

  let cssIsOn = true

  const getCommand = () => {
    return 'css'
  }

  const run = (state) => {
    const cssElementsAsArray = Array.from(document.querySelectorAll('[rel="stylesheet"]'))
    cssIsOn = !cssIsOn
    cssElementsAsArray.forEach(element => {
      if (cssIsOn) {
        element.href = element.href.replace(myDisablingPrefix, '')
      } else {
        element.href += myDisablingPrefix
      }
    })
  }

  const getMessage = () => {
    return 'CSS toggled'
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = toggleCssCommand()
