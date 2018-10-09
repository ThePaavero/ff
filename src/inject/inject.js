const Extension = function() {

  const state = {
    active: false,
    keyKeyPressedCount: 0,
    currentCommand: '',
    matchIndex: 1,
    matchingElements: [],
  }

  let promptElement = null
  let wrapperElement = null
  let infoElement = null

  const resetAllMatches = (resetData = true) => {
    if (resetData) {
      state.matchingElements = []
    }
    Array.from(document.querySelectorAll('body *')).forEach(element => {
      element.classList.remove('zz-match')
      element.classList.remove('zz-current-index')
    })
    Array.from(document.querySelectorAll('.zz-label')).forEach(element => {
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
    infoElement.id = 'zz-infoElement'
    wrapperElement.appendChild(infoElement)
  }

  const createPromptElement = () => {
    promptElement = document.createElement('div')
    promptElement.id = 'zz-prompt'
    promptElement.setAttribute('contenteditable', true)
    wrapperElement.appendChild(promptElement)
    document.body.appendChild(wrapperElement)
  }

  const createWrapperElement = () => {
    wrapperElement = document.createElement('div')
    wrapperElement.id = 'zz-wrapper'
    wrapperElement.addEventListener('blur', e => {
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
    if (state.matchIndex === state.matchingElements.length) {
      state.matchIndex = 0
    }
    state.matchIndex++
    resetAllMatches(false)
    renderMatches()
    renderInfo()
  }

  const onEnter = () => {
  }

  const listenToPromptEvents = () => {
    promptElement.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
      }
      if (e.key === 'Tab') {
        goToNextMatch()
        return
      }
      if (e.key === 'Enter') {
        onEnter()
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
      if (e.key !== 'Tab') {
        tick(state.currentCommand)
      }
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
    Array.from(elementsToLookIn).forEach(element => {
      if (!elementShouldBeSkipped(element)) {
        if (elementsContentMatch(element, str)) {
          state.matchingElements.push(element)
        }
      }
    })
  }

  const renderMatches = () => {
    let counter = 1
    state.matchingElements.forEach(element => {
      element.classList.add('zz-match')
      if (counter === state.matchIndex) {
        element.classList.add('zz-current-index')
      }
      const label = document.createElement('div')
      const coordinates = element.getBoundingClientRect()
      label.innerText = counter
      label.className = 'zz-label'
      label.style.top = coordinates.y + 'px'
      label.style.left = coordinates.x + 'px'
      document.body.appendChild(label)
      counter++
    })
  }

  const renderInfo = () => {
    infoElement.innerHTML = `${state.matchingElements.length} matches (${state.matchIndex})`
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
