/**
 * Unit tests for bc.model.Canvas
 * Tests the canvas model that manages climbing route data and zoom functionality
 */

// Import the modules under test
require('../../js/betacreator/util/object.js');
require('../../js/betacreator/models/Action.js');
require('../../js/betacreator/models/property.js');
require('../../js/betacreator/models/Canvas.js');

describe('bc.model.Canvas constructor', () => {
  let mockController;
  let mockImage;
  let mockDefaultProperties;

  beforeEach(() => {
    // Mock bc.model.Line
    global.bc = global.bc || {};
    global.bc.model = global.bc.model || {};
    global.bc.model.Line = jest.fn().mockImplementation(() => ({
      id: 'temp-line',
      properties: {}
    }));

    // Mock goog.math.Coordinate
    global.goog = global.goog || {};
    global.goog.math = global.goog.math || {};
    global.goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));
    global.goog.math.nearlyEquals = jest.fn((a, b) => Math.abs(a - b) < 0.001);
    global.goog.math.clamp = jest.fn((value, min, max) => Math.max(min, Math.min(max, value)));

    // Mock goog.array methods
    global.goog.array = global.goog.array || {};
    global.goog.array.remove = jest.fn((array, item) => {
      const index = array.indexOf(item);
      if (index > -1) {
        array.splice(index, 1);
        return true;
      }
      return false;
    });
    global.goog.array.find = jest.fn((array, predicate) => {
      for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
          return array[i];
        }
      }
      return null;
    });
    global.goog.array.some = jest.fn((array, predicate) => {
      for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
          return true;
        }
      }
      return false;
    });

    mockController = {
      getSelectedItems: jest.fn(() => []),
      isItemSelected: jest.fn(() => false)
    };

    mockImage = {
      width: 800,
      height: 600,
      src: 'test-image.jpg'
    };

    mockDefaultProperties = {
      'is': 1.5,
      'ic': '#FF0000'
    };
  });

  test('should create canvas with correct dimensions', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage, mockDefaultProperties);

    expect(canvas.w).toBe(800);
    expect(canvas.h).toBe(600);
    expect(canvas.image).toBe(mockImage);
    expect(canvas.controller).toBe(mockController);
  });

  test('should initialize with default scale', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage);
    expect(canvas.scale).toBe(1);
  });

  test('should initialize with predefined scale levels', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage);
    const expectedScales = [1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16];
    expect(canvas.scales).toEqual(expectedScales);
  });

  test('should initialize with default properties', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage);
    
    expect(canvas.properties['is']).toBe(1);
    expect(canvas.properties['ic']).toBe('#ffff00');
    expect(canvas.properties['ia']).toBe(1);
    expect(canvas.properties['nl']).toBe(10);
    expect(canvas.properties['fl']).toBe(10);
    expect(canvas.properties['lc']).toBe(false);
    expect(canvas.properties['ta']).toBe('l');
    expect(canvas.properties['tb']).toBe(false);
  });

  test('should override default properties with provided properties', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage, mockDefaultProperties);
    
    expect(canvas.properties['is']).toBe(1.5);
    expect(canvas.properties['ic']).toBe('#FF0000');
    expect(canvas.properties['ia']).toBe(1); // Not overridden
  });

  test('should create temp line and add it to items', () => {
    const canvas = new bc.model.Canvas(mockController, mockImage);
    
    expect(bc.model.Line).toHaveBeenCalledWith(
      { controlPoints: [{ x: 0, y: 0 }] },
      canvas.properties
    );
    expect(canvas.items).toHaveLength(1);
    expect(canvas.tempLine).toBeDefined();
  });
});

describe('bc.model.Canvas item management', () => {
  let canvas;
  let mockController;
  let mockImage;

  beforeEach(() => {
    // Setup mocks
    global.bc.model.Line = jest.fn().mockImplementation(() => ({
      id: 'temp-line',
      properties: {}
    }));
    global.goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));
    global.goog.array.remove = jest.fn((array, item) => {
      const index = array.indexOf(item);
      if (index > -1) {
        array.splice(index, 1);
        return true;
      }
      return false;
    });
    global.goog.array.find = jest.fn((array, predicate) => {
      for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
          return array[i];
        }
      }
      return null;
    });

    mockController = {
      getSelectedItems: jest.fn(() => []),
      isItemSelected: jest.fn(() => false)
    };

    mockImage = {
      width: 800,
      height: 600
    };

    canvas = new bc.model.Canvas(mockController, mockImage);
  });

  test('should add item to items array', () => {
    const mockItem = { id: 'test-item', properties: {} };
    const initialLength = canvas.items.length;

    canvas.addItem(mockItem);

    expect(canvas.items).toHaveLength(initialLength + 1);
    expect(canvas.items).toContain(mockItem);
  });

  test('should remove item from items array', () => {
    const mockItem = { id: 'test-item', properties: {} };
    canvas.addItem(mockItem);
    const initialLength = canvas.items.length;

    canvas.removeItem(mockItem);

    expect(canvas.items).toHaveLength(initialLength - 1);
    expect(canvas.items).not.toContain(mockItem);
  });

  test('should remove all items and add temp line back', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    const mockItem2 = { id: 'item-2', properties: {} };
    canvas.addItem(mockItem1);
    canvas.addItem(mockItem2);

    canvas.removeAllItems();

    expect(canvas.items).toHaveLength(1);
    expect(canvas.items[0]).toBe(canvas.tempLine);
  });

  test('should find item by id', () => {
    const mockItem = { id: 'test-item', properties: {} };
    canvas.addItem(mockItem);

    const foundItem = canvas.getItem('test-item');

    expect(foundItem).toBe(mockItem);
  });

  test('should return null for non-existent item id', () => {
    const foundItem = canvas.getItem('non-existent');

    expect(foundItem).toBeNull();
  });
});

