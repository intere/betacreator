/**
 * Mock for goog.pubsub.PubSub
 */

goog = goog || {};
goog.pubsub = goog.pubsub || {};

goog.pubsub.PubSub = jest.fn().mockImplementation(() => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  publish: jest.fn(),
  clear: jest.fn()
})); 