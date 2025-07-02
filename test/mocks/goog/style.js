/**
 * Mock for goog.style utilities
 */

goog = goog || {};
goog.style = goog.style || {};

goog.style.setStyle = jest.fn();
goog.style.getBorderBoxSize = jest.fn(() => ({ width: 800, height: 600 }));
goog.style.getSize = jest.fn(() => ({ width: 800, height: 600 }));
goog.style.getPosition = jest.fn(() => ({ x: 0, y: 0 })); 