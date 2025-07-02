/**
 * Mock for goog.events utilities
 */

goog = goog || {};
goog.events = goog.events || {};

goog.events.EventType = {
  LOAD: 'load',
  CLICK: 'click',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEMOVE: 'mousemove',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  CHANGE: 'change',
  FOCUS: 'focus',
  BLUR: 'blur'
};

goog.events.listen = jest.fn(() => ({ key: 'mock-key' }));
goog.events.unlistenByKey = jest.fn();
goog.events.unlisten = jest.fn(); 