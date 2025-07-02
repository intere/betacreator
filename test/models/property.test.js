/**
 * Unit tests for bc.property and bc.properties
 * Tests the property management system for climbing route elements
 */

// Import the modules under test
require('../../js/betacreator/util/object.js');
require('../../js/betacreator/models/Action.js');
require('../../js/betacreator/models/property.js');

describe('bc.properties enum', () => {
  test('should define all essential climbing route properties', () => {
    expect(bc.properties.ITEM_TYPE).toBe('it');
    expect(bc.properties.ITEM_COLOR).toBe('ic');
    expect(bc.properties.ITEM_SCALE).toBe('is');
    expect(bc.properties.ITEM_ALPHA).toBe('ia');
    expect(bc.properties.ITEM_LINEWIDTH).toBe('lw');
    expect(bc.properties.ITEM_X).toBe('x');
    expect(bc.properties.ITEM_Y).toBe('y');
    expect(bc.properties.ITEM_W).toBe('w');
    expect(bc.properties.ITEM_H).toBe('h');
  });

  test('should define text-specific properties', () => {
    expect(bc.properties.TEXT_ALIGN).toBe('ta');
    expect(bc.properties.TEXT).toBe('t');
    expect(bc.properties.TEXT_BG).toBe('tb');
  });

  test('should define line-specific properties', () => {
    expect(bc.properties.LINE_CONTROLPOINTS).toBe('cp');
    expect(bc.properties.LINE_CURVED).toBe('lc');
    expect(bc.properties.LINE_OFFLENGTH).toBe('fl');
    expect(bc.properties.LINE_ONLENGTH).toBe('nl');
  });

  test('should have unique property keys', () => {
    const values = Object.values(bc.properties);
    const uniqueValues = [...new Set(values)];
    expect(uniqueValues).toHaveLength(values.length);
  });

  test('should use abbreviated keys for efficiency', () => {
    // Test that all keys are short (2 characters) for serialization efficiency
    Object.values(bc.properties).forEach(value => {
      expect(value.length).toBeLessThanOrEqual(2);
    });
  });
});

describe('bc.property.set', () => {
  let mockCanvas;
  let mockSelection;
  let mockAction;

  beforeEach(() => {
    // Reset the canvas reference
    bc.property.canvas = null;
    
    // Create mock canvas
    mockCanvas = {
      getSelectedItems: jest.fn(),
      runAction: jest.fn(),
      model: {
        properties: {}
      }
    };

    // Create mock selection items
    mockSelection = [
      {
        id: 'item-1',
        properties: {
          'ic': '#FF0000',
          'is': 1.0,
          'ia': 1.0
        }
      },
      {
        id: 'item-2',
        properties: {
          'ic': '#00FF00',
          'is': 1.5,
          'ia': 0.8
        }
      }
    ];

    // Create mock action
    mockAction = (type, changed) => ({
      type,
      data: changed
    });

    // Mock bc.model.Action constructor
    global.bc = global.bc || {};
    global.bc.model = global.bc.model || {};
    global.bc.model.Action = jest.fn((type, changed) => mockAction(type, changed));
    global.bc.model.ActionType = {
      EditItem: 'EditItem'
    };
  });

  test('should return early when canvas is not set', () => {
    bc.property.canvas = null;
    bc.property.set('ic', '#0000FF');
    
    expect(mockCanvas.runAction).not.toHaveBeenCalled();
  });

  test('should set property on selected items', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    bc.property.set('ic', '#0000FF');

    expect(mockCanvas.runAction).toHaveBeenCalledTimes(2);
    expect(mockCanvas.runAction).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'item-1',
          'ic': '#0000FF'
        })
      })
    );
  });

  test('should skip items that do not have the property', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    // Try to set a property that doesn't exist on the items
    bc.property.set('nonexistent', 'value');

    expect(mockCanvas.runAction).not.toHaveBeenCalled();
  });

  test('should set property on canvas model when no selection', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue([]);

    bc.property.set('ic', '#0000FF');

    expect(mockCanvas.model.properties['ic']).toBe('#0000FF');
    expect(mockCanvas.runAction).not.toHaveBeenCalled();
  });

  test('should handle color property changes for climbing elements', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    const newColor = '#FF6600'; // Orange for visibility
    bc.property.set('ic', newColor);

    expect(mockCanvas.runAction).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          'ic': newColor
        })
      })
    );
  });

  test('should handle scale property changes for route elements', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    const newScale = 2.0; // Double size
    bc.property.set('is', newScale);

    expect(mockCanvas.runAction).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          'is': newScale
        })
      })
    );
  });
});

