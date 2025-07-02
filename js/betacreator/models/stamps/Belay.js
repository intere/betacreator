/**
 * BetaCreator - Belay Station Element
 * 
 * Represents a belay station that can be placed on routes.
 * Belay stations are where climbers stop to belay their partner.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.model.stamp.Belay');

goog.require('bc.model.Stamp');

/**
 * Represents a belay station element.
 * Belay stations are points where climbers stop to belay their partner.
 * They are typically drawn as circular symbols to indicate a safe stopping point.
 * 
 * @param {?Object=} belayParameters - Initial parameters for the belay station
 * @param {Object=} defaultProperties - Default properties for new belay stations
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Belay = function(belayParameters, defaultProperties) {
	belayParameters = belayParameters || {};
	
	// Belay stations typically have thinner lines than other protection
	if (!belayParameters.lineWidth) {
		belayParameters.lineWidth = 2;
	}

	// Call the parent constructor
	bc.model.Stamp.call(this, belayParameters, defaultProperties);
	
	// Set the element type to belay station
	this.type(bc.model.ItemTypes.BELAY);
};
goog.inherits(bc.model.stamp.Belay, bc.model.Stamp);

/**
 * Test if a point hits this belay station for selection.
 * Belay stations are drawn as circular symbols, so we test against the circle.
 * 
 * @param {number} testX - X coordinate to test
 * @param {number} testY - Y coordinate to test
 * @param {boolean=} isSelected - Whether the belay station is currently selected
 * @return {boolean} True if the point hits the belay station
 */
bc.model.stamp.Belay.prototype.hitTest = function(testX, testY, isSelected) {
	var hitDistance = this.lineWidth() * this.scale() / 2 + 1;

	// Test if the point is within the circular area of the belay station
	if (goog.math.Coordinate.distance(
		new goog.math.Coordinate(testX, testY),
		new goog.math.Coordinate(this.x(), this.y())
	) <= this.w() * this.scale() / 2 + hitDistance) {
		return true;
	}

	return false;
};
