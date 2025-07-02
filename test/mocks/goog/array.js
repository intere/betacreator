/**
 * Mock for goog.array utilities
 */

goog = goog || {};
goog.array = goog.array || {};

goog.array.forEach = jest.fn((array, callback) => {
  if (Array.isArray(array)) {
    array.forEach(callback);
  }
});

goog.array.some = jest.fn((array, callback) => {
  if (Array.isArray(array)) {
    return array.some(callback);
  }
  return false;
});

goog.array.filter = jest.fn((array, callback) => {
  if (Array.isArray(array)) {
    return array.filter(callback);
  }
  return [];
});

goog.array.map = jest.fn((array, callback) => {
  if (Array.isArray(array)) {
    return array.map(callback);
  }
  return [];
});

goog.array.indexOf = jest.fn((array, item) => {
  if (Array.isArray(array)) {
    return array.indexOf(item);
  }
  return -1;
});

goog.array.remove = jest.fn((array, item) => {
  if (Array.isArray(array)) {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
      return true;
    }
  }
  return false;
});

// Add goog.isArray and goog.isObject
goog.isArray = jest.fn((obj) => Array.isArray(obj));
goog.isObject = jest.fn((obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj));
goog.isNumber = jest.fn((obj) => typeof obj === 'number' && !isNaN(obj)); 