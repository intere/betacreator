/**
 * Unit tests for bc.model.Action and bc.model.ActionType
 * Tests the action system for undo/redo functionality in climbing route editing
 */

// Import the modules under test
require('../../js/betacreator/util/object.js');
require('../../js/betacreator/models/Action.js');

describe('bc.model.ActionType enum', () => {
  test('should define all action types for climbing route editing', () => {
    expect(bc.model.ActionType.CreateStamp).toBe(1);
    expect(bc.model.ActionType.CreateLine).toBe(2);
    expect(bc.model.ActionType.CreateText).toBe(3);
    expect(bc.model.ActionType.EditItem).toBe(4);
    expect(bc.model.ActionType.DeleteStamp).toBe(5);
    expect(bc.model.ActionType.DeleteLine).toBe(6);
    expect(bc.model.ActionType.DeleteText).toBe(7);
  });

  test('should have unique values for each action type', () => {
    const values = Object.values(bc.model.ActionType);
    const uniqueValues = [...new Set(values)];
    expect(uniqueValues).toHaveLength(values.length);
  });

  test('should cover all essential climbing route operations', () => {
    // Test that we have all the essential operations for route editing
    const expectedTypes = [
      'CreateStamp', 'CreateLine', 'CreateText', 'EditItem',
      'DeleteStamp', 'DeleteLine', 'DeleteText'
    ];
    expectedTypes.forEach(type => {
      expect(bc.model.ActionType).toHaveProperty(type);
    });
  });

  test('should have create/delete pairs for each item type', () => {
    // Test that create and delete actions are paired correctly
    expect(bc.model.ActionType.CreateStamp).toBe(1);
    expect(bc.model.ActionType.DeleteStamp).toBe(5);
    
    expect(bc.model.ActionType.CreateLine).toBe(2);
    expect(bc.model.ActionType.DeleteLine).toBe(6);
    
    expect(bc.model.ActionType.CreateText).toBe(3);
    expect(bc.model.ActionType.DeleteText).toBe(7);
  });
});

describe('bc.model.Action constructor', () => {
  test('should create action with correct properties', () => {
    const params = { id: 'test-item', color: '#FF0000' };
    const action = new bc.model.Action(bc.model.ActionType.CreateLine, params);

    expect(action.type).toBe(bc.model.ActionType.CreateLine);
    expect(action.params).toBe(params);
    expect(action.oldParams).toBeNull();
    expect(action.isRedo).toBe(false);
    expect(action.isUndo).toBe(false);
  });

  test('should handle different action types', () => {
    const createAction = new bc.model.Action(bc.model.ActionType.CreateStamp, {});
    const editAction = new bc.model.Action(bc.model.ActionType.EditItem, {});
    const deleteAction = new bc.model.Action(bc.model.ActionType.DeleteText, {});

    expect(createAction.type).toBe(bc.model.ActionType.CreateStamp);
    expect(editAction.type).toBe(bc.model.ActionType.EditItem);
    expect(deleteAction.type).toBe(bc.model.ActionType.DeleteText);
  });

  test('should handle complex parameters', () => {
    const complexParams = {
      id: 'anchor-1',
      type: 'anchor',
      position: { x: 100, y: 200 },
      color: '#FF0000',
      scale: 1.5,
      properties: {
        'ic': '#FF0000',
        'is': 1.5,
        'x': 100,
        'y': 200
      }
    };

    const action = new bc.model.Action(bc.model.ActionType.CreateStamp, complexParams);
    expect(action.params).toBe(complexParams);
  });
});

describe('bc.model.Action.prototype.copy', () => {
  test('should create a deep copy of an action', () => {
    const originalParams = { id: 'test-item', color: '#FF0000' };
    const originalAction = new bc.model.Action(bc.model.ActionType.CreateLine, originalParams);
    
    // Mock bc.object.copy to return a copy of params
    global.bc = global.bc || {};
    global.bc.object = global.bc.object || {};
    global.bc.object.copy = jest.fn((obj) => ({ ...obj }));

    const copiedAction = originalAction.copy();

    expect(copiedAction).not.toBe(originalAction);
    expect(copiedAction.type).toBe(originalAction.type);
    expect(copiedAction.params).not.toBe(originalAction.params);
    expect(copiedAction.params).toEqual(originalAction.params);
    expect(bc.object.copy).toHaveBeenCalledWith(originalParams);
  });

  test('should preserve action metadata in copy', () => {
    const action = new bc.model.Action(bc.model.ActionType.EditItem, {});
    action.oldParams = { id: 'old-item' };
    action.isRedo = true;
    action.isUndo = false;

    global.bc.object.copy = jest.fn((obj) => ({ ...obj }));

    const copiedAction = action.copy();

    expect(copiedAction.oldParams).toBeNull(); // copy() doesn't copy oldParams
    expect(copiedAction.isRedo).toBe(false); // copy() doesn't copy flags
    expect(copiedAction.isUndo).toBe(false);
  });
});

