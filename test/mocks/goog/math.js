/**
 * Mock for goog.math utilities
 */

goog = goog || {};
goog.math = goog.math || {};

goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));
goog.math.Size = jest.fn().mockImplementation((width, height) => ({ width, height }));
goog.math.Rect = jest.fn().mockImplementation((left, top, width, height) => ({ 
  left, top, width, height 
}));

goog.math.isNumber = jest.fn((value) => typeof value === 'number' && !isNaN(value)); 