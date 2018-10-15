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
