/**
 * BetaCreator - Text Annotation Model
 * 
 * Represents text annotations that can be placed on climbing routes.
 * Text elements are used for route names, difficulty ratings, beta notes, etc.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.model.Text');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * Represents a text annotation element that can be placed on climbing routes.
 * Text elements are used for route names, difficulty ratings, beta notes,
 * warnings, and other descriptive information.
 * 
 * @param {?Object=} textParameters - Initial parameters for the text element
 * @param {Object=} defaultProperties - Default properties for new text elements
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Text = function(textParameters, defaultProperties) {
	textParameters = textParameters || {};

	// Type identifier for this climbing element
	this.isTextAnnotation = true;

	// Unique identifier for this text element
	this.id = bc.uuid(textParameters.id);

	// Store all configurable properties
	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.TEXT;
	this.properties[bc.properties.ITEM_SCALE] = textParameters.scale || defaultProperties[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = textParameters.color || defaultProperties[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = textParameters.alpha || defaultProperties[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_X] = textParameters.x || 0;
	this.properties[bc.properties.ITEM_Y] = textParameters.y || 0;
	this.properties[bc.properties.TEXT] = textParameters.text || '';
	this.properties[bc.properties.TEXT_ALIGN] = textParameters.textAlign || defaultProperties[bc.properties.TEXT_ALIGN];
	this.properties[bc.properties.TEXT_BG] = textParameters.textBG || defaultProperties[bc.properties.TEXT_BG];
	
	// Create getter/setter functions for all properties
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	this.textAlign = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_ALIGN));
	this.textBG = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_BG));
	
	// Properties that can be modified by undo/redo actions
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_X,
		bc.properties.ITEM_Y,
		bc.properties.TEXT,
		bc.properties.TEXT_ALIGN,
		bc.properties.TEXT_BG
	];

	// Current offset for moving the text element
	this.offset = new goog.math.Coordinate(0, 0);

	/**
	 * Bounding box for text layout and hit testing
	 * @type {?goog.math.Coordinate}
	 * @private
	 */
	this.boundingBox = null;

	/**
	 * Padding around the bounding box for hit testing
	 * @type {number}
	 * @private
	 */
	this.boundingBoxPadding = 0;

	/** @type {Array.<bc.TextLine>} */
	this.lines = [];
};

/** 
 * Represents a single line of text with formatting information
 * @typedef {{text:string, top:number, size:number, width:number, bold:boolean, italic:boolean}} 
 */
bc.TextLine;

/**
 * Apply the current offset to the text element's position and return the changes.
 * This is used when moving text elements around the canvas.
 *
 * @return {Object} Object containing the updated position
 */