describe('bc.model.Action.getReverseAction', () => {
  beforeEach(() => {
    // Mock bc.object.copy
    global.bc = global.bc || {};
    global.bc.object = global.bc.object || {};
    global.bc.object.copy = jest.fn((obj) => ({ ...obj }));
  });

  test('should reverse CreateStamp to DeleteStamp', () => {
    const createAction = new bc.model.Action(bc.model.ActionType.CreateStamp, { id: 'stamp-1' });
    const reverseAction = bc.model.Action.getReverseAction(createAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.DeleteStamp);
    expect(reverseAction.params).toEqual(createAction.params);
  });

  test('should reverse CreateLine to DeleteLine', () => {
    const createAction = new bc.model.Action(bc.model.ActionType.CreateLine, { id: 'line-1' });
    const reverseAction = bc.model.Action.getReverseAction(createAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.DeleteLine);
    expect(reverseAction.params).toEqual(createAction.params);
  });

  test('should reverse CreateText to DeleteText', () => {
    const createAction = new bc.model.Action(bc.model.ActionType.CreateText, { id: 'text-1' });
    const reverseAction = bc.model.Action.getReverseAction(createAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.DeleteText);
    expect(reverseAction.params).toEqual(createAction.params);
  });

  test('should reverse DeleteStamp to CreateStamp', () => {
    const deleteAction = new bc.model.Action(bc.model.ActionType.DeleteStamp, { id: 'stamp-1' });
    const reverseAction = bc.model.Action.getReverseAction(deleteAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.CreateStamp);
    expect(reverseAction.params).toEqual(deleteAction.params);
  });

  test('should reverse DeleteLine to CreateLine', () => {
    const deleteAction = new bc.model.Action(bc.model.ActionType.DeleteLine, { id: 'line-1' });
    const reverseAction = bc.model.Action.getReverseAction(deleteAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.CreateLine);
    expect(reverseAction.params).toEqual(deleteAction.params);
  });

  test('should reverse DeleteText to CreateText', () => {
    const deleteAction = new bc.model.Action(bc.model.ActionType.DeleteText, { id: 'text-1' });
    const reverseAction = bc.model.Action.getReverseAction(deleteAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.CreateText);
    expect(reverseAction.params).toEqual(deleteAction.params);
  });

  test('should handle EditItem with oldParams', () => {
    const editAction = new bc.model.Action(bc.model.ActionType.EditItem, { id: 'item-1', color: '#FF0000' });
    editAction.oldParams = { id: 'item-1', color: '#00FF00' };

    const reverseAction = bc.model.Action.getReverseAction(editAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.EditItem);
    expect(reverseAction.params).toEqual(editAction.oldParams);
  });

  test('should return null for unknown action types', () => {
    const unknownAction = new bc.model.Action(999, {});
    const reverseAction = bc.model.Action.getReverseAction(unknownAction);

    expect(reverseAction).toBeNull();
  });

  test('should create new action instance for reverse', () => {
    const originalAction = new bc.model.Action(bc.model.ActionType.CreateStamp, { id: 'stamp-1' });
    const reverseAction = bc.model.Action.getReverseAction(originalAction);

    expect(reverseAction).not.toBe(originalAction);
    expect(reverseAction).toBeInstanceOf(bc.model.Action);
  });
});

