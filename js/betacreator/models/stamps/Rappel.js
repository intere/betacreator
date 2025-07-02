/**
 * BetaCreator - Rappel Station Element
 * 
 * Represents a rappel station that can be placed on routes.
 * Rappel stations are where climbers descend using ropes.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.model.stamp.Rappel');

goog.require('bc.model.Stamp');

/**
 * Represents a rappel station element.
 * Rappel stations are points where climbers descend using ropes.
 * They are typically drawn as circular symbols similar to belay stations.
 * 
 * @param {?Object=} rappelParameters - Initial parameters for the rappel station
 * @param {Object=} defaultProperties - Default properties for new rappel stations
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Rappel = function(rappelParameters, defaultProperties) {
	rappelParameters = rappelParameters || {};
	
	// Rappel stations typically have thinner lines than other protection
	if (!rappelParameters.lineWidth) {
		rappelParameters.lineWidth = 2;
	}
	
	// Call the parent constructor
	bc.model.Stamp.call(this, rappelParameters, defaultProperties);
	
	// Set the element type to rappel station
	this.type(bc.model.ItemTypes.RAPPEL);
};
goog.inherits(bc.model.stamp.Rappel, bc.model.Stamp);

/**
 * Test if a point hits this rappel station for selection.
 * Rappel stations are drawn as circular symbols, so we test against the circle.
 * 
 * @param {number} testX - X coordinate to test
 * @param {number} testY - Y coordinate to test
 * @param {boolean=} isSelected - Whether the rappel station is currently selected
 * @return {boolean} True if the point hits the rappel station
 */
bc.model.stamp.Rappel.prototype.hitTest = function(testX, testY, isSelected) {
	var hitDistance = this.lineWidth() * this.scale() / 2 + 1;

	// Test if the point is within the circular area of the rappel station
	if (goog.math.Coordinate.distance(
		new goog.math.Coordinate(testX, testY),
		new goog.math.Coordinate(this.x(), this.y())
	) <= this.w() * this.scale() / 2 + hitDistance) {
		return true;
	}

	return false;
};
