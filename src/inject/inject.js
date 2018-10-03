const Extension = function() {

  const state = {
    active: false,
    keyKeyPressedCount: 0
  }

  let promptElement = null

  const createPromptElement = () => {
    const div = document.createElement('div')
    div.id = 'zz-prompt'
    div.setAttribute('contenteditable', true)
    document.body.appendChild(div)
    promptElement = div
  }

  const toggleActive = () => {
    state.keyKeyPressedCount = 0
    state.active = !state.active
    promptElement.classList.toggle('active')
    if (state.active) {
      promptElement.focus()
    }
  }

  const init = () => {
    createPromptElement()
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
