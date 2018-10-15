const state = require('./state')
const command = require('./command')
const listenToGlobalTriggers = require('./globalTriggers')
const elementCreator = require('./elementCreator')
const renderer = require('./renderer')
const matchUpdater = require('./matchUpdater')
const promptHandler = require('./promptHandler')

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
    promptHandler.init(state, toggleActive, rotateMatch, onEnter, resetAllMatches, tick)
    console.log('FF is active.')
  }

  return {
    init
  }
}

module.exports = Extension
