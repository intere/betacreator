/**
 * BetaCreator - Base Interaction Mode
 * 
 * Base class for all interaction modes in the climbing route editor.
 * Modes define how the application responds to user input (mouse, keyboard).
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.Mode');

//goog.require('bc.model.Canvas');

/**
 * Base class for all interaction modes in the climbing route editor.
 * Modes define how the application responds to user input events.
 * Different modes handle different types of interactions:
 * - Select: Choose and edit existing climbing elements
 * - Line: Draw climbing route lines
 * - Stamp: Place protection anchors and gear
 * - Text: Add text annotations
 * - LineEdit: Edit existing route lines
 * 
 * @param {bc.controller.Canvas} canvasController - The canvas controller for this mode
 * @param {bc.Client.drawingModes} modeId - The unique identifier for this mode
 * @constructor
 */
bc.Mode = function(canvasController, modeId) {
	this.canvas = canvasController;
	this.id = modeId;
};

/**
 * Handle mouse down events.
 * Called when the user presses a mouse button.
 * 
 * @param {Event} mouseEvent - The mouse event object
 * @param {goog.math.Coordinate} canvasPoint - The mouse position in canvas coordinates
 */
bc.Mode.prototype.mouseDown = function(mouseEvent, canvasPoint) {};

/**
 * Handle mouse move events.
 * Called when the user moves the mouse while a button is pressed.
 * 
 * @param {Event} mouseEvent - The mouse event object
 * @param {goog.math.Coordinate} canvasPoint - The mouse position in canvas coordinates
 */
bc.Mode.prototype.mouseMove = function(mouseEvent, canvasPoint) {};

/**
 * Handle mouse up events.
 * Called when the user releases a mouse button.
 * 
 * @param {Event} mouseEvent - The mouse event object
 * @param {goog.math.Coordinate} canvasPoint - The mouse position in canvas coordinates
 */
bc.Mode.prototype.mouseUp = function(mouseEvent, canvasPoint) {};

/**
 * Handle double-click events.
 * Called when the user double-clicks on the canvas.
 * 
 * @param {Event} mouseEvent - The mouse event object
 * @param {goog.math.Coordinate} canvasPoint - The mouse position in canvas coordinates
 */
bc.Mode.prototype.dblClick = function(mouseEvent, canvasPoint) {};

/**
 * Handle key down events.
 * Called when the user presses a key on the keyboard.
 * 
 * @param {Event} keyEvent - The keyboard event object
 * @return {boolean|undefined} True if the event was handled, false to allow default behavior
 */
bc.Mode.prototype.keyDown = function(keyEvent) {};

/**
 * Get the cursor style for this mode.
 * Different modes may show different cursors to indicate their function.
 * 
 * @return {string} CSS cursor style (e.g., 'default', 'crosshair', 'pointer')
 */
bc.Mode.prototype.getCursor = function() {
	return 'default';
};
