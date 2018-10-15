const state = require('./state')
const command = require('./command')
const listenToGlobalTriggers = require('./globalTriggers')
const elementCreator = require('./elementCreator')
const renderer = require('./renderer')
const matchUpdater = require('./matchUpdater')

const Extension = function() {

  const millisecondsThresholdForTriggerTaps = 500

  const resetAllMatches = (resetData = true) => {
    if (!state.okToReset) {
      return
    }
    if (resetData) {
      state.matchingElements = []
    }
    Array.from(document.querySelectorAll('body *')).forEach(element => {
      element.classList.remove(...['ff-match', 'ff-current-index'])
    })
    Array.from(document.querySelectorAll('.ff-label, .ff-element')).forEach(element => {
      element.parentElement.removeChild(element)
    })
  }

  const reactToTriggerKey = () => {
    // If we're typing into our prompt (or other inputs/textareas), ignore these triggers.
    const ignoreIfTag = ['INPUT', 'TEXTAREA']
    if (document.activeElement === state.promptElement || ignoreIfTag.indexOf(document.activeElement.nodeName) > -1) {
      return
    }
    // Not focused on prompt, go ahead and react.
    if (state.triggerKeyTappedTimeoutId) {
      clearTimeout(state.triggerKeyTappedTimeoutId)
    }
    state.triggerKeyTappedTimeoutId = setTimeout(() => {
      state.keyKeyPressedCount = 0
    }, millisecondsThresholdForTriggerTaps)
    state.keyKeyPressedCount++
    if (state.keyKeyPressedCount === 2) {
      state.keyKeyPressedCount = 0
      toggleActive()
    }
  }

  const rotateMatch = () => {
    state.matchIndex += (state.shiftPressed ? -1 : 1)
    if (state.matchIndex === state.matchingElements.length + 1) {
      state.matchIndex = 1
    }
    if (state.matchIndex < 1) {
      state.matchIndex = state.matchingElements.length
    }
    resetAllMatches(false)
    renderer.renderMatches(state)
    renderer.renderInfo(state)
  }

  const getCurrentMatchingElement = () => {
    return state.matchingElements[state.matchIndex - 1]
  }

  const showNotification = (notification) => {
    state.notification = notification
    renderer.renderNotification(state)
  }

  const onEnter = () => {
    if (getFirstCharacter() === '>') {
      const commandString = state.promptString.substr(1, state.promptString.length).trim()
      command.process(state, commandString, () => {
        showNotification({
          type: 'error',
          message: 'Unknown command "' + commandString + '"'
        })
      }, successMessage => {
        state.promptString = ''
        showNotification({
          type: 'success',
          message: successMessage
        })
      })
      return
    }
    const currentMatchingElement = getCurrentMatchingElement()
    currentMatchingElement.focus()
    currentMatchingElement.click()
    resetAllMatches()
    toggleActive()
  }

  const handlePageUpAndDownWhileInFocus = (e) => {
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

  const listenToPromptEvents = () => {

    state.wrapperElement.addEventListener('blur', e => {
      if (state.active) {
        toggleActive()
      }
    })

    state.promptElement.addEventListener('keydown', e => {
      if (handlePageUpAndDownWhileInFocus(e)) {
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab' || (!isNaN(Number(e.key)) && Number(e.key) !== 0 && e.key !== 0 && e.key !== '0')) {
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
      if (!isNaN(Number(e.key)) && e.keyCode !== 32) {
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
          onEnter()
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
        toggleActive()
      }
      state.promptString = state.promptElement.innerText.trim()
      if (state.promptString === '' || state.promptString.length < 2) {
        resetAllMatches()
        state.promptElement.className = ''
        return
      }
      if (!doNotTickOnKeys.includes(e.key)) {
        tick(state.promptString)
      }
    })
  }

  const getFirstCharacter = () => {
    return state.promptString.substr(0, 1)
  }

  const resetNotification = () => {
    state.notification = {
      type: '',
      message: ''
    }
  }

  const tick = (cmd) => {
    if (cmd.trim() === '') {
      state.promptElement.className = ''
    }
    state.matchIndex = 1
    resetAllMatches()
    matchUpdater.run(cmd, state)
    renderer.renderMatches(state)
    renderer.renderInfo(state)
    renderer.renderNotification(state)
    resetNotification()
  }

  const toggleActive = () => {
    state.keyKeyPressedCount = 0
    state.active = !state.active
    state.wrapperElement.classList.toggle('active')
    if (state.active) {
      state.promptElement.focus()
    } else {
      state.promptString = ''
      state.promptElement.innerText = state.promptString
      resetAllMatches()
    }
  }

  const init = () => {
    listenToGlobalTriggers.init(state, toggleActive, reactToTriggerKey)
    elementCreator.init(state)
    listenToPromptEvents()
    console.log('FF is active.')
  }

  return {
    init
  }
}

module.exports = Extension
