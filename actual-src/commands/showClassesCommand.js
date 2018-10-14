const showClassesCommand = () => {

  const getCommand = () => {
    return 'show-classes'
  }

  const run = (state) => {
    console.log('showClassesCommand')
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
