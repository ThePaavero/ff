const matchUpdater = () => {

  const godSelectors = 'body *:not(#ff-prompt):not(#ff-wrapper)'

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

  return {run}
}

module.exports = matchUpdater()
