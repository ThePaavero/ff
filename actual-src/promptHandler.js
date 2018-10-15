const matchUpdater = require('./matchUpdater')
const helpers = require('./helpers')

const promptHandler = () => {

  const handlePageUpAndDownWhileInFocus = (state, e) => {
    // What a hack:
    // In order to not prevent normal Page Up / Page Down scrolling of the page itself,
    // because of the way an element with contenteditable set to true and is in focus behaves on
    // Page Up and Page Down, we need to disable the contenteditable attribute for one millisecond
    // so that the browser will apply the Page Up/Down onto the document itself instead of our prompt.
    // Then, immediately after, return our contenteditable attribute to true and refocus on the prompt again.
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      state.promptElement.setAttribute('contenteditable', false)
      setTimeout(() => {
        state.promptElement.setAttribute('contenteditable', true)
        state.promptElement.focus()
      }, 1)
      return true
    }
    return false
  }

  const isNumber = (input) => {
    return !isNaN(Number(input))
  }

  const clickOnMatchOfIndex = (state) => {
    if (typeof state.matchingElements[state.matchIndex - 1] === 'undefined') {
      console.warn('No matching element found.')
      return
    }
    state.matchingElements[state.matchIndex - 1].click()
  }

  const init = (state, rotateMatch, onEnter, tick) => {

    state.wrapperElement.addEventListener('blur', e => {
      if (state.active) {
        helpers.toggleActive(state)
      }
    })

    state.promptElement.addEventListener('keydown', e => {
      if (handlePageUpAndDownWhileInFocus(state, e)) {
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab' || isNumber(e.key)) && e.keyCode !== 32) {
        e.preventDefault()
      }
      if (e.key === 'Tab') {
        rotateMatch()
        return
      }
      if (e.key === 'Enter') {
        onEnter()
        return
      }
      if (isNumber(e.key) && e.keyCode !== 32) {
        if (state.numberSequenceInMemory) {
          // Concat as strings, but form a number.
          state.numberSequenceInMemory = Number(state.numberSequenceInMemory.toString() + e.key.toString())
        } else {
          state.numberSequenceInMemory = Number(e.key)
        }
        state.numberTimeoutId = setTimeout(() => {
          state.matchIndex = state.numberSequenceInMemory
          state.numberSequenceInMemory = null
          if (state.numberTimeoutId) {
            clearTimeout(state.numberTimeoutId)
          }
          clickOnMatchOfIndex(state)
        }, 500)
      }
    })

    const doNotTickOnKeys = [
      'Tab',
      'Shift',
      'Control',
      'Escape',
      'PageDown',
      'PageUp',
      'Space'
    ];
    state.promptElement.addEventListener('keyup', e => {
      if (e.key === 'Escape') {
        helpers.toggleActive(state)
      }
      state.promptString = state.promptElement.innerText.trim()
      if (state.promptString === '' || state.promptString.length < 2) {
        matchUpdater.resetAllMatches(state, true)
        state.promptElement.className = ''
        return
      }
      if (!doNotTickOnKeys.includes(e.key)) {
        tick(state.promptString)
      }
    })
  }

  return {init}
}

module.exports = promptHandler()
