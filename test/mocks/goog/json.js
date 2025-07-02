/**
 * Mock for goog.json utilities
 */

goog = goog || {};
goog.json = goog.json || {};

goog.json.serialize = jest.fn((obj) => JSON.stringify(obj));
goog.json.parse = jest.fn((str) => JSON.parse(str)); 