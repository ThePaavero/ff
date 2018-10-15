const helpers = require('./helpers')

const globalTriggers = () => {

  const init = (state, reactToTriggerKey) => {
    document.body.addEventListener('click', e => {
      if (state.active && e.target !== state.wrapperElement && e.target !== state.promptElement) {
        helpers.toggleActive(state)
      }
    })
    document.addEventListener('keyup', e => {
      if (e.key !== state.triggerKey) {
        return
      }
      reactToTriggerKey()
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Shift') {
        state.shiftPressed = true
      }
    })
    document.addEventListener('keyup', e => {
      if (e.key === 'Shift') {
        state.shiftPressed = false
      }
    })
  }

  return {init}
}

module.exports = globalTriggers()
