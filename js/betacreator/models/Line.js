/**
 * BetaCreator - Route Line Model
 * 
 * Represents a climbing route line that shows the path of the climb.
 * Supports both straight lines and curved lines with control points.
 * Lines can be dashed to show different climbing styles or difficulty sections.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.model.Line');

goog.require('bc.model.Item');
goog.require('bc.math');
goog.require('bc.object');
goog.require('bc.render.DashedLine');
goog.require('bc.uuid');
goog.require('goog.array');

/**
 * Represents a climbing route line that can be drawn on a climbing photo.
 * Route lines show the path of the climb and can be straight or curved.
 * They support dashed patterns to indicate different climbing styles or difficulty.
 * 
 * @param {?Object=} lineParameters - Initial parameters for the route line
 * @param {Object=} defaultProperties - Default properties for new lines
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Line = function(lineParameters, defaultProperties) {
	lineParameters = lineParameters || {};

	// Type identifier for this climbing element
	this.isRouteLine = true;
	
	// Unique identifier for this route line
	this.id = bc.uuid(lineParameters.id);

	// Store all configurable properties
	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.LINE;
	this.properties[bc.properties.ITEM_SCALE] = lineParameters.scale || defaultProperties[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = lineParameters.color || defaultProperties[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = lineParameters.alpha || defaultProperties[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_LINEWIDTH] = lineParameters.lineWidth || 3;
	this.properties[bc.properties.LINE_CONTROLPOINTS] = lineParameters.controlPoints || [];
	this.properties[bc.properties.LINE_ONLENGTH] = lineParameters.onLength || defaultProperties[bc.properties.LINE_ONLENGTH];
	this.properties[bc.properties.LINE_OFFLENGTH] = goog.isNumber(lineParameters.offLength) ? lineParameters.offLength : defaultProperties[bc.properties.LINE_OFFLENGTH];
	this.properties[bc.properties.LINE_CURVED] = lineParameters.curved || defaultProperties[bc.properties.LINE_CURVED];

	// Create getter/setter functions for all properties
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.controlPoints = /** @type {function(Array.<goog.math.Coordinate>=):Array.<goog.math.Coordinate>} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CONTROLPOINTS));
	this.onLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_ONLENGTH));
	this.offLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_OFFLENGTH));
	this.curved = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CURVED));
	
	// Properties that can be modified by undo/redo actions
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_LINEWIDTH,
		bc.properties.LINE_CONTROLPOINTS,
		bc.properties.LINE_ONLENGTH,
		bc.properties.LINE_OFFLENGTH,
		bc.properties.LINE_CURVED
	];

	// Current offset for moving the line
	this.offset = new goog.math.Coordinate(0, 0);
	
	/** @type {Array.<goog.math.Coordinate>} */
	this.points = [];
	
	// Initialize the line points
	this.updatePoints();
};

/**
 * Generate points along a curved line segment using quadratic Bezier curves.
 * This creates smooth curves between control points for natural-looking route lines.
 * 
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {number} controlX - Control point X coordinate
 * @param {number} controlY - Control point Y coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endY - Ending Y coordinate
 * @param {number} pointSpacing - Distance between generated points
 * 
 * @return {Array.<goog.math.Coordinate>} Array of points along the curve
 */
bc.model.Line.prototype.getCurvePoints = function(startX, startY, controlX, controlY, endX, endY, pointSpacing) {
	/** @type {Array.<goog.math.Coordinate>} */
	var curvePoints = [];
	
	/** @type {number} */
	var curveLength = bc.math.Line.curveLength(startX, startY, controlX, controlY, endX, endY);
	/** @type {number} */
	var currentT = 0;
	/** @type {number} */
	var nextT = 0;
	/** @type {Array.<number>} */
	var curveSegment;
	
	var remainingLength = curveLength;
	var fullDashCount = Math.floor(remainingLength / pointSpacing);
	var tIncrement = pointSpacing / curveLength;
	
	if (fullDashCount) {
		for (var i = 0; i < fullDashCount; i++) {
			nextT = currentT + tIncrement;
			curveSegment = bc.math.Line.curveSlice(startX, startY, controlX, controlY, endX, endY, currentT, nextT);
			curvePoints.push(new goog.math.Coordinate(curveSegment[4], curveSegment[5]));
			currentT = nextT;
		}
		
		// Always add the end point
		curvePoints.push(new goog.math.Coordinate(endX, endY));
	}
	
	return curvePoints;
};

