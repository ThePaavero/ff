const Extension = function() {

  const state = {
    active: false,
    keyKeyPressedCount: 0
  }

  let promptElement = null

  const createPromptElement = () => {
    const div = document.createElement('div')
    div.id = 'zz-prompt'
    document.body.appendChild(div)
    promptElement = div
  }

  const init = () => {
    createPromptElement()
    document.addEventListener('keyup', e => {
      if (e.key !== 'z') {
        return
      }
      state.keyKeyPressedCount++
      if (state.keyKeyPressedCount === 2) {
        state.keyKeyPressedCount = 0
        state.active = true
        promptElement.classList.toggle('active')
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
