const Extension = function() {

  const state = {
    active: false,
    keyKeyPressedCount: 0,
    currentCommand: '',
    matchIndex: 0,
    matchingElements: [],
  }

  let promptElement = null

  const resetAllMatches = () => {
    Array.from(document.querySelectorAll('body *')).forEach(element => {
      element.classList.remove('zz-match')
    })
  }

  const createPromptElement = () => {
    const div = document.createElement('div')
    div.id = 'zz-prompt'
    div.setAttribute('contenteditable', true)
    document.body.appendChild(div)
    promptElement = div
    promptElement.addEventListener('blur', e => {
      if (state.active) {
        toggleActive()
      }
    })
  }

  const listenToGlobalTriggers = () => {
    document.addEventListener('keyup', e => {
      if (e.key !== 'z') {
        return
      }
      state.keyKeyPressedCount++
      if (state.keyKeyPressedCount === 2) {
        toggleActive()
      }
    })
  }

  const goToNextMatch = () => {
    state.matchIndex++
  }

  const listenToPromptEvents = () => {
    promptElement.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
      }
      if (e.key === 'Tab') {
        goToNextMatch()
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
      tick(state.currentCommand)
    })
  }

  const elementShouldBeSkipped = (element) => {
    return typeof element.innerText === 'undefined'
  }

  const elementsContentMatch = (element, str) => {
    const textNodes = Array.from(element.childNodes).filter(child => child.nodeType === Node.TEXT_NODE)
    let match = false
    textNodes.forEach(textNode => {
      const textContent = textNode.textContent
      if (textContent.toLowerCase().indexOf(str.toLowerCase()) > -1) {
        match = true
      }
    })
    return match
  }

  const updateMatches = (str) => {
    const elementsToLookIn = document.querySelectorAll('body *:not(#zz-prompt)')
    state.matchingElements = []
    resetAllMatches()

    Array.from(elementsToLookIn).forEach(element => {
      if (!elementShouldBeSkipped(element)) {
        if (elementsContentMatch(element, str)) {
          state.matchingElements.push(element)
        }
      }
    })

    renderMatches()
  }

  const renderMatches = () => {
    state.matchingElements.forEach(element => {
      element.classList.add('zz-match')
    })
  }

  const tick = (cmd) => {
    updateMatches(cmd)
  }

  const toggleActive = () => {
    state.keyKeyPressedCount = 0
    state.active = !state.active
    promptElement.classList.toggle('active')
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
    createPromptElement()
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
