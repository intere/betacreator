/**
 * BetaCreator - Rock Climbing Route Drawing Application
 * 
 * This application allows climbers to create detailed route beta by drawing lines,
 * placing protection anchors, belay stations, and other climbing elements on photos.
 * 
 * Copyright 2012 Alma Madsen
 * Licensed under the Apache License, Version 2.0
 */
goog.provide('bc.Client');

//goog.require('bc.view.Line');
//goog.require('bc.view.stamp.Anchor');
goog.require('bc.GUI');
goog.require('bc.properties');
goog.require('bc.controller.Canvas');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.string');
goog.require('goog.pubsub.PubSub');

/**
 * Main client class for the BetaCreator application.
 * Handles initialization, data loading/saving, and coordinates between GUI and canvas.
 * 
 * @param {Image} sourceImage - The climbing photo to draw routes on
 * @param {?Function=} onReadyCallback - Callback function when initialization is complete
 * @param {Object=} configuration - Configuration options for the application
 * @constructor
 */
bc.Client = function(sourceImage, onReadyCallback, configuration) {
	configuration = configuration || {};
	
	// Application configuration with sensible defaults
	this.configuration = {
		width: configuration['width'] || null, // null for auto-sizing
		height: configuration['height'] || null, // null for auto-sizing
		zoomMode: configuration['zoom'] || 'contain', // 'contain', 'fill', or 'none'
		parentContainer: configuration['parent'] || null, // null to replace source image
		onChangeCallback: configuration['onChange'] || null, // Called when route data changes
		scaleFactor: configuration['scaleFactor'] || 1 // Global scaling factor for all elements
	};

	// Default properties applied to new climbing elements
	this.defaultElementProperties = {};
	this.defaultElementProperties[bc.properties.ITEM_SCALE] = this.configuration.scaleFactor;

	// GUI configuration passed to the interface
	this.guiConfiguration = {
		scaleFactor: this.configuration.scaleFactor
	};
	
	// Minimum width to ensure usability
	this.minimumWidth = 556;

	// Store reference to the source climbing photo
	this.sourceImage = sourceImage;

	// Track initialization state
	this.isInitialized = false;

	/**
	 * Callbacks to execute after initialization is complete
	 * @type {Array.<Function>}
	 */
	this.postInitializationCallbacks = [];

	if (onReadyCallback) {
		this.postInitializationCallbacks.push(onReadyCallback);
	}
	
	// Load the climbing photo and initialize when ready
	var imageElement = goog.dom.createElement('img');
	this.imageLoadEventHandle = goog.events.listen(imageElement, goog.events.EventType.LOAD, function() {
		this.initializeApplication(imageElement);
	}, false, this);

	imageElement.src = this.sourceImage.src;

	// Set up change notification if callback provided
	if (this.configuration.onChangeCallback) {
		bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.ACTION_PERFORMED, function() {
			this.configuration.onChangeCallback();
		}, this);
	}
};

/**
 * Initialize the application after the climbing photo has loaded.
 * Sets up the canvas controller, GUI, and viewport dimensions.
 * 
 * @param {Image} loadedImage - The fully loaded climbing photo
 * @private
 */
