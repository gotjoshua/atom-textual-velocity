'use babel'

// Unfortunately TestUtils.Simulate.keyDown(input, {key: 'Enter', keyCode: 13}) can't be used inside atom
export function dispatchKeyDownEvent (el, opts = {}) {
  // Chrome doesn't play well with keydown events
  // from https://code.google.com/p/chromium/issues/detail?id=327853&q=KeyboardEvent&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified
  var evt = document.createEvent('Events')
  // KeyboardEvents bubble and are cancelable.
  // https://developer.mozilla.org/en-US/docs/Web/API/event.initEvent
  evt.initEvent('keydown', true, true)
  evt.keyCode = opts.keyCode
  el.dispatchEvent(evt)
}
