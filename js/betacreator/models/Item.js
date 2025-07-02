/**
 * BetaCreator - Core Climbing Element Interface
 * 
 * Defines the base interface for all climbing elements that can be drawn on routes.
 * This includes route lines, protection anchors, belay stations, and text annotations.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */

goog.provide('bc.model.Item');
goog.provide('bc.model.ItemTypes');

/**
 * Base interface for all climbing elements that can be placed on a route.
 * All climbing elements (lines, anchors, belays, text) must implement this interface.
 * 
 * @interface
 */
bc.model.Item = function() {};

/**
 * Serialize the climbing element's properties to a format suitable for saving/loading.
 * This method should return an object containing all the element's configurable properties.
 * 
 * @return {Object} Serialized properties of the climbing element
 */
bc.model.Item.prototype.serializeParams = function() {};

/**
 * Set the offset position for the climbing element.
 * Used when moving elements around the canvas.
 * 
 * @param {goog.math.Coordinate} offsetPosition - The offset coordinates to apply
 */
bc.model.Item.prototype.setOffset = function(offsetPosition) {};

/**
 * Enumeration of all available climbing element types.
 * These represent the different types of elements that can be drawn on a climbing route.
 * 
 * @enum {number}
 */
bc.model.ItemTypes = {
	LINE: 0,    // Route line showing the path of the climb
	ANCHOR: 1,  // Protection anchor (bolts, trad gear placements)
	PITON: 2,   // Piton placement (traditional protection)
	RAPPEL: 3,  // Rappel station or anchor
	BELAY: 4,   // Belay station or stance
	TEXT: 5     // Text annotation or route description
};