bc.Client.prototype.initializeApplication = function(loadedImage) {
	goog.events.unlistenByKey(this.imageLoadEventHandle);
	
	// Create the main canvas controller for drawing climbing elements
	this.canvasController = new bc.controller.Canvas(this, loadedImage, this.defaultElementProperties);
	
	// Create the graphical user interface
	this.gui = new bc.GUI(this, this.guiConfiguration);

	// Calculate viewport dimensions
	this.viewportWidth = this.configuration.width || loadedImage.width;
	this.viewportHeight = this.configuration.height || loadedImage.height;

	// Ensure minimum width for usability
	if (goog.isNumber(this.viewportWidth) && this.viewportWidth < this.minimumWidth) {
		this.viewportWidth = this.minimumWidth;
	}

	// Height of the option bar (toolbar)
	var optionBarHeight = 29;
	
	// Configure the GUI wrapper styling
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': goog.isNumber(this.viewportWidth) ? (this.viewportWidth + 'px') : this.viewportWidth,
		'height': goog.isNumber(this.viewportHeight) ? ((this.viewportHeight + optionBarHeight) + 'px') : this.viewportHeight
	});

	// Insert the application into the DOM
	if (this.configuration.parentContainer) {
		goog.dom.appendChild(this.configuration.parentContainer, this.gui.wrapper);
	} else {
		goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);
	}

	// Calculate actual dimensions if auto-sizing was used
	if (!goog.isNumber(this.viewportWidth)) {
		this.viewportWidth = goog.style.getBorderBoxSize(this.gui.wrapper).width - 2;
	}
	if (!goog.isNumber(this.viewportHeight)) {
		this.viewportHeight = goog.style.getBorderBoxSize(this.gui.wrapper).height - optionBarHeight - 2;
	}

	// Initialize the GUI
	this.gui.init();

	// Set up the canvas zoom and center the view
	this.canvasController.setZoom(this.configuration.zoomMode);
	this.canvasController.view.centerInViewport();

	// Mark as initialized and execute callbacks
	this.isInitialized = true;
	goog.array.forEach(this.postInitializationCallbacks, function(callback) {
		callback();
	});
	this.postInitializationCallbacks = [];
};

/**
 * Load climbing route data into the application.
 * Creates climbing elements (lines, anchors, belays, etc.) from serialized data.
 * 
 * @param {Object} routeData - Serialized climbing route data
 * @private
 */
