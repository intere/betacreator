/**
 * Mock for goog.dom utilities
 */

goog = goog || {};
goog.dom = goog.dom || {};

goog.dom.createElement = jest.fn((tagName) => {
  const element = {
    tagName: tagName.toUpperCase(),
    style: {},
    width: 800,
    height: 600,
    src: '',
    appendChild: jest.fn(),
    replaceChild: jest.fn(),
    insertBefore: jest.fn(),
    removeChild: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({ width: 800, height: 600 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    }
  };
  
  if (tagName === 'canvas') {
    element.getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Array(4) })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    }));
    element.toDataURL = jest.fn(() => 'data:image/png;base64,test');
  }
  
  return element;
});

goog.dom.appendChild = jest.fn();
goog.dom.replaceNode = jest.fn();
goog.dom.removeNode = jest.fn();
goog.dom.getViewportSize = jest.fn(() => ({ width: 1024, height: 768 })); 