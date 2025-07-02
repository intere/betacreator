/**
 * BetaCreator - Base Protection Element Model
 * 
 * Base class for all climbing protection elements that can be placed on routes.
 * This includes anchors, pitons, belay stations, and rappel points.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.model.Stamp');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * Base class for all climbing protection elements (stamps).
 * Protection elements are placed at specific points on the route to show
 * where gear is placed, belay stations are located, etc.
 * 
 * @param {?Object=} elementParameters - Initial parameters for the protection element
 * @param {Object=} defaultProperties - Default properties for new elements
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Stamp = function(elementParameters, defaultProperties) {
	elementParameters = elementParameters || {};

	// Type identifier for this climbing element
	this.isProtectionElement = true;

	// Unique identifier for this protection element
	this.id = bc.uuid(elementParameters.id);

	// Store all configurable properties
	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = null; // Set by subclasses
	this.properties[bc.properties.ITEM_SCALE] = elementParameters.scale || defaultProperties[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = elementParameters.color || defaultProperties[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = elementParameters.alpha || defaultProperties[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_LINEWIDTH] = elementParameters.lineWidth || 3;
	this.properties[bc.properties.ITEM_X] = elementParameters.x || 0;
	this.properties[bc.properties.ITEM_Y] = elementParameters.y || 0;
	this.properties[bc.properties.ITEM_W] = elementParameters.w || 18;
	this.properties[bc.properties.ITEM_H] = elementParameters.h || 18;
	this.properties[bc.properties.TEXT] = elementParameters.text || '';
	
	// Create getter/setter functions for all properties
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.w = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_W));
	this.h = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_H));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	
	// Properties that can be modified by undo/redo actions
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_X,
		bc.properties.ITEM_Y,
		bc.properties.ITEM_W,
		bc.properties.ITEM_H,
		bc.properties.TEXT
	];

	// Current offset for moving the protection element
	this.offset = new goog.math.Coordinate(0, 0);
};

/**
 * Apply the current offset to the protection element's position and return the changes.
 * This is used when moving protection elements around the canvas.
 *
 * @return {Object} Object containing the updated position
 */
bc.model.Stamp.prototype.applyOffset = function() {
	var positionChanges = {};

	// Update position with current offset
	positionChanges[bc.properties.ITEM_X] = this.x() + this.offset.x;
	positionChanges[bc.properties.ITEM_Y] = this.y() + this.offset.y;
	
	// Reset the offset after applying it
	this.offset.x = 0;
	this.offset.y = 0;

	return positionChanges;
};

/**
 * Parse protection element parameters from a serialized format.
 * Used when loading route data from saved files.
 * 
 * @param {Object} serializedParams - Serialized element parameters
 * @return {Object} Parsed element parameters ready for constructor
 */
bc.model.Stamp.parseParams = function(serializedParams) {
	serializedParams = serializedParams || {};
	
	return {
		type: serializedParams[bc.properties.ITEM_TYPE],
		scale: serializedParams[bc.properties.ITEM_SCALE],
		color: serializedParams[bc.properties.ITEM_COLOR],
		alpha: serializedParams[bc.properties.ITEM_ALPHA],
		lineWidth: serializedParams[bc.properties.ITEM_LINEWIDTH],
		x: serializedParams[bc.properties.ITEM_X],
		y: serializedParams[bc.properties.ITEM_Y],
		w: serializedParams[bc.properties.ITEM_W],
		h: serializedParams[bc.properties.ITEM_H],
		text: serializedParams[bc.properties.TEXT]
	};
};

/**
 * Set the offset position for moving this protection element.
 * 
 * @param {goog.math.Coordinate} offsetPosition - The offset coordinates to apply
 */
bc.model.Stamp.prototype.setOffset = function(offsetPosition) {
	this.offset.x = offsetPosition.x;
	this.offset.y = offsetPosition.y;
};

/**
 * Serialize this protection element's properties for saving.
 * 
 * @return {Object} Serialized element properties
 */
bc.model.Stamp.prototype.serializeParams = function() {
	var serializedData = {};

	// Copy all properties
	for (var key in this.properties) {
		serializedData[key] = this.properties[key];
	}

	return serializedData;
};

/**
 * Get properties that can be modified by undo/redo actions.
 * 
 * @return {Object} Properties that can be changed
 */
bc.model.Stamp.prototype.getActionParams = function() {
	var self = this,
		actionParams = {};

	goog.array.forEach(this.actionProperties, function(propertyKey) {
		actionParams[propertyKey] = self.properties[propertyKey];
	});

	return actionParams;
};

/**
 * Set properties from an undo/redo action.
 * 
 * @param {Object} actionParams - Properties to update
 */
bc.model.Stamp.prototype.setActionParams = function(actionParams) {
	var self = this;
	goog.array.forEach(this.actionProperties, function(propertyKey) {
		if (actionParams[propertyKey] !== undefined) {
			self.properties[propertyKey] = actionParams[propertyKey];
		}
	});
};
