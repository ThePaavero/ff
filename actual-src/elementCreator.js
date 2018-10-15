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
