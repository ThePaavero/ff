const listenToGlobalTriggers = () => {

  const init = (state, wrapperElement, promptElement, toggleActive, triggerKey, reactToTriggerKey) => {
    document.body.addEventListener('click', e => {
      if (state.active && e.target !== wrapperElement && e.target !== promptElement) {
        toggleActive()
      }
    })
    document.addEventListener('keyup', e => {
      if (e.key !== triggerKey) {
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
