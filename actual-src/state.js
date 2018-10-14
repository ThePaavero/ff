const state = {
  triggerKey: 'f',
  active: false,
  keyKeyPressedCount: 0,
  currentCommand: '',
  matchIndex: 1,
  triggerKeyTappedTimeoutId: null,
  numberTimeoutId: null,
  matchingElements: [],
  shiftPressed: false,
  numberSequenceInMemory: null,
  wrapperElement: null,
  promptElement: null,
  infoElement: null,
}

module.exports = state
