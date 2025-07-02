/**
 * BetaCreator - Piton Protection Element
 * 
 * Represents a piton placement that can be placed on routes.
 * Pitons are traditional protection devices hammered into rock cracks.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.model.stamp.Piton');

goog.require('bc.model.Stamp');

/**
 * Represents a piton protection element.
 * Pitons are traditional protection devices that are hammered into rock cracks.
 * They are typically drawn as triangular or wedge-shaped symbols.
 * 
 * @param {?Object=} pitonParameters - Initial parameters for the piton
 * @param {Object=} defaultProperties - Default properties for new pitons
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Piton = function(pitonParameters, defaultProperties) {
	pitonParameters = pitonParameters || {};

	// Set default dimensions for piton symbols
	if (!pitonParameters.w) {
		pitonParameters.w = 12;
	}
	if (!pitonParameters.h) {
		pitonParameters.h = 12;
	}

	// Call the parent constructor
	bc.model.Stamp.call(this, pitonParameters, defaultProperties);
	
	// Set the element type to piton
	this.type(bc.model.ItemTypes.PITON);
};
goog.inherits(bc.model.stamp.Piton, bc.model.Stamp);

/**
 * Test if a point hits this piton for selection.
 * Pitons are drawn as triangular symbols, so we test against the triangular shape.
 * 
 * @param {number} testX - X coordinate to test
 * @param {number} testY - Y coordinate to test
 * @param {boolean=} isSelected - Whether the piton is currently selected
 * @return {boolean} True if the point hits the piton
 */
bc.model.stamp.Piton.prototype.hitTest = function(testX, testY, isSelected) {
	var hitDistance = this.lineWidth() * this.scale() / 2 + 1,
		width = this.w() * this.scale(),
		height = this.h() * this.scale();

	// Quick bounding box test - if the point is outside the bounding box, return early
	if (Math.abs(testX - this.x()) > width / 2 + hitDistance || 
		Math.abs(testY - this.y()) > height / 2 + hitDistance) {
		return false;
	}

	// Define the triangular shape of the piton
	var leftEdge = this.x() - 0.1 * width,
		pitonBottom = this.y() + 0.1 * height;

	// Test if the point is within the triangular area
	// Exclude areas outside the triangle shape
	if (testX < leftEdge - hitDistance || 
		(testX > leftEdge + hitDistance && testY > pitonBottom + hitDistance)) {
		return false;
	}

	return true;
};
