const state = {
  triggerKey: 'f',
  active: false,
  keyKeyPressedCount: 0,
  promptString: '',
  command: '',
  matchIndex: 1,
  triggerKeyTappedTimeoutId: null,
  numberTimeoutId: null,
  matchingElements: [],
  shiftPressed: false,
  numberSequenceInMemory: null,
  wrapperElement: null,
  promptElement: null,
  infoElement: null,
  notification: null,
  okToReset: true
}

module.exports = state
