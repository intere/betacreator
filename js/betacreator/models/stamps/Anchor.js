/**
 * BetaCreator - Anchor Protection Element
 * 
 * Represents a climbing anchor that can be placed on routes.
 * Anchors include bolts, trad gear placements, and other protection points.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.model.stamp.Anchor');

goog.require('bc.model.Stamp');

/**
 * Represents a climbing anchor protection element.
 * Anchors are placed at specific points on the route to show where
 * protection is available (bolts, trad gear, etc.).
 * 
 * @param {?Object=} anchorParameters - Initial parameters for the anchor
 * @param {Object=} defaultProperties - Default properties for new anchors
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Anchor = function(anchorParameters, defaultProperties) {
	anchorParameters = anchorParameters || {};
	
	// Set default dimensions for anchor symbols
	if (!anchorParameters.w) {
		anchorParameters.w = 10;
	}
	if (!anchorParameters.h) {
		anchorParameters.h = 10;
	}

	// Call the parent constructor
	bc.model.Stamp.call(this, anchorParameters, defaultProperties);
	
	// Set the element type to anchor
	this.type(bc.model.ItemTypes.ANCHOR);
};
goog.inherits(bc.model.stamp.Anchor, bc.model.Stamp);

/**
 * Test if a point hits this anchor for selection.
 * Anchors are drawn as X-shaped symbols, so we test against both diagonal lines.
 * 
 * @param {number} testX - X coordinate to test
 * @param {number} testY - Y coordinate to test
 * @param {boolean=} isSelected - Whether the anchor is currently selected
 * @return {boolean} True if the point hits the anchor
 */
bc.model.stamp.Anchor.prototype.hitTest = function(testX, testY, isSelected) {
	var scale = this.scale(),
		width = this.w() * scale,
		height = this.h() * scale,
		hitDistance = this.lineWidth() * scale / 2 + 6;
	
	// Test against the first diagonal line (top-left to bottom-right)
	if (bc.math.distanceFromLineSegment(
		new goog.math.Coordinate(testX, testY),
		new goog.math.Coordinate(this.x() - width / 2, this.y() - height / 2),
		new goog.math.Coordinate(this.x() + width / 2, this.y() + height / 2)
	) < hitDistance) {
		return true;
	}
	
	// Test against the second diagonal line (top-right to bottom-left)
	if (bc.math.distanceFromLineSegment(
		new goog.math.Coordinate(testX, testY),
		new goog.math.Coordinate(this.x() + width / 2, this.y() - height / 2),
		new goog.math.Coordinate(this.x() - width / 2, this.y() + height / 2)
	) < hitDistance) {
		return true;
	}

	return false;
};
