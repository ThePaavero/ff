(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const command = () => {

  const process = (cmd, onError, onSuccess) => {
    switch (cmd) {
      case 'sc':
        console.log('Show classes!')
        onSuccess('Showing classes for all elements')
        break
      default:
        onError()
        break
    }
  }

  return {process}
}

module.exports = command()

},{}],2:[function(require,module,exports){
const state = require('./state')
const command = require('./command')
const listenToGlobalTriggers = require('./globalTriggers')

const Extension = function() {

  const millisecondsThresholdForTriggerTaps = 500
  const godSelectors = 'body *:not(#ff-prompt):not(#ff-wrapper)'
  // const godSelectors = 'a, button, input, .btn, .button'

  const resetAllMatches = (resetData = true) => {
    if (resetData) {
      state.matchingElements = []
    }
    Array.from(document.querySelectorAll('body *')).forEach(element => {
      element.classList.remove(...['ff-match', 'ff-current-index'])
    })
    Array.from(document.querySelectorAll('.ff-label')).forEach(element => {
      element.parentElement.removeChild(element)
    })
  }

  const createElements = () => {
    createWrapperElement()
    createPromptElement()
    createInfoElement()
    createNotificationElement()
  }

  const createInfoElement = () => {
    state.infoElement = document.createElement('div')
    state.infoElement.id = 'ff-infoElement'
    state.wrapperElement.appendChild(state.infoElement)
  }
  const createNotificationElement = () => {
    state.notificationElement = document.createElement('div')
    state.notificationElement.id = 'ff-notificationElement'
    state.wrapperElement.appendChild(state.notificationElement)
  }

  const createPromptElement = () => {
    state.promptElement = document.createElement('div')
    state.promptElement.id = 'ff-prompt'
    state.promptElement.setAttribute('contenteditable', true)
    state.promptElement.setAttribute('spellcheck', false)
    state.wrapperElement.appendChild(state.promptElement)
    document.body.appendChild(state.wrapperElement)
  }

  const createWrapperElement = () => {
    state.wrapperElement = document.createElement('div')
    state.wrapperElement.id = 'ff-wrapper'
    state.wrapperElement.addEventListener('blur', e => {
      if (state.active) {
        toggleActive()
      }
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
    renderMatches()
    renderInfo()
  }

  const getCurrentMatchingElement = () => {
    return state.matchingElements[state.matchIndex - 1]
  }

  const showNotification = (notification) => {
    state.notification = notification
    renderNotification()
  }

  const onEnter = () => {
    if (getFirstCharacter() === '>') {
      const commandString = state.promptString.substr(1, state.promptString.length).trim()
      command.process(commandString, () => {
        showNotification({
          type: 'error',
          message: 'Unknown command "' + commandString + '"'
        })
      }, successMessage => {
        showNotification({
          type: 'success',
          message: successMessage
        })
      })
      return
    }
    const currentMatchingElement = getCurrentMatchingElement()
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
      if (state.promptString === '') {
        return
      }
      if (!doNotTickOnKeys.includes(e.key)) {
        tick(state.promptString)
      }
    })
  }

  const elementShouldBeSkipped = (element) => {
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
  }

  const elementsContentMatch = (element, str) => {
    const matchAgainst = str.toLowerCase()
    const textNodes = Array.from(element.childNodes).filter(child => child.nodeType === Node.TEXT_NODE)
    let match = false
    textNodes.forEach(textNode => {
      const textContent = textNode.textContent
      if (textContent.toLowerCase().indexOf(matchAgainst) > -1) {
        match = true
      }
    })
    if (element.value && element.value.indexOf(matchAgainst) > -1) {
      match = true
    }
    if (element.placeholder && element.placeholder.indexOf(matchAgainst) > -1) {
      match = true
    }
    return match
  }

  const getFirstCharacter = () => {
    return state.promptString.substr(0, 1)
  }

  const updateMatches = (str) => {
    const firstCharacter = getFirstCharacter()
    if (!firstCharacter) {
      return
    }
    switch (firstCharacter) {
      case '>':
        state.command = str.substr(1, str.length)
        break
      case ':':
        const selectorString = str.substr(1, str.length)
        if (selectorString.trim() === '') {
          return
        }
        try {
          state.matchingElements = Array.from(document.querySelectorAll(selectorString))
        } catch (e) {
          // ... Do nothing.
        }
        break
      default:
        state.matchingElements = doTextSearch(str)
        break
    }
  }

  const doTextSearch = (str) => {
    const elementsToLookIn = document.querySelectorAll(godSelectors)
    const matches = []
    Array.from(elementsToLookIn).forEach(element => {
      if (!elementShouldBeSkipped(element)) {
        if (elementsContentMatch(element, str)) {
          matches.push(element)
        }
      }
    })
    return matches
  }

  const renderMatches = () => {
    let counter = 1
    state.matchingElements.forEach(element => {
      if (elementShouldBeSkipped(element)) {
        return
      }
      element.classList.add('ff-match')
      if (counter === state.matchIndex) {
        element.classList.add('ff-current-index')
      }
      const label = document.createElement('div')
      const coordinates = element.getBoundingClientRect()
      label.innerText = counter
      label.className = 'ff-label'
      if (counter === state.matchIndex) {
        label.classList.add('active')
      }
      label.style.top = (coordinates.y + window.scrollY) + 'px'
      label.style.left = (coordinates.x + window.scrollX) + 'px'
      document.body.appendChild(label)
      counter++
    })
    if (state.matchingElements.length > 0) {
      scrollToMatchWithCurrentIndex()
    }
  }

  const scrollToMatchWithCurrentIndex = () => {
    const highlightedElement = document.querySelector('.ff-current-index')
    if (!highlightedElement) {
      return
    }
    highlightedElement.scrollIntoView({
      block: 'center',
      behavior: 'smooth'
    })
  }

  const renderInfo = () => {
    state.infoElement.innerHTML = `${state.matchingElements.length} matches ${state.matchingElements.length > 1 ? '(' + state.matchIndex + ')' : ''}`
  }

  const resetNotification = () => {
    state.notification = {
      type: '',
      message: ''
    }
  }

  const renderNotification = () => {
    state.notificationElement.innerHTML = `
      <div class="${state.notification.type}">${state.notification.message}</div>
    `
  }

  const tick = (cmd) => {
    state.matchIndex = 1
    resetAllMatches()
    updateMatches(cmd)
    renderMatches()
    renderInfo()
    renderNotification()
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
    createElements()
    listenToPromptEvents()
    console.log('FF is active.')
  }

  return {
    init
  }
}

module.exports = Extension

},{"./command":1,"./globalTriggers":3,"./state":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
const Extension = require('./extension')
chrome.extension.sendMessage({}, () => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      const app = new Extension()
      app.init()
    }
  }, 10)
})

},{"./extension":2}],5:[function(require,module,exports){
const state = {
  triggerKey: 'f',
  active: false,
  keyKeyPressedCount: 0,
  promptString: '',
  command: '',
  matchIndex: 1,
  triggerKeyTappedTimeoutId: null,
  numberTimeoutId: null,
  matchingElements: [],
  shiftPressed: false,
  numberSequenceInMemory: null,
  wrapperElement: null,
  promptElement: null,
  infoElement: null,
  notification: null
}

module.exports = state

},{}]},{},[4]);
