/**
 * Unit tests for bc.model.Item interface and ItemTypes
 * Tests the core item interface that all climbing route elements implement
 */

// Import the modules under test
require('../../js/betacreator/models/Item.js');

describe('bc.model.ItemTypes', () => {
  test('should define all expected climbing item types', () => {
    expect(bc.model.ItemTypes.LINE).toBe(0);
    expect(bc.model.ItemTypes.ANCHOR).toBe(1);
    expect(bc.model.ItemTypes.PITON).toBe(2);
    expect(bc.model.ItemTypes.RAPPEL).toBe(3);
    expect(bc.model.ItemTypes.BELAY).toBe(4);
    expect(bc.model.ItemTypes.TEXT).toBe(5);
  });

  test('should have unique values for each item type', () => {
    const values = Object.values(bc.model.ItemTypes);
    const uniqueValues = [...new Set(values)];
    expect(uniqueValues).toHaveLength(values.length);
  });

  test('should cover all essential climbing route elements', () => {
    // Test that we have all the essential climbing elements
    const expectedTypes = ['LINE', 'ANCHOR', 'PITON', 'RAPPEL', 'BELAY', 'TEXT'];
    expectedTypes.forEach(type => {
      expect(bc.model.ItemTypes).toHaveProperty(type);
    });
  });
});

describe('bc.model.Item interface', () => {
  test('should be defined as a function', () => {
    expect(typeof bc.model.Item).toBe('function');
  });

  test('should be callable (interface definition)', () => {
    expect(() => new bc.model.Item()).not.toThrow();
  });
});

// Test helper function to create a mock item implementation
function createMockItem() {
  const mockItem = {
    id: 'test-item-1',
    properties: {
      'it': bc.model.ItemTypes.LINE,
      'ic': '#FF0000',
      'is': 1.0,
      'ia': 1.0,
      'x': 100,
      'y': 200
    },
    serializeParams: jest.fn(() => ({
      'it': bc.model.ItemTypes.LINE,
      'ic': '#FF0000',
      'is': 1.0,
      'ia': 1.0,
      'x': 100,
      'y': 200
    })),
    setOffset: jest.fn((coordinate) => {
      mockItem.properties['x'] = coordinate.x;
      mockItem.properties['y'] = coordinate.y;
    })
  };
  
  return mockItem;
}

describe('Item interface implementation', () => {
  test('should require serializeParams method', () => {
    const mockItem = createMockItem();
    expect(typeof mockItem.serializeParams).toBe('function');
    
    const serialized = mockItem.serializeParams();
    expect(serialized).toHaveProperty('it');
    expect(serialized).toHaveProperty('x');
    expect(serialized).toHaveProperty('y');
  });

  test('should require setOffset method', () => {
    const mockItem = createMockItem();
    expect(typeof mockItem.setOffset).toBe('function');
    
    const newPosition = { x: 150, y: 250 };
    mockItem.setOffset(newPosition);
    
    expect(mockItem.properties['x']).toBe(150);
    expect(mockItem.properties['y']).toBe(250);
  });

  test('should handle coordinate updates correctly', () => {
    const mockItem = createMockItem();
    const originalX = mockItem.properties['x'];
    const originalY = mockItem.properties['y'];
    
    const newCoordinate = { x: 300, y: 400 };
    mockItem.setOffset(newCoordinate);
    
    expect(mockItem.properties['x']).toBe(300);
    expect(mockItem.properties['y']).toBe(400);
    expect(mockItem.properties['x']).not.toBe(originalX);
    expect(mockItem.properties['y']).not.toBe(originalY);
  });

  test('should serialize with proper property mapping', () => {
    const mockItem = createMockItem();
    const serialized = mockItem.serializeParams();
    
    // Test that serialized data contains expected properties
    expect(serialized['it']).toBe(bc.model.ItemTypes.LINE);
    expect(serialized['ic']).toBe('#FF0000');
    expect(serialized['is']).toBe(1.0);
    expect(serialized['ia']).toBe(1.0);
    expect(serialized['x']).toBe(100);
    expect(serialized['y']).toBe(200);
  });
});

describe('Climbing-specific item type validation', () => {
  test('should validate anchor type for protection points', () => {
    expect(bc.model.ItemTypes.ANCHOR).toBe(1);
    // Anchors are essential for protection in climbing
    expect(bc.model.ItemTypes.ANCHOR).toBeGreaterThan(bc.model.ItemTypes.LINE);
  });

  test('should validate piton type for traditional protection', () => {
    expect(bc.model.ItemTypes.PITON).toBe(2);
    // Pitons are traditional protection devices
    expect(bc.model.ItemTypes.PITON).toBeGreaterThan(bc.model.ItemTypes.ANCHOR);
  });

  test('should validate rappel type for descent points', () => {
    expect(bc.model.ItemTypes.RAPPEL).toBe(3);
    // Rappel points are crucial for multi-pitch routes
    expect(bc.model.ItemTypes.RAPPEL).toBeGreaterThan(bc.model.ItemTypes.PITON);
  });

  test('should validate belay type for belay stations', () => {
    expect(bc.model.ItemTypes.BELAY).toBe(4);
    // Belay stations are key for multi-pitch climbing
    expect(bc.model.ItemTypes.BELAY).toBeGreaterThan(bc.model.ItemTypes.RAPPEL);
  });

  test('should validate text type for route annotations', () => {
    expect(bc.model.ItemTypes.TEXT).toBe(5);
    // Text is important for route descriptions and beta
    expect(bc.model.ItemTypes.TEXT).toBeGreaterThan(bc.model.ItemTypes.BELAY);
  });
}); 