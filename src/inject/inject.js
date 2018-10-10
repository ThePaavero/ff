const Extension = function () {

  const triggerKey = 'f'
  const millisecondsThresholdForTriggerTaps = 500
  const godSelectors = 'body *:not(#ff-prompt)'
  // const godSelectors = 'a, button, input, .btn, .button'

  const state = {
    active: false,
    keyKeyPressedCount: 0,
    currentCommand: '',
    matchIndex: 1,
    triggerKeyTappedTimeoutId: null,
    numberTimeoutId: null,
    matchingElements: [],
    shiftPressed: false,
    numberSequenceInMemory: null,
  }

  let promptElement = null
  let wrapperElement = null
  let infoElement = null

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
  }

  const createInfoElement = () => {
    infoElement = document.createElement('div')
    infoElement.id = 'ff-infoElement'
    wrapperElement.appendChild(infoElement)
  }

  const createPromptElement = () => {
    promptElement = document.createElement('div')
    promptElement.id = 'ff-prompt'
    promptElement.setAttribute('contenteditable', true)
    wrapperElement.appendChild(promptElement)
    document.body.appendChild(wrapperElement)
  }

  const createWrapperElement = () => {
    wrapperElement = document.createElement('div')
    wrapperElement.id = 'ff-wrapper'
    wrapperElement.addEventListener('blur', e => {
      if (state.active) {
        toggleActive()
      }
    })
  }

  const reactToTriggerKey = () => {
    // If we're typing into our prompt, ignore these triggers.
    if (document.activeElement === promptElement) {
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

  const listenToGlobalTriggers = () => {
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

  const onEnter = () => {
    const currentMatchingElement = getCurrentMatchingElement()
    currentMatchingElement.click()
    resetAllMatches()
    toggleActive()
  }

  const listenToPromptEvents = () => {
    promptElement.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === 'Tab' || (!isNaN(Number(e.key)) && Number(e.key) !== 0)) {
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
      if (!isNaN(Number(e.key))) {
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

    promptElement.addEventListener('keyup', e => {
      if (e.key === 'Escape') {
        toggleActive()
      }
      state.currentCommand = promptElement.innerText.trim()
      if (state.currentCommand === '') {
        return
      }
      if (e.key !== 'Tab' && e.key !== 'Shift') {
        tick(state.currentCommand)
      }
    })
  }

  const elementShouldBeSkipped = (element) => {
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

  const updateMatches = (str) => {
    const firstCharacter = str.substr(0, 1)
    if (!firstCharacter) {
      return
    }
    switch (firstCharacter) {
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
      element.classList.add('ff-match')
      if (counter === state.matchIndex) {
        element.classList.add('ff-current-index')
      }
      const label = document.createElement('div')
      const coordinates = element.getBoundingClientRect()
      label.innerText = counter
      label.className = 'ff-label'
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
    infoElement.innerHTML = `${state.matchingElements.length} matches ${state.matchingElements.length > 1 ? '(' + state.matchIndex + ')' : ''}`
  }

  const tick = (cmd) => {
    state.matchIndex = 1
    resetAllMatches()
    updateMatches(cmd)
    renderMatches()
    renderInfo()
  }

  const toggleActive = () => {
    state.keyKeyPressedCount = 0
    state.active = !state.active
    wrapperElement.classList.toggle('active')
    if (state.active) {
      promptElement.focus()
    } else {
      state.currentCommand = ''
      promptElement.innerText = state.currentCommand
      resetAllMatches()
    }
  }

  const init = () => {
    listenToGlobalTriggers()
    createElements()
    listenToPromptEvents()
  }

  return {
    init
  }
}

chrome.extension.sendMessage({}, () => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      const app = new Extension()
      app.init()
    }
  }, 10)
})
