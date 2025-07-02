/**
 * BetaCreator - Property Management System
 * 
 * Manages properties for climbing elements and provides getter/setter functionality.
 * Handles property changes, undo/redo operations, and default values.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.property');
goog.provide('bc.properties');

goog.require('bc.model.Action');

/**
 * Reference to the current canvas controller for property operations
 * @type {bc.controller.Canvas|null}
 */
bc.property.canvas = null;

/**
 * Set a property value for the currently selected climbing elements.
 * If no elements are selected, sets the default property for new elements.
 * 
 * @param {string} propertyName - The property to set
 * @param {*} newValue - The new value for the property
 */
bc.property.set = function(propertyName, newValue) {
	var canvas = bc.property.canvas;
	if (!canvas) {
		return;
	}

	var selectedElements = canvas.getSelectedItems();

	if (selectedElements.length > 0) {
		// Apply property change to all selected elements
		goog.array.forEach(selectedElements, function(climbingElement, index) {
			// Only change properties that exist on the element
			if (climbingElement.properties[propertyName] === undefined) {
				return;
			}

			var propertyChange = {
				id: climbingElement.id
			};
			propertyChange[propertyName] = newValue;
			canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, propertyChange));
		});
	} else {
		// Set default property for new elements
		canvas.model.properties[propertyName] = newValue;
	}
};

/**
 * Set multiple properties in a batch operation.
 * This is more efficient than setting properties individually.
 * 
 * @param {Array.<Array>} propertyBatch - Array of [propertyName, value] pairs
 */
bc.property.setBatch = function(propertyBatch) {
	var canvas = bc.property.canvas;
	if (!canvas) {
		return;
	}

	// Start a batch operation for undo/redo
	canvas.startUndoBatch();

	// Apply all property changes
	goog.array.forEach(propertyBatch, function(propertyData) {
		bc.property.set(propertyData[0], propertyData[1]);
	});

	// End the batch operation
	canvas.endUndoBatch();
};

/**
 * Get the current value of a property.
 * Returns the value from selected elements or the default value.
 * 
 * @param {string} propertyName - The property to get
 * @return {*} The current property value
 */
bc.property.get = function(propertyName) {
	var canvas = bc.property.canvas;
	if (!canvas) {
		return;
	}

	var selectedElements = canvas.getSelectedItems(),
		propertyValue;

	if (selectedElements.length > 0) {
		// Get property from the first selected element that has it
		goog.array.some(selectedElements, function(climbingElement, index) {
			if (climbingElement.properties[propertyName] !== undefined) {
				propertyValue = climbingElement.properties[propertyName];
				return true;
			}
			return false;
		});
	} else {
		// Get default property value
		propertyValue = canvas.model.properties[propertyName];
	}

	return propertyValue;
};

/**
 * Create a getter/setter function for a property.
 * This provides a clean interface for accessing and modifying properties.
 * 
 * @param {Object} propertiesObject - The object containing the properties
 * @param {string} propertyName - The property to create getter/setter for
 * @return {function(?):?} Getter/setter function
 */
bc.property.getterSetter = function(propertiesObject, propertyName) {
	return function(value) {
		if (value !== undefined && propertiesObject[propertyName] !== undefined) {
			propertiesObject[propertyName] = value;
		}

		return propertiesObject[propertyName];
	};
};

/**
 * Enumeration of all available property names for climbing elements.
 * These short names are used for efficient serialization and storage.
 * 
 * @enum {string}
 */
bc.properties = {
	// Element type and basic properties
	ITEM_TYPE: 'it',           // Type of climbing element (line, anchor, etc.)
	ITEM_COLOR: 'ic',          // Color of the element
	ITEM_SCALE: 'is',          // Scale/size of the element
	ITEM_ALPHA: 'ia',          // Transparency/opacity
	ITEM_LINEWIDTH: 'lw',      // Width of lines and borders
	
	// Position and size properties
	ITEM_X: 'x',               // X coordinate position
	ITEM_Y: 'y',               // Y coordinate position
	ITEM_W: 'w',               // Width of the element
	ITEM_H: 'h',               // Height of the element
	
	// Text properties
	TEXT_ALIGN: 'ta',          // Text alignment
	TEXT: 't',                 // Text content
	TEXT_BG: 'tb',             // Text background color
	
	// Line-specific properties
	LINE_CONTROLPOINTS: 'cp',  // Control points for curved lines
	LINE_CURVED: 'lc',         // Whether the line is curved
	LINE_OFFLENGTH: 'fl',      // Length of dashed line gaps
	LINE_ONLENGTH: 'nl'        // Length of dashed line segments
};
