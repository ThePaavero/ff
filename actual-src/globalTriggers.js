const listenToGlobalTriggers = () => {

  const init = (state, toggleActive, reactToTriggerKey) => {
    document.body.addEventListener('click', e => {
      if (state.active && e.target !== state.wrapperElement && e.target !== state.promptElement) {
        toggleActive()
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

module.exports = listenToGlobalTriggers()