/*******************************************************************************
 * 
 * PUBLIC METHODS
 * 
 ******************************************************************************/

/**
 * Apply the current offset to all control points and return the changes.
 * This is used when moving a route line to update its position.
 *
 * @return {Object} Object containing the updated control points
 */
bc.model.Line.prototype.applyOffset = function() {	
	var self = this,
		updatedControlPoints = [],
		changes = {};
	
	// Apply offset to each control point
	goog.array.forEach(this.controlPoints(), function(controlPoint) {
		updatedControlPoints.push(new goog.math.Coordinate(
			controlPoint.x + self.offset.x, 
			controlPoint.y + self.offset.y
		));
	});
	
	// Reset the offset after applying it
	this.offset.x = 0;
	this.offset.y = 0;

	changes[bc.properties.LINE_CONTROLPOINTS] = updatedControlPoints;
	return changes;
};

/**
 * Parse route line parameters from a serialized format.
 * Used when loading route data from saved files.
 * 
 * @param {Object} serializedParams - Serialized line parameters
 * @return {Object} Parsed line parameters ready for constructor
 */
bc.model.Line.parseParams = function(serializedParams) {
	serializedParams = serializedParams || {};
	
	var parsedParams = {
		type: serializedParams[bc.properties.ITEM_TYPE],
		scale: serializedParams[bc.properties.ITEM_SCALE],
		color: serializedParams[bc.properties.ITEM_COLOR],
		alpha: serializedParams[bc.properties.ITEM_ALPHA],
		lineWidth: serializedParams[bc.properties.ITEM_LINEWIDTH],
		onLength: serializedParams[bc.properties.LINE_ONLENGTH],
		offLength: serializedParams[bc.properties.LINE_OFFLENGTH],
		curved: serializedParams[bc.properties.LINE_CURVED]
	};
	
	// Parse control points if they exist
	if (serializedParams[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(serializedParams[bc.properties.LINE_CONTROLPOINTS])) {
		var controlPoints = [];
		goog.array.forEach(serializedParams[bc.properties.LINE_CONTROLPOINTS], function(pointData) {
			controlPoints.push(new goog.math.Coordinate(pointData['x'], pointData['y']));
		});
		parsedParams.controlPoints = controlPoints;
	}
	
	return parsedParams;
};

/**
 * Set the offset position for moving this route line.
 * 
 * @param {goog.math.Coordinate} offsetPosition - The offset coordinates to apply
 */
bc.model.Line.prototype.setOffset = function(offsetPosition) {
	this.offset = offsetPosition;
};

/**
 * Serialize this route line's properties for saving.
 * 
 * @return {Object} Serialized line properties
 */
bc.model.Line.prototype.serializeParams = function() {
	var serializedData = {};

	// Copy all properties
	for (var key in this.properties) {
		serializedData[key] = this.properties[key];
	}

	// Convert control points to serializable format
	if (serializedData[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(serializedData[bc.properties.LINE_CONTROLPOINTS])) {
		var serializedControlPoints = [];
		goog.array.forEach(serializedData[bc.properties.LINE_CONTROLPOINTS], function(controlPoint) {
			serializedControlPoints.push({
				'x': controlPoint.x,
				'y': controlPoint.y
			});
		});
		serializedData[bc.properties.LINE_CONTROLPOINTS] = serializedControlPoints;
	}

	return serializedData;
};

/**
 * Get properties that can be modified by undo/redo actions.
 * 
 * @return {Object} Properties that can be changed
 */
bc.model.Line.prototype.getActionParams = function() {
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
bc.model.Line.prototype.setActionParams = function(actionParams) {
	var self = this;
	goog.array.forEach(this.actionProperties, function(propertyKey) {
		if (actionParams[propertyKey] !== undefined) {
			self.properties[propertyKey] = actionParams[propertyKey];
		}
	});
};

/**
 * Test if a point hits this route line for selection.
 * Used for mouse interaction and selection.
 * 
 * @param {number} testX - X coordinate to test
 * @param {number} testY - Y coordinate to test
 * @param {boolean=} isSelected - Whether the line is currently selected
 * @return {boolean} True if the point hits the line
 */
bc.model.Line.prototype.hitTest = function(testX, testY, isSelected) {
	var linePoints = this.points,
		hitDistance = this.lineWidth() * this.scale() / 2 + 6;
	
	// Test each line segment
	for (var i = 0, segmentCount = linePoints.length - 1; i < segmentCount; i++) {
		if (bc.math.distanceFromLineSegment(
			new goog.math.Coordinate(testX, testY),
			linePoints[i],
			linePoints[i + 1]
		) < hitDistance) {
			return true;
		}
	}
	return false;
};

/**
 * Calculate the bounding box based on the control points.
 * Used for selection, rendering optimization, and collision detection.
 */
bc.model.Line.prototype.updateBoundingBox = function() {
	if (this.controlPoints().length === 0) {
		this.boundingBox = null;
		return;
	}
	
	var minX = Number.MAX_VALUE,
		maxX = -Number.MAX_VALUE,
		minY = Number.MAX_VALUE,
		maxY = -Number.MAX_VALUE;
	
	// Find the extents of all control points
	goog.array.forEach(this.controlPoints(), function(controlPoint) {
		minX = Math.min(minX, controlPoint.x);
		maxX = Math.max(maxX, controlPoint.x);
		minY = Math.min(minY, controlPoint.y);
		maxY = Math.max(maxY, controlPoint.y);
	});
	
	this.boundingBox = new bc.math.Box(minX, minY, maxX - minX, maxY - minY);
};

/**
 * Generate all the points along the route line for rendering and hit testing.
 * For curved lines, this creates intermediate points along the curves.
 * For straight lines, this just uses the control points.
 */
bc.model.Line.prototype.updatePoints = function() {
	var self = this;
	
	/** @type {Array.<goog.math.Coordinate>} */
	var generatedPoints = [];
	
	var pointSpacing = 10; // Distance between points on curves
	
	if (this.curved()) {
		// Generate points for curved lines
		var controlPoints = this.controlPoints(),
			controlPointCount = controlPoints.length;
		
		goog.array.forEach(controlPoints, function(controlPoint, index) {
			// For the first point, just add it
			if (index === 0) {
				generatedPoints.push(new goog.math.Coordinate(controlPoint.x, controlPoint.y));
			} else {
				var previousControlPoint = controlPoints[index - 1];
				
				// For the second point, add a point halfway between first and second
				if (index == 1) {
					generatedPoints.push(new goog.math.Coordinate(
						(controlPoint.x + previousControlPoint.x) / 2, 
						(controlPoint.y + previousControlPoint.y) / 2
					));
				} else {
					// For other points, generate curve points from previous midpoint to current midpoint
					generatedPoints = generatedPoints.concat(self.getCurvePoints(
						generatedPoints[generatedPoints.length - 1].x,
						generatedPoints[generatedPoints.length - 1].y,
						previousControlPoint.x,
						previousControlPoint.y,
						(controlPoint.x + previousControlPoint.x) / 2,
						(controlPoint.y + previousControlPoint.y) / 2,
						pointSpacing
					));
				}
				
				// If it's the last point, add it
				if (index == controlPointCount - 1) {
					generatedPoints.push(new goog.math.Coordinate(controlPoint.x, controlPoint.y));
				}
			}
		});
	} else {
		// For straight lines, just use the control points
		goog.array.forEach(this.controlPoints(), function(controlPoint) {
			generatedPoints.push(new goog.math.Coordinate(controlPoint.x, controlPoint.y));
		});
	}
	
	this.points = generatedPoints;
};
