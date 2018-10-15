(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const availableCommands = {
  showClassesCommand: require('./commands/showClassesCommand'),
  stfuCommand: require('./commands/stfuCommand'),
  toggleCssCommand: require('./commands/toggleCssCommand'),
  rootDomainCommand: require('./commands/rootDomainCommand'),
  showSourceCommand: require('./commands/showSourceCommand'),
}

const loadedCommands = []

Object.keys(availableCommands).forEach(c => {
  const program = availableCommands[c]
  loadedCommands.push({
    program,
    commandString: program.getCommand()
  })
})

const command = () => {

  const process = (state, cmd, onError, onSuccess) => {
    try {
      const matchingCommand = loadedCommands.filter(ac => ac.commandString === cmd)[0]
      if (typeof matchingCommand === 'undefined') {
        return onError()
      }
      state.okToReset = false
      matchingCommand.program.run(state)
      onSuccess(matchingCommand.program.getMessage())
      setTimeout(() => {
        state.okToReset = true
      }, 0)
    } catch (e) {
      onError()
    }
  }

  return {process}
}

module.exports = command()

},{"./commands/rootDomainCommand":2,"./commands/showClassesCommand":3,"./commands/showSourceCommand":4,"./commands/stfuCommand":5,"./commands/toggleCssCommand":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
const showClassesCommand = () => {

  const getCommand = () => {
    return 'show-classes'
  }

  const run = (state) => {
    const elements = document.querySelectorAll('body *')
    elements.forEach(renderLabelForElement)
  }

  const renderLabelForElement = (element) => {
    const classes = element.classList.toString()
    if (classes.trim() === '') {
      return
    }
    const label = document.createElement('div')
    label.innerText = classes
    label.className = 'ff-element ff-showClassesCommand-label'
    const coordinates = element.getBoundingClientRect()
    label.style.top = (coordinates.y + window.scrollY) + 'px'
    label.style.left = (coordinates.x + window.scrollX) + 'px'
    document.body.appendChild(label)
  }

  const getMessage = () => {
    return 'Showing classes for all elements'
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = showClassesCommand()

},{}],4:[function(require,module,exports){
const showSourceCommand = () => {

  const getCommand = () => {
    return 'source'
  }

  const run = (state) => {
    // @todo Ha, this doesn't work anymore.
    window.location.href = 'view-source:' + window.location.href
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

module.exports = showSourceCommand()

},{}],5:[function(require,module,exports){
const stfuCommand = () => {

  const getCommand = () => {
    return 'stfu'
  }

  const run = (state) => {
    Array.from(document.querySelectorAll('video, audio')).forEach(element => {
      element.muted = true
    })
  }

  const getMessage = () => {
    return 'STFU activated'
  }

  return {
    getCommand,
    run,
    getMessage
  }
}

module.exports = stfuCommand()

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
const elementCreator = () => {

  const createInfoElement = (state) => {
    state.infoElement = document.createElement('div')
    state.infoElement.id = 'ff-infoElement'
    state.wrapperElement.appendChild(state.infoElement)
  }
  const createNotificationElement = (state) => {
    state.notificationElement = document.createElement('div')
    state.notificationElement.id = 'ff-notificationElement'
    state.wrapperElement.appendChild(state.notificationElement)
  }

  const createPromptElement = (state) => {
    state.promptElement = document.createElement('div')
    state.promptElement.id = 'ff-prompt'
    state.promptElement.setAttribute('contenteditable', true)
    state.promptElement.setAttribute('spellcheck', false)
    state.wrapperElement.appendChild(state.promptElement)
    document.body.appendChild(state.wrapperElement)
  }

  const createWrapperElement = (state) => {
    state.wrapperElement = document.createElement('div')
    state.wrapperElement.id = 'ff-wrapper'
  }

  const init = (state) => {
    createWrapperElement(state)
    createPromptElement(state)
    createInfoElement(state)
    createNotificationElement(state)
  }

  return {init}
}

module.exports = elementCreator()

},{}],8:[function(require,module,exports){
const state = require('./state')
const command = require('./command')
const listenToGlobalTriggers = require('./globalTriggers')
const elementCreator = require('./elementCreator')
const renderer = require('./renderer')
const matchUpdater = require('./matchUpdater')
const promptHandler = require('./promptHandler')
const helpers = require('./helpers')

const Extension = function() {

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
    }, state.millisecondsThresholdForTriggerTaps)
    state.keyKeyPressedCount++
    if (state.keyKeyPressedCount === 2) {
      state.keyKeyPressedCount = 0
      helpers.toggleActive(state)
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
    matchUpdater.resetAllMatches(state, false)
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
    matchUpdater.resetAllMatches(state, true)
    helpers.toggleActive(state)
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
    matchUpdater.resetAllMatches(state, true)
    matchUpdater.run(cmd, state)
    renderer.renderMatches(state)
    renderer.renderInfo(state)
    renderer.renderNotification(state)
    resetNotification()
  }

  const init = () => {
    listenToGlobalTriggers.init(state, reactToTriggerKey)
    elementCreator.init(state)
    promptHandler.init(state, rotateMatch, onEnter, tick)
    console.log('FF is active.')
  }

  return {
    init
  }
}

module.exports = Extension

},{"./command":1,"./elementCreator":7,"./globalTriggers":9,"./helpers":10,"./matchUpdater":12,"./promptHandler":13,"./renderer":14,"./state":15}],9:[function(require,module,exports){
const helpers = require('./helpers')

const listenToGlobalTriggers = () => {

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

module.exports = listenToGlobalTriggers()

},{"./helpers":10}],10:[function(require,module,exports){
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
      state.promptString = ''
      state.promptElement.innerText = state.promptString
      if (resetFunction) {
        resetFunction(state,true)
      }
    }
  }
}

},{}],11:[function(require,module,exports){
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

},{"./extension":8}],12:[function(require,module,exports){
const helpers = require('./helpers')

const matchUpdater = () => {

  const godSelectors = 'body *:not(#ff-prompt):not(#ff-wrapper)'

  const resetAllMatches = (state, resetData = true) => {
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

  const doTextSearch = (str) => {
    const elementsToLookIn = document.querySelectorAll(godSelectors)
    const matches = []
    Array.from(elementsToLookIn).forEach(element => {
      if (!helpers.elementShouldBeSkipped(element)) {
        if (elementsContentMatch(element, str)) {
          matches.push(element)
        }
      }
    })
    return matches
  }

  const run = (str, state) => {
    const firstCharacter = state.promptString.substr(0, 1)
    if (!firstCharacter) {
      return
    }
    let promptClassNamePostfix = 'search'
    switch (firstCharacter) {
      case '>':
        state.command = str.substr(1, str.length)
        promptClassNamePostfix = 'command'
        break
      case ':':
        const selectorString = str.substr(1, str.length)
        if (selectorString.trim() === '') {
          return
        }
        promptClassNamePostfix = 'selector'
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
    state.promptElement.className = 'mode-' + promptClassNamePostfix
  }

  return {
    run,
    resetAllMatches
  }
}

module.exports = matchUpdater()

},{"./helpers":10}],13:[function(require,module,exports){
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

},{"./helpers":10,"./matchUpdater":12}],14:[function(require,module,exports){
const helpers = require('./helpers')

const renderer = () => {

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

  const renderInfo = (state) => {
    const amountOfMatches = state.matchingElements.length
    state.infoElement.innerHTML = `
      <div class="ff-match-count-indicator ${amountOfMatches > 0 ? 'over-zero' : ''}">
        ${amountOfMatches}
      </div>
      matches
      ${amountOfMatches > 1 ? '(' + state.matchIndex + ')' : ''}
    `
  }

  const renderNotification = (state) => {
    if (!state.notification) {
      return
    }
    state.notificationElement.innerHTML = `
      <div class="${state.notification.type}">${state.notification.message}</div>
    `
  }

  const renderMatches = (state) => {
    let counter = 1
    state.matchingElements.forEach(element => {
      if (helpers.elementShouldBeSkipped(element)) {
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

  return {
    renderInfo,
    renderNotification,
    renderMatches
  }
}

module.exports = renderer()

},{"./helpers":10}],15:[function(require,module,exports){
const state = {
  millisecondsThresholdForTriggerTaps: 500,
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
  notification: null,
  okToReset: true
}

module.exports = state

},{}]},{},[11]);
