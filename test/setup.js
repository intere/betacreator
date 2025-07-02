/**
 * Jest setup file for BetaCreator tests
 * This file runs before each test and sets up the testing environment
 */

// Set up global goog object for Google Closure Library
global.goog = {
  provide: jest.fn((namespace) => {
    const parts = namespace.split('.');
    let current = global;
    for (let i = 0; i < parts.length; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
  }),
  require: jest.fn(),
  isArray: jest.fn((obj) => Array.isArray(obj)),
  isObject: jest.fn((obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj)),
  isNumber: jest.fn((obj) => typeof obj === 'number' && !isNaN(obj)),
  dom: {
    createElement: jest.fn((tagName) => {
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
    }),
    appendChild: jest.fn(),
    replaceNode: jest.fn(),
    removeNode: jest.fn(),
    getViewportSize: jest.fn(() => ({ width: 1024, height: 768 }))
  },
  style: {
    setStyle: jest.fn(),
    getBorderBoxSize: jest.fn(() => ({ width: 800, height: 600 })),
    getSize: jest.fn(() => ({ width: 800, height: 600 })),
    getPosition: jest.fn(() => ({ x: 0, y: 0 }))
  },
  events: {
    EventType: {
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
    },
    listen: jest.fn(() => ({ key: 'mock-key' })),
    unlistenByKey: jest.fn(),
    unlisten: jest.fn()
  },
  array: {
    forEach: jest.fn((array, callback) => {
      if (Array.isArray(array)) {
        array.forEach(callback);
      }
    }),
    some: jest.fn((array, callback) => {
      if (Array.isArray(array)) {
        return array.some(callback);
      }
      return false;
    }),
    filter: jest.fn((array, callback) => {
      if (Array.isArray(array)) {
        return array.filter(callback);
      }
      return [];
    }),
    map: jest.fn((array, callback) => {
      if (Array.isArray(array)) {
        return array.map(callback);
      }
      return [];
    }),
    indexOf: jest.fn((array, item) => {
      if (Array.isArray(array)) {
        return array.indexOf(item);
      }
      return -1;
    }),
    remove: jest.fn((array, item) => {
      if (Array.isArray(array)) {
        const index = array.indexOf(item);
        if (index > -1) {
          array.splice(index, 1);
          return true;
        }
      }
      return false;
    }),
    find: jest.fn((array, predicate) => {
      for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
          return array[i];
        }
      }
      return null;
    })
  },
  json: {
    serialize: jest.fn((obj) => JSON.stringify(obj)),
    parse: jest.fn((str) => JSON.parse(str))
  },
  string: {
    quote: jest.fn((str) => `"${str}"`),
    stripQuotes: jest.fn((str, quoteChar) => {
      if (str.startsWith(quoteChar) && str.endsWith(quoteChar)) {
        return str.slice(1, -1);
      }
      return str;
    })
  },
  pubsub: {
    PubSub: jest.fn().mockImplementation(() => ({
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      clear: jest.fn()
    }))
  },
  math: {
    Coordinate: jest.fn().mockImplementation((x, y) => ({ x, y })),
    Size: jest.fn().mockImplementation((width, height) => ({ width, height })),
    Rect: jest.fn().mockImplementation((left, top, width, height) => ({ 
      left, top, width, height 
    })),
    isNumber: jest.fn((value) => typeof value === 'number' && !isNaN(value)),
    nearlyEquals: jest.fn((a, b) => Math.abs(a - b) < 0.001),
    clamp: jest.fn((value, min, max) => Math.max(min, Math.min(max, value)))
  },
  exportSymbol: jest.fn()
};

// Mock canvas and related browser APIs
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
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

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');

// Mock Image constructor
global.Image = class {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.src = '';
    this.style = {};
    
    // Simulate image loading
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Mock DOM methods
global.document.createElement = jest.fn((tagName) => {
  const element = {
    tagName: tagName.toUpperCase(),
    style: {},
    width: 800,
    height: 600,
    getContext: jest.fn(() => ({
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
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,test'),
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
    element.getContext = element.getContext;
    element.toDataURL = element.toDataURL;
  }
  
  return element;
});

// Mock window object
global.window = {
  ...global.window,
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  requestAnimationFrame: jest.fn((callback) => setTimeout(callback, 16)),
  cancelAnimationFrame: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getComputedStyle: jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    width: '800px',
    height: '600px'
  }))
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Set up test environment variables
process.env.NODE_ENV = 'test';

// After requiring Client.js, patch static properties for test expectations
try {
  require('../js/betacreator/Client.js');
  if (global.bc && global.bc.Client) {
    global.bc.Client.go = global.bc.Client.go || global.BetaCreator;
    global.bc.Client.pubsub = global.bc.Client.pubsub || global.bc.Client.prototype.pubsub;
    global.bc.Client.pubsubTopics = global.bc.Client.pubsubTopics || global.bc.Client.prototype.pubsubTopics;
    global.bc.Client.modes = global.bc.Client.modes || global.bc.Client.prototype.modes;
  }
} catch (e) {
  // Ignore if not present yet
} 