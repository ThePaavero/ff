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

module.exports = state