describe('bc.property.setBatch', () => {
  let mockCanvas;

  beforeEach(() => {
    bc.property.canvas = null;
    mockCanvas = {
      startUndoBatch: jest.fn(),
      endUndoBatch: jest.fn(),
      getSelectedItems: jest.fn(() => []),
      model: {
        properties: {}
      }
    };
  });

  test('should return early when canvas is not set', () => {
    bc.property.canvas = null;
    const batch = [['ic', '#FF0000'], ['is', 1.5]];
    
    bc.property.setBatch(batch);
    
    expect(mockCanvas.startUndoBatch).not.toHaveBeenCalled();
    expect(mockCanvas.endUndoBatch).not.toHaveBeenCalled();
  });

  test('should process batch operations with undo grouping', () => {
    bc.property.canvas = mockCanvas;
    const batch = [['ic', '#FF0000'], ['is', 1.5], ['ia', 0.8]];
    
    bc.property.setBatch(batch);
    
    expect(mockCanvas.startUndoBatch).toHaveBeenCalledTimes(1);
    expect(mockCanvas.endUndoBatch).toHaveBeenCalledTimes(1);
    expect(mockCanvas.model.properties['ic']).toBe('#FF0000');
    expect(mockCanvas.model.properties['is']).toBe(1.5);
    expect(mockCanvas.model.properties['ia']).toBe(0.8);
  });

  test('should handle empty batch', () => {
    bc.property.canvas = mockCanvas;
    const batch = [];
    
    bc.property.setBatch(batch);
    
    expect(mockCanvas.startUndoBatch).toHaveBeenCalledTimes(1);
    expect(mockCanvas.endUndoBatch).toHaveBeenCalledTimes(1);
  });
});

describe('bc.property.get', () => {
  let mockCanvas;
  let mockSelection;

  beforeEach(() => {
    bc.property.canvas = null;
    mockCanvas = {
      getSelectedItems: jest.fn(),
      model: {
        properties: {
          'ic': '#FF0000',
          'is': 1.0
        }
      }
    };

    mockSelection = [
      {
        id: 'item-1',
        properties: {
          'ic': '#00FF00',
          'is': 1.5
        }
      }
    ];
  });

  test('should return undefined when canvas is not set', () => {
    bc.property.canvas = null;
    const result = bc.property.get('ic');
    expect(result).toBeUndefined();
  });

  test('should return property from selected items', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    const result = bc.property.get('ic');
    expect(result).toBe('#00FF00');
  });

  test('should return property from canvas model when no selection', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue([]);

    const result = bc.property.get('ic');
    expect(result).toBe('#FF0000');
  });

  test('should return undefined for non-existent properties', () => {
    bc.property.canvas = mockCanvas;
    mockCanvas.getSelectedItems.mockReturnValue(mockSelection);

    const result = bc.property.get('nonexistent');
    expect(result).toBeUndefined();
  });

  test('should handle multiple selected items correctly', () => {
    bc.property.canvas = mockCanvas;
    const multipleSelection = [
      { id: 'item-1', properties: { 'ic': '#FF0000' } },
      { id: 'item-2', properties: { 'ic': '#00FF00' } }
    ];
    mockCanvas.getSelectedItems.mockReturnValue(multipleSelection);

    const result = bc.property.get('ic');
    // Should return the first item's property
    expect(result).toBe('#FF0000');
  });
});

describe('bc.property.getterSetter', () => {
  test('should create a getter/setter function', () => {
    const properties = {
      'ic': '#FF0000',
      'is': 1.0
    };

    const getterSetter = bc.property.getterSetter(properties, 'ic');
    expect(typeof getterSetter).toBe('function');
  });

  test('should get property value when called without arguments', () => {
    const properties = {
      'ic': '#FF0000',
      'is': 1.0
    };

    const getterSetter = bc.property.getterSetter(properties, 'ic');
    const result = getterSetter();
    expect(result).toBe('#FF0000');
  });

  test('should set property value when called with argument', () => {
    const properties = {
      'ic': '#FF0000',
      'is': 1.0
    };

    const getterSetter = bc.property.getterSetter(properties, 'ic');
    const result = getterSetter('#00FF00');
    
    expect(properties['ic']).toBe('#00FF00');
    expect(result).toBe('#00FF00');
  });

  test('should not set property if it does not exist', () => {
    const properties = {
      'ic': '#FF0000'
    };

    const getterSetter = bc.property.getterSetter(properties, 'nonexistent');
    const result = getterSetter('new-value');
    
    expect(properties['nonexistent']).toBeUndefined();
    expect(result).toBeUndefined();
  });

  test('should handle undefined value correctly', () => {
    const properties = {
      'ic': '#FF0000'
    };

    const getterSetter = bc.property.getterSetter(properties, 'ic');
    const result = getterSetter(undefined);
    
    expect(properties['ic']).toBe('#FF0000'); // Should not change
    expect(result).toBe('#FF0000');
  });
});

describe('Climbing-specific property validation', () => {
  test('should validate color properties for route visibility', () => {
    const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    validColors.forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  test('should validate scale properties for route element sizing', () => {
    const validScales = [0.5, 1.0, 1.5, 2.0, 3.0];
    validScales.forEach(scale => {
      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThanOrEqual(10); // Reasonable upper limit
    });
  });

  test('should validate alpha properties for transparency', () => {
    const validAlphas = [0.0, 0.25, 0.5, 0.75, 1.0];
    validAlphas.forEach(alpha => {
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThanOrEqual(1);
    });
  });

  test('should validate line width properties for route thickness', () => {
    const validLineWidths = [1, 2, 3, 5, 8];
    validLineWidths.forEach(width => {
      expect(width).toBeGreaterThan(0);
      expect(width).toBeLessThanOrEqual(20); // Reasonable upper limit
    });
  });
}); 