bc.Client.prototype.loadRouteData = function(routeData) {
	var self = this;

	// Clear existing climbing elements
	this.canvasController.model.removeAllItems();

	// Create climbing elements from the data
	goog.array.forEach(routeData['items'] || [], function(elementData) {
		var climbingElement = null;
		
		// Create the appropriate climbing element based on type
		switch(elementData[bc.properties.ITEM_TYPE]) {
			case bc.model.ItemTypes.ANCHOR:
				climbingElement = new bc.model.stamp.Anchor(
					bc.model.Stamp.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			case bc.model.ItemTypes.PITON:
				climbingElement = new bc.model.stamp.Piton(
					bc.model.Stamp.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			case bc.model.ItemTypes.RAPPEL:
				climbingElement = new bc.model.stamp.Rappel(
					bc.model.Stamp.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			case bc.model.ItemTypes.BELAY:
				climbingElement = new bc.model.stamp.Belay(
					bc.model.Stamp.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			case bc.model.ItemTypes.LINE:
				climbingElement = new bc.model.Line(
					bc.model.Line.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			case bc.model.ItemTypes.TEXT:
				climbingElement = new bc.model.Text(
					bc.model.Text.parseParams(elementData), 
					self.canvasController.model.properties
				);
				break;
			default:
				// Unknown element type - skip it
				break;
		}

		// Add the climbing element to the canvas if successfully created
		if (climbingElement) {
			self.canvasController.model.addItem(climbingElement);
		}
	});

	// Trigger a canvas render to display the loaded elements
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * Serialize the current climbing route data for saving or transmission.
 * 
 * @param {boolean=} escapeForHTML - Whether to escape the output for HTML embedding
 * @return {string} JSON string containing all climbing elements
 * @private
 */
bc.Client.prototype.serializeRouteData = function(escapeForHTML) {
	var climbingElements = [];

	// Collect serialized data from all climbing elements
	this.canvasController.model.eachItem(function(climbingElement) {
		climbingElements.push(climbingElement.serializeParams());
	});

	// Create the route data object
	var routeData = {
		'items': climbingElements
	};

	// Return escaped or raw JSON as requested
	if (escapeForHTML) {
		return goog.string.stripQuotes(goog.string.quote(goog.json.serialize(routeData)), '"');
	} else {
		return goog.json.serialize(routeData);
	}
};

/**
 * Generate an image of the current climbing route overlay.
 * 
 * @param {boolean=} includeSourceImage - Whether to include the original climbing photo
 * @param {string=} imageFormat - Output format ('png', 'jpeg', etc.)
 * @param {?number=} outputWidth - Width of output image (null for original size)
 * @param {Image=} customSourceImage - Alternative source image to use
 * @return {string} Data URL of the generated image
 * @private
 */
bc.Client.prototype.generateRouteImage = function(includeSourceImage, imageFormat, outputWidth, customSourceImage) {
	return this.canvasController.getImage(includeSourceImage, imageFormat, outputWidth, customSourceImage);
};

/**
 * Factory function to create and configure a BetaCreator instance.
 * This is the main entry point for the application.
 * 
 * @param {Image} sourceImage - The climbing photo to draw routes on
 * @param {?Function=} onReadyCallback - Callback when initialization is complete
 * @param {Object=} configuration - Configuration options
 * @return {Object} Public API object with methods to interact with the application
 */
bc.Client.go = function(sourceImage, onReadyCallback, configuration) {
	var publicAPI,
		clientInstance = new bc.Client(
			sourceImage, 
			onReadyCallback ? function() { onReadyCallback.call(publicAPI); } : null, 
			configuration
		),
		errorHandler = configuration['onError'] || function(error) { alert(error); };

	// Create the public API object
	publicAPI = {
		/**
		 * Load climbing route data from JSON string
		 * @param {string} routeDataJson - JSON string containing route data
		 */
		'loadData': function(routeDataJson) {
			try {
				var parsedData = goog.json.parse(routeDataJson);
				if (!clientInstance.isInitialized) {
					clientInstance.postInitializationCallbacks.push(function() {
						clientInstance.loadRouteData(parsedData);
					});
				} else {
					clientInstance.loadRouteData(parsedData);
				}
			} catch(parseError) {
				errorHandler(bc.i18n("Invalid route data format."));
			}
		},
		
		/**
		 * Get current climbing route data as JSON string
		 * @param {boolean=} escapeForHTML - Whether to escape for HTML embedding
		 * @return {string} JSON string of current route data
		 */
		'getData': function(escapeForHTML) {
			try {
				return clientInstance.serializeRouteData(escapeForHTML);
			} catch(error) {
				errorHandler(bc.i18n("Application not yet initialized. Please call this method in the onReady callback."));
			}
		},
		
		/**
		 * Generate an image of the current route overlay
		 * @param {boolean=} includeSourceImage - Include original climbing photo
		 * @param {string=} imageFormat - Output format ('png', 'jpeg')
		 * @param {number=} outputWidth - Width of output image
		 * @param {Image=} customSourceImage - Alternative source image
		 * @return {string} Data URL of generated image
		 */
		'getImage': function(includeSourceImage, imageFormat, outputWidth, customSourceImage) {
			try {
				return clientInstance.generateRouteImage(
					includeSourceImage, 
					imageFormat, 
					parseInt(outputWidth, 10) || null, 
					customSourceImage
				);
			} catch(error) {
				errorHandler(bc.i18n("Application not yet initialized. Please call this method in the onReady callback."));
			}
		}
	};

	return publicAPI;
};

/**
 * Global publish/subscribe system for application-wide communication
 * @type {goog.pubsub.PubSub}
 */
bc.Client.pubsub = new goog.pubsub.PubSub();

/**
 * Application-wide event topics for pub/sub communication
 * @enum {string}
 */
bc.Client.pubsubTopics = {
	CANVAS_RENDER: 'canvas_render',           // Trigger canvas redraw
	SELECTION_CHANGE: 'selection_change',     // Selection state changed
	SHOW_COLOR_PICKER: 'show_color_picker',   // Show color picker dialog
	SHOW_TEXT_AREA: 'show_text_area',         // Show text input dialog
	HIDE_OVERLAYS: 'hide_overlays',           // Hide all overlay dialogs
	MODE_CHANGE: 'mode_change',               // Drawing mode changed
	ACTION_PERFORMED: 'action_performed'      // Undo/redo action performed
};

/**
 * Available drawing modes for creating climbing elements
 * @enum {number}
 */
bc.Client.drawingModes = {
	SELECT: 0,      // Select and edit existing elements
	LINE: 1,        // Draw climbing route lines
	STAMP: 2,       // Place protection anchors and gear
	TEXT: 3,        // Add text annotations
	LINE_EDIT: 4    // Edit existing route lines
};

// Export the main function for global access
goog.exportSymbol('BetaCreator', bc.Client.go);