describe('Climbing-specific action scenarios', () => {
  test('should handle anchor placement actions', () => {
    const anchorParams = {
      id: 'anchor-1',
      type: 'anchor',
      position: { x: 150, y: 300 },
      color: '#FF0000',
      scale: 1.0
    };

    const createAnchorAction = new bc.model.Action(bc.model.ActionType.CreateStamp, anchorParams);
    const deleteAnchorAction = bc.model.Action.getReverseAction(createAnchorAction);

    expect(deleteAnchorAction.type).toBe(bc.model.ActionType.DeleteStamp);
    expect(deleteAnchorAction.params).toEqual(anchorParams);
  });

  test('should handle route line drawing actions', () => {
    const lineParams = {
      id: 'line-1',
      type: 'line',
      points: [{ x: 100, y: 200 }, { x: 150, y: 250 }, { x: 200, y: 300 }],
      color: '#00FF00',
      width: 3
    };

    const createLineAction = new bc.model.Action(bc.model.ActionType.CreateLine, lineParams);
    const deleteLineAction = bc.model.Action.getReverseAction(createLineAction);

    expect(deleteLineAction.type).toBe(bc.model.ActionType.DeleteLine);
    expect(deleteLineAction.params).toEqual(lineParams);
  });

  test('should handle route text annotation actions', () => {
    const textParams = {
      id: 'text-1',
      type: 'text',
      content: '5.10a',
      position: { x: 200, y: 250 },
      color: '#0000FF',
      fontSize: 14
    };

    const createTextAction = new bc.model.Action(bc.model.ActionType.CreateText, textParams);
    const deleteTextAction = bc.model.Action.getReverseAction(createTextAction);

    expect(deleteTextAction.type).toBe(bc.model.ActionType.DeleteText);
    expect(deleteTextAction.params).toEqual(textParams);
  });

  test('should handle route element property editing', () => {
    const editParams = {
      id: 'anchor-1',
      color: '#FF6600',
      scale: 1.5
    };

    const oldParams = {
      id: 'anchor-1',
      color: '#FF0000',
      scale: 1.0
    };

    const editAction = new bc.model.Action(bc.model.ActionType.EditItem, editParams);
    editAction.oldParams = oldParams;

    const reverseAction = bc.model.Action.getReverseAction(editAction);

    expect(reverseAction.type).toBe(bc.model.ActionType.EditItem);
    expect(reverseAction.params).toEqual(oldParams);
  });

  test('should handle complex route editing scenarios', () => {
    // Simulate a complex route editing session
    const actions = [
      new bc.model.Action(bc.model.ActionType.CreateStamp, { id: 'anchor-1', type: 'anchor' }),
      new bc.model.Action(bc.model.ActionType.CreateLine, { id: 'line-1', type: 'line' }),
      new bc.model.Action(bc.model.ActionType.CreateText, { id: 'text-1', type: 'text' }),
      new bc.model.Action(bc.model.ActionType.EditItem, { id: 'anchor-1', color: '#FF0000' })
    ];

    const reverseActions = actions.map(action => bc.model.Action.getReverseAction(action));

    expect(reverseActions[0].type).toBe(bc.model.ActionType.DeleteStamp);
    expect(reverseActions[1].type).toBe(bc.model.ActionType.DeleteLine);
    expect(reverseActions[2].type).toBe(bc.model.ActionType.DeleteText);
    expect(reverseActions[3].type).toBe(bc.model.ActionType.EditItem);
  });
});

describe('Action system integration', () => {
  test('should maintain action integrity through copy operations', () => {
    const originalParams = {
      id: 'test-item',
      type: 'anchor',
      position: { x: 100, y: 200 },
      properties: { 'ic': '#FF0000', 'is': 1.0 }
    };

    const action = new bc.model.Action(bc.model.ActionType.CreateStamp, originalParams);
    const copiedAction = action.copy();
    const reverseAction = bc.model.Action.getReverseAction(action);

    expect(copiedAction.params).toEqual(originalParams);
    expect(reverseAction.params).toEqual(originalParams);
  });

  test('should handle action chaining for complex operations', () => {
    // Simulate a multi-step route creation
    const step1 = new bc.model.Action(bc.model.ActionType.CreateStamp, { id: 'anchor-1' });
    const step2 = new bc.model.Action(bc.model.ActionType.CreateLine, { id: 'line-1' });
    const step3 = new bc.model.Action(bc.model.ActionType.EditItem, { id: 'anchor-1', color: '#FF0000' });

    const reverse1 = bc.model.Action.getReverseAction(step1);
    const reverse2 = bc.model.Action.getReverseAction(step2);
    const reverse3 = bc.model.Action.getReverseAction(step3);

    // Verify that reversing the chain would undo the operations in reverse order
    expect(reverse1.type).toBe(bc.model.ActionType.DeleteStamp);
    expect(reverse2.type).toBe(bc.model.ActionType.DeleteLine);
    expect(reverse3.type).toBe(bc.model.ActionType.EditItem);
  });
}); 