bc.model.Text.prototype.applyOffset = function() {
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
 * Set the bounding box size for text layout and hit testing.
 * The bounding box determines how text wraps and where it can be clicked.
 *
 * @param {goog.math.Coordinate} boundingBoxSize - Size of the bounding box (x == width, y == height)
 * @param {number} boundingBoxPadding - Padding around the bounding box
 */
bc.model.Text.prototype.setBoundingBox = function(boundingBoxSize, boundingBoxPadding) {
	this.boundingBox = boundingBoxSize;
	this.boundingBoxPadding = boundingBoxPadding;
};

/**
 * Calculate the layout of text lines for rendering.
 * This breaks the text into individual lines with positioning information.
 * 
 * @return {Array.<bc.TextLine>} Array of text lines with layout information
 */
bc.model.Text.prototype.calculateLines = function() {
	var defaultFontSize = 12,
		defaultLineSpacing = 1.5,
		textLines = goog.string.trimRight(this.text())
			.replace(/\n\r/g, '\n')
			.replace(/\r/g, '\n')
			.replace(/\t/g, '    ')
			.split('\n'),
		verticalOffset = 0,
		formattedLines = [];

	// Process each line of text
	goog.array.forEach(textLines, function(lineText, lineIndex) {
		formattedLines.push({
			text: lineText,
			top: verticalOffset,
			size: defaultFontSize,
			width: -1, // Will be calculated during rendering
			bold: false,
			italic: false
		});

		verticalOffset += defaultLineSpacing * defaultFontSize;
	});

	return this.lines = formattedLines;
};

/**
 * Parse text element parameters from a serialized format.
 * Used when loading route data from saved files.
 * 
 * @param {Object} serializedParams - Serialized text parameters
 * @return {Object} Parsed text parameters ready for constructor
 */
bc.model.Text.parseParams = function(serializedParams) {
	serializedParams = serializedParams || {};
	
	return {
		type: serializedParams[bc.properties.ITEM_TYPE],
		scale: serializedParams[bc.properties.ITEM_SCALE],
		color: serializedParams[bc.properties.ITEM_COLOR],
		alpha: serializedParams[bc.properties.ITEM_ALPHA],
		x: serializedParams[bc.properties.ITEM_X],
		y: serializedParams[bc.properties.ITEM_Y],
		text: serializedParams[bc.properties.TEXT],
		textAlign: serializedParams[bc.properties.TEXT_ALIGN],
		textBG: serializedParams[bc.properties.TEXT_BG]
	};
};

/**
 * Set the offset position for moving this text element.
 * 
 * @param {goog.math.Coordinate} offsetPosition - The offset coordinates to apply
 */
bc.model.Text.prototype.setOffset = function(offsetPosition) {
	this.offset.x = offsetPosition.x;
	this.offset.y = offsetPosition.y;
};

/**
 * Serialize this text element's properties for saving.
 * 
 * @return {Object} Serialized text properties
 */
bc.model.Text.prototype.serializeParams = function() {
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
bc.model.Text.prototype.getActionParams = function() {
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
bc.model.Text.prototype.setActionParams = function(actionParams) {
	var self = this;
	goog.array.forEach(this.actionProperties, function(propertyKey) {
		if (actionParams[propertyKey] !== undefined) {
			self.properties[propertyKey] = actionParams[propertyKey];
		}
	});
};

/**
 * For text, we perform a hit test against each line so we could place other items in the whitespace if desired.
 *
 * @param {number} xCoordinate
 * @param {number} yCoordinate
 * @param {boolean=} isSelected
 * @return {boolean}
 */
bc.model.Text.prototype.hitTest = function(xCoordinate, yCoordinate, isSelected) {
	if (!this.boundingBox)
		return false;

	var currentScale = this.scale(),
		textAlignment = this.textAlign(),
		boundingBox = new bc.math.Box(this.x(), this.y(), this.boundingBox.x * this.scale(), this.boundingBox.y * this.scale()),
		padding = (this.textBG() || isSelected) ? this.boundingBoxPadding : 0;

	if (textAlignment == 'c')
		boundingBox.x -= boundingBox.w / 2;
	else if (textAlignment == 'r')
		boundingBox.x -= boundingBox.w;

	// If we are outside the bounding box (with padding), return early
	if (Math.abs(xCoordinate - boundingBox.x - boundingBox.w / 2) > boundingBox.w / 2 + padding || 
	    Math.abs(yCoordinate - boundingBox.y - boundingBox.h / 2) > boundingBox.h / 2 + padding) {
		return false;
	}

	// If we are in the box (which we have to be to get here) and text background is on or the item is selected, return true.
	if (this.textBG() || isSelected) {
		return true;
	} else {
		var lineWidth = 0;
		for (var lineIndex = 0, totalLines = this.lines.length; lineIndex < totalLines; lineIndex++) {
			lineWidth = this.lines[lineIndex].width * currentScale;
			if (lineWidth > -1 &&
				xCoordinate >= boundingBox.x + (textAlignment == 'c' ? boundingBox.w / 2 - lineWidth / 2 : (textAlignment == 'r' ? boundingBox.w - lineWidth : 0)) &&
				xCoordinate <= boundingBox.x + (textAlignment == 'c' ? boundingBox.w / 2 + lineWidth / 2 : (textAlignment == 'r' ? boundingBox.w : lineWidth)) &&
				yCoordinate >= boundingBox.y + this.lines[lineIndex].top * currentScale &&
				yCoordinate <= boundingBox.y + (lineIndex + 1 < totalLines ? this.lines[lineIndex + 1].top : (this.lines[lineIndex].top + this.lines[lineIndex].size)) * currentScale
			) {
				return true;
			}
		}
	}

	return false;
};
