/**
 * BetaCreator - Mathematical Utilities
 * 
 * Provides mathematical functions for climbing route geometry calculations.
 * Includes line length calculations, curve operations, and distance measurements.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.math');
goog.provide('bc.math.Box');
goog.provide('bc.math.Line');

/**
 * Represents a rectangular bounding box for climbing elements.
 * Used for hit testing, selection, and layout calculations.
 * 
 * @param {number} x - X coordinate of the top-left corner
 * @param {number} y - Y coordinate of the top-left corner
 * @param {number} width - Width of the bounding box
 * @param {number} height - Height of the bounding box
 * @constructor
 */
bc.math.Box = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
};

/**
 * Format a number to a fixed number of decimal places and remove trailing zeros.
 * Used for clean display of coordinate values and measurements.
 * 
 * @param {number} value - The number to format
 * @param {number=} precision - Number of decimal places (default: 0)
 * @return {string} Formatted number string
 */
bc.math.toFixed = function(value, precision) {
	return value.toFixed(precision || 0)
		.replace(/^([^\.]*)$/, '$1.')
		.replace(/\.?0*$/, '');
};

/**
 * Calculate the length of a line segment.
 * Can be called with either two points or four coordinates.
 * 
 * @param {number} startX - X coordinate of start point
 * @param {number} startY - Y coordinate of start point
 * @param {number=} endX - X coordinate of end point (optional if using vector)
 * @param {number=} endY - Y coordinate of end point (optional if using vector)
 * @return {number} Length of the line segment
 */
bc.math.Line.lineLength = function(startX, startY, endX, endY) {
	// If only two arguments provided, treat as vector from origin
	if (arguments.length == 2) {
		return Math.sqrt(startX * startX + startY * startY);
	}
	
	// Calculate length between two points
	var deltaX = endX - startX;
	var deltaY = endY - startY;
	return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Calculate the length of a quadratic Bezier curve.
 * Used for curved climbing route lines to determine dash patterns.
 * 
 * @param {number} startX - X coordinate of start point
 * @param {number} startY - Y coordinate of start point
 * @param {number} controlX - X coordinate of control point
 * @param {number} controlY - Y coordinate of control point
 * @param {number} endX - X coordinate of end point
 * @param {number} endY - Y coordinate of end point
 * @param {number=} accuracy - Number of segments to use for approximation (default: 6)
 * @return {number} Approximate length of the curve
 */ 
bc.math.Line.curveLength = function(startX, startY, controlX, controlY, endX, endY, accuracy) {
	/** @type {number} */
	var totalLength = 0;
	/** @type {number} */
	var currentX = startX;
	/** @type {number} */
	var currentY = startY;
	/** @type {number} */
	var previousX;
	/** @type {number} */
	var previousY;
	/** @type {number} */
	var t;
	/** @type {number} */
	var oneMinusT;
	/** @type {number} */
	var coefficientA;
	/** @type {number} */
	var coefficientB;
	/** @type {number} */
	var coefficientC;
	
	/** @type {number} */
	var segmentCount = accuracy || 6;
	
	// Approximate curve length by summing line segments
	for (var i = 1; i <= segmentCount; i++) {
		t = i / segmentCount;
		oneMinusT = 1 - t;
		coefficientA = oneMinusT * oneMinusT;
		coefficientB = 2 * t * oneMinusT;
		coefficientC = t * t;
		
		previousX = coefficientA * startX + coefficientB * controlX + coefficientC * endX;
		previousY = coefficientA * startY + coefficientB * controlY + coefficientC * endY;
		
		totalLength += bc.math.Line.lineLength(currentX, currentY, previousX, previousY);
		currentX = previousX;
		currentY = previousY;
	}
	return totalLength;
};

/**
 * Extract a portion of a quadratic Bezier curve.
 * Used for creating dashed line patterns on curved route lines.
 * 
 * @param {number} startX - X coordinate of start point
 * @param {number} startY - Y coordinate of start point
 * @param {number} controlX - X coordinate of control point
 * @param {number} controlY - Y coordinate of control point
 * @param {number} endX - X coordinate of end point
 * @param {number} endY - Y coordinate of end point
 * @param {number} t1 - Start parameter (0-1)
 * @param {number} t2 - End parameter (0-1)
 * @return {Array.<number>} Array of curve control points [sx, sy, cx, cy, ex, ey]
 */ 
bc.math.Line.curveSlice = function(startX, startY, controlX, controlY, endX, endY, t1, t2) {
	// Optimize for common cases
	if (t1 == 0) {
		return bc.math.Line.curveSliceUpTo(startX, startY, controlX, controlY, endX, endY, t2);
	} else if (t2 == 1) {
		return bc.math.Line.curveSliceFrom(startX, startY, controlX, controlY, endX, endY, t1);
	}
	
	// General case: slice from 0 to t2, then from t1/t2 to 1
	var curveToT2 = bc.math.Line.curveSliceUpTo(startX, startY, controlX, controlY, endX, endY, t2);
	curveToT2.push(t1 / t2);
	
	return bc.math.Line.curveSliceFrom.apply(null, curveToT2);
};

/**
 * Extract the portion of a curve from start to parameter t.
 * 
 * @param {number} startX - X coordinate of start point
 * @param {number} startY - Y coordinate of start point
 * @param {number} controlX - X coordinate of control point
 * @param {number} controlY - Y coordinate of control point
 * @param {number} endX - X coordinate of end point
 * @param {number} endY - Y coordinate of end point
 * @param {number=} t - End parameter (0-1, default: 1)
 * @return {Array.<number>} Array of curve control points [sx, sy, cx, cy, ex, ey]
 */ 
bc.math.Line.curveSliceUpTo = function(startX, startY, controlX, controlY, endX, endY, t) {
	t = t || 1;
	if (t != 1) {
		// Calculate new control points for the truncated curve
		var midX = controlX + (endX - controlX) * t;
		var midY = controlY + (endY - controlY) * t;
		controlX = startX + (controlX - startX) * t;
		controlY = startY + (controlY - startY) * t;
		endX = controlX + (midX - controlX) * t;
		endY = controlY + (midY - controlY) * t;
	}
	return [startX, startY, controlX, controlY, endX, endY];
};

/**
 * Extract the portion of a curve from parameter t to end.
 * 
 * @param {number} startX - X coordinate of start point
 * @param {number} startY - Y coordinate of start point
 * @param {number} controlX - X coordinate of control point
 * @param {number} controlY - Y coordinate of control point
 * @param {number} endX - X coordinate of end point
 * @param {number} endY - Y coordinate of end point
 * @param {number=} t - Start parameter (0-1, default: 1)
 * @return {Array.<number>} Array of curve control points [sx, sy, cx, cy, ex, ey]
 */ 
bc.math.Line.curveSliceFrom = function(startX, startY, controlX, controlY, endX, endY, t) {
	t = t || 1;
	if (t != 1) {
		// Calculate new control points for the truncated curve
		var midX = startX + (controlX - startX) * t;
		var midY = startY + (controlY - startY) * t;
		controlX = controlX + (endX - controlX) * t;
		controlY = controlY + (endY - controlY) * t;
		startX = midX + (controlX - midX) * t;
		startY = midY + (controlY - midY) * t;
	}
	return [startX, startY, controlX, controlY, endX, endY];
};

/**
 * Calculate the distance from a point to a line segment.
 * Used for hit testing climbing elements like route lines.
 * 
 * @param {goog.math.Coordinate} testPoint - The point to measure from
 * @param {goog.math.Coordinate} lineStart - First endpoint of the line segment
 * @param {goog.math.Coordinate} lineEnd - Second endpoint of the line segment
 * @return {number} Distance from the point to the line segment
 */
bc.math.distanceFromLineSegment = function(testPoint, lineStart, lineEnd) {
	var numerator = (testPoint.x - lineStart.x) * (lineEnd.x - lineStart.x) + 
		(testPoint.y - lineStart.y) * (lineEnd.y - lineStart.y);
	var denominator = (lineEnd.x - lineStart.x) * (lineEnd.x - lineStart.x) + 
		(lineEnd.y - lineStart.y) * (lineEnd.y - lineStart.y);
	var parameter = numerator / denominator;
	
	// Calculate the closest point on the line segment
	var closestX = lineStart.x + parameter * (lineEnd.x - lineStart.x);
	var closestY = lineStart.y + parameter * (lineEnd.y - lineStart.y);
	
	// If the closest point is outside the segment, use the nearest endpoint
	if (parameter < 0) {
		closestX = lineStart.x;
		closestY = lineStart.y;
	} else if (parameter > 1) {
		closestX = lineEnd.x;
		closestY = lineEnd.y;
	}
	
	// Return the distance from the test point to the closest point
	return Math.sqrt((testPoint.x - closestX) * (testPoint.x - closestX) + 
		(testPoint.y - closestY) * (testPoint.y - closestY));
};
