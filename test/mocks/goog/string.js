/**
 * Mock for goog.string utilities
 */

goog = goog || {};
goog.string = goog.string || {};

goog.string.quote = jest.fn((str) => `"${str}"`);
goog.string.stripQuotes = jest.fn((str, quoteChar) => {
  if (str.startsWith(quoteChar) && str.endsWith(quoteChar)) {
    return str.slice(1, -1);
  }
  return str;
}); 