describe('bc.model.Canvas iteration methods', () => {
  let canvas;
  let mockController;
  let mockImage;

  beforeEach(() => {
    // Setup mocks
    global.bc.model.Line = jest.fn().mockImplementation(() => ({
      id: 'temp-line',
      properties: {}
    }));
    global.goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));
    global.goog.array.some = jest.fn((array, predicate) => {
      for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
          return true;
        }
      }
      return false;
    });

    mockController = {
      getSelectedItems: jest.fn(() => []),
      isItemSelected: jest.fn(() => false)
    };

    mockImage = {
      width: 800,
      height: 600
    };

    canvas = new bc.model.Canvas(mockController, mockImage);
  });

  test('should iterate through items in order (top down)', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    const mockItem2 = { id: 'item-2', properties: {} };
    const mockItem3 = { id: 'item-3', properties: {} };
    
    canvas.addItem(mockItem1);
    canvas.addItem(mockItem2);
    canvas.addItem(mockItem3);

    const visitedItems = [];
    canvas.eachOrderedItem((item) => {
      visitedItems.push(item.id);
      return false; // Continue iteration
    });

    // Should iterate in reverse order (newest first), excluding temp line
    expect(visitedItems).toEqual(['item-3', 'item-2', 'item-1']);
  });

  test('should stop iteration when callback returns true', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    const mockItem2 = { id: 'item-2', properties: {} };
    const mockItem3 = { id: 'item-3', properties: {} };
    
    canvas.addItem(mockItem1);
    canvas.addItem(mockItem2);
    canvas.addItem(mockItem3);

    const visitedItems = [];
    canvas.eachOrderedItem((item) => {
      visitedItems.push(item.id);
      return item.id === 'item-2'; // Stop at item-2
    });

    expect(visitedItems).toEqual(['item-3', 'item-2']);
  });

  test('should iterate through selected items first when selectedFirst is true', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    const mockItem2 = { id: 'item-2', properties: {} };
    const mockItem3 = { id: 'item-3', properties: {} };
    
    canvas.addItem(mockItem1);
    canvas.addItem(mockItem2);
    canvas.addItem(mockItem3);

    mockController.getSelectedItems.mockReturnValue([mockItem2, mockItem3]);
    mockController.isItemSelected.mockImplementation((item) => 
      item.id === 'item-2' || item.id === 'item-3'
    );

    const visitedItems = [];
    canvas.eachOrderedItem((item) => {
      visitedItems.push(item.id);
      return false;
    }, true);

    // Should visit selected items first, then others
    expect(visitedItems).toContain('item-2');
    expect(visitedItems).toContain('item-3');
    expect(visitedItems).toContain('item-1');
  });

  test('should iterate through all items (bottom up)', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    const mockItem2 = { id: 'item-2', properties: {} };
    const mockItem3 = { id: 'item-3', properties: {} };
    
    canvas.addItem(mockItem1);
    canvas.addItem(mockItem2);
    canvas.addItem(mockItem3);

    const visitedItems = [];
    canvas.eachItem((item) => {
      visitedItems.push(item.id);
      return false;
    });

    // Should iterate in order, excluding temp line
    expect(visitedItems).toEqual(['item-1', 'item-2', 'item-3']);
  });

  test('should include temp line when includeHidden is true', () => {
    const mockItem1 = { id: 'item-1', properties: {} };
    canvas.addItem(mockItem1);

    const visitedItems = [];
    canvas.eachItem((item) => {
      visitedItems.push(item.id);
      return false;
    }, true);

    expect(visitedItems).toContain('temp-line');
    expect(visitedItems).toContain('item-1');
  });
});

describe('bc.model.Canvas zoom functionality', () => {
  let canvas;
  let mockController;
  let mockImage;

  beforeEach(() => {
    // Setup mocks
    global.bc.model.Line = jest.fn().mockImplementation(() => ({
      id: 'temp-line',
      properties: {}
    }));
    global.goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));
    global.goog.math.nearlyEquals = jest.fn((a, b) => Math.abs(a - b) < 0.001);
    global.goog.math.clamp = jest.fn((value, min, max) => Math.max(min, Math.min(max, value)));

    mockController = {
      getSelectedItems: jest.fn(() => []),
      isItemSelected: jest.fn(() => false)
    };

    mockImage = {
      width: 800,
      height: 600
    };

    canvas = new bc.model.Canvas(mockController, mockImage);
  });

  test('should zoom out to previous scale level', () => {
    canvas.scale = 1;
    canvas.zoomOut();
    expect(canvas.scale).toBe(2/3);
  });

  test('should zoom out to nearest scale level when not exact match', () => {
    canvas.scale = 1.5;
    canvas.zoomOut();
    expect(canvas.scale).toBe(1);
  });

  test('should not zoom out below minimum scale', () => {
    canvas.scale = 1/8;
    canvas.zoomOut();
    expect(canvas.scale).toBe(1/8);
  });

  test('should zoom in to next scale level', () => {
    canvas.scale = 1;
    canvas.zoomIn();
    expect(canvas.scale).toBe(2);
  });

  test('should zoom in to nearest scale level when not exact match', () => {
    canvas.scale = 1.5;
    canvas.zoomIn();
    expect(canvas.scale).toBe(2);
  });

  test('should not zoom in above maximum scale', () => {
    canvas.scale = 16;
    canvas.zoomIn();
    expect(canvas.scale).toBe(16);
  });

  test('should zoom to specific scale level', () => {
    canvas.zoomTo(3);
    expect(canvas.scale).toBe(3);
  });

  test('should clamp zoom to valid range', () => {
    canvas.zoomTo(0.1); // Below minimum
    expect(global.goog.math.clamp).toHaveBeenCalledWith(0.1, 1/8, 16);
    
    canvas.zoomTo(20); // Above maximum
    expect(global.goog.math.clamp).toHaveBeenCalledWith(20, 1/8, 16);
  });

  test('should handle zoom levels appropriate for climbing route viewing', () => {
    // Test zoom levels that are useful for viewing climbing routes
    const usefulZooms = [1/4, 1/2, 1, 2, 4];
    
    usefulZooms.forEach(zoom => {
      canvas.zoomTo(zoom);
      expect(canvas.scale).toBe(zoom);
    });
  });
});

describe('Climbing-specific canvas functionality', () => {
  let canvas;
  let mockController;
  let mockImage;

  beforeEach(() => {
    global.bc.model.Line = jest.fn().mockImplementation(() => ({
      id: 'temp-line',
      properties: {}
    }));
    global.goog.math.Coordinate = jest.fn().mockImplementation((x, y) => ({ x, y }));

    mockController = {
      getSelectedItems: jest.fn(() => []),
      isItemSelected: jest.fn(() => false)
    };

    mockImage = {
      width: 1200,
      height: 800
    };

    canvas = new bc.model.Canvas(mockController, mockImage);
  });

  test('should handle typical climbing route image dimensions', () => {
    expect(canvas.w).toBe(1200);
    expect(canvas.h).toBe(800);
    expect(canvas.w / canvas.h).toBe(1.5); // Typical aspect ratio for route photos
  });

  test('should manage climbing route elements correctly', () => {
    const anchor = { id: 'anchor-1', type: 'anchor', properties: {} };
    const line = { id: 'line-1', type: 'line', properties: {} };
    const text = { id: 'text-1', type: 'text', properties: {} };

    canvas.addItem(anchor);
    canvas.addItem(line);
    canvas.addItem(text);

    expect(canvas.getItem('anchor-1')).toBe(anchor);
    expect(canvas.getItem('line-1')).toBe(line);
    expect(canvas.getItem('text-1')).toBe(text);
  });

  test('should provide appropriate zoom levels for route detail viewing', () => {
    // Test that zoom levels are appropriate for viewing climbing route details
    const detailZooms = [1, 2, 3, 4];
    
    detailZooms.forEach(zoom => {
      canvas.zoomTo(zoom);
      expect(canvas.scale).toBe(zoom);
    });
  });

  test('should handle route overview zoom levels', () => {
    // Test zoom levels for getting an overview of the entire route
    const overviewZooms = [1/4, 1/3, 1/2, 2/3];
    
    overviewZooms.forEach(zoom => {
      canvas.zoomTo(zoom);
      expect(canvas.scale).toBe(zoom);
    });
  });
}); 