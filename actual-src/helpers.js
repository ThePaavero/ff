const ownElementSelectors = '.ff-label, .ff-showClassesCommand-label'

module.exports = {
  elementShouldBeSkipped: (element) => {
    const idsToIgnore = [
      'ff-wrapper',
      'ff-prompt',
      'ff-infoElement',
      'ff-notificationElement'
    ]
    if (idsToIgnore.includes(element.id)) {
      return true
    }
    return typeof element.innerText === 'undefined' || element.hidden || element.style.display === 'none' || element.offsetParent === null
  },
  toggleActive: (state, resetFunction = null) => {
    state.keyKeyPressedCount = 0
    state.active = !state.active
    state.wrapperElement.classList.toggle('active')
    if (state.active) {
      state.promptElement.focus()
    } else {
      Array.from(document.querySelectorAll(ownElementSelectors)).forEach(element => {
        element.parentElement.removeChild(element)
      })
      state.promptString = ''
      state.promptElement.innerText = state.promptString
      if (resetFunction) {
        resetFunction(state, true)
      }
    }
  }
}
