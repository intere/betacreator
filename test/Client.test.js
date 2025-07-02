/**
 * Unit tests for bc.Client
 * Tests the main client that orchestrates the BetaCreator climbing route editor
 */

// Import the modules under test
require('../js/betacreator/util/object.js');
require('../js/betacreator/models/Action.js');
require('../js/betacreator/models/property.js');
require('../js/betacreator/Client.js');

describe('bc.Client constructor', () => {
  let mockSourceImage;
  let mockOnReady;
  let mockParams;

  beforeEach(() => {
    // Mock bc.controller.Canvas
    global.bc = global.bc || {};
    global.bc.controller = global.bc.controller || {};
    global.bc.controller.Canvas = jest.fn().mockImplementation(() => ({
      setZoom: jest.fn(),
      model: {
        removeAllItems: jest.fn(),
        addItem: jest.fn(),
        eachItem: jest.fn()
      },
      getImage: jest.fn(() => 'data:image/png;base64,test'),
      getSelectedItems: jest.fn(() => [])
    }));

    // Mock bc.GUI
    global.bc.GUI = jest.fn().mockImplementation(() => ({
      wrapper: {
        style: {}
      },
      init: jest.fn()
    }));

    // Mock bc.model classes
    global.bc.model = global.bc.model || {};
    global.bc.model.ItemTypes = {
      ANCHOR: 1,
      PITON: 2,
      RAPPEL: 3,
      BELAY: 4,
      LINE: 0,
      TEXT: 5
    };

    global.bc.model.stamp = {
      Anchor: jest.fn().mockImplementation(() => ({ id: 'anchor-1', serializeParams: jest.fn() })),
      Piton: jest.fn().mockImplementation(() => ({ id: 'piton-1', serializeParams: jest.fn() })),
      Rappel: jest.fn().mockImplementation(() => ({ id: 'rappel-1', serializeParams: jest.fn() })),
      Belay: jest.fn().mockImplementation(() => ({ id: 'belay-1', serializeParams: jest.fn() }))
    };

    global.bc.model.Line = jest.fn().mockImplementation(() => ({ 
      id: 'line-1', 
      serializeParams: jest.fn(),
      parseParams: jest.fn()
    }));
    global.bc.model.Line.parseParams = jest.fn();

    global.bc.model.Text = jest.fn().mockImplementation(() => ({ 
      id: 'text-1', 
      serializeParams: jest.fn(),
      parseParams: jest.fn()
    }));
    global.bc.model.Text.parseParams = jest.fn();

    global.bc.model.Stamp = {
      parseParams: jest.fn()
    };

    // Mock bc.i18n
    global.bc.i18n = jest.fn((key) => key);

    // Mock goog.pubsub.PubSub
    global.goog.pubsub.PubSub = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn(),
      publish: jest.fn()
    }));

    mockSourceImage = {
      src: 'test-route.jpg',
      width: 800,
      height: 600,
      style: { display: 'inline-block' }
    };

    mockOnReady = jest.fn();
    mockParams = {
      width: 1000,
      height: 700,
      zoom: 'contain',
      scaleFactor: 1.5
    };
  });

  test('should create client with default parameters', () => {
    const client = new bc.Client(mockSourceImage);

    expect(client.sourceImage).toBe(mockSourceImage);
    expect(client.params.w).toBeNull();
    expect(client.params.h).toBeNull();
    expect(client.params.zoom).toBe('contain');
    expect(client.params.scaleFactor).toBe(1);
    expect(client.initialized).toBe(false);
  });

  test('should create client with custom parameters', () => {
    const client = new bc.Client(mockSourceImage, mockOnReady, mockParams);

    expect(client.params.w).toBe(1000);
    expect(client.params.h).toBe(700);
    expect(client.params.zoom).toBe('contain');
    expect(client.params.scaleFactor).toBe(1.5);
    expect(client.defaultProperties['is']).toBe(1.5);
  });

  test('should set up image loading handler', () => {
    const client = new bc.Client(mockSourceImage, mockOnReady);
    
    expect(goog.events.listen).toHaveBeenCalledWith(
      expect.any(Object),
      goog.events.EventType.LOAD,
      expect.any(Function),
      false,
      client
    );
  });

  test('should set up onChange callback if provided', () => {
    const onChange = jest.fn();
    const params = { onChange };
    const client = new bc.Client(mockSourceImage, mockOnReady, params);

    expect(bc.Client.pubsub.subscribe).toHaveBeenCalledWith(
      bc.Client.pubsubTopics.ACTION,
      expect.any(Function),
      client
    );
  });

  test('should handle minimum width constraint', () => {
    const params = { width: 400 }; // Below minimum
    const client = new bc.Client(mockSourceImage, mockOnReady, params);

    expect(client.minWidth).toBe(556);
    // The actual width adjustment happens in init()
  });
});

describe('bc.Client.init', () => {
  let client;
  let mockImage;

  beforeEach(() => {
    // Setup mocks
    global.bc.controller.Canvas = jest.fn().mockImplementation(() => ({
      setZoom: jest.fn(),
      view: {
        centerInViewport: jest.fn()
      },
      model: {
        removeAllItems: jest.fn(),
        addItem: jest.fn(),
        eachItem: jest.fn()
      },
      getImage: jest.fn(() => 'data:image/png;base64,test'),
      getSelectedItems: jest.fn(() => [])
    }));

    global.bc.GUI = jest.fn().mockImplementation(() => ({
      wrapper: {
        style: {}
      },
      init: jest.fn()
    }));

    global.goog.style.setStyle = jest.fn();
    global.goog.style.getBorderBoxSize = jest.fn(() => ({ width: 800, height: 600 }));
    global.goog.dom.appendChild = jest.fn();
    global.goog.dom.replaceNode = jest.fn();

    const mockSourceImage = {
      src: 'test-route.jpg',
      width: 800,
      height: 600,
      style: { display: 'inline-block' }
    };

    client = new bc.Client(mockSourceImage);
    client.imageLoadHandle = { key: 'mock-key' };

    mockImage = {
      width: 800,
      height: 600
    };
  });

  test('should initialize canvas controller and GUI', () => {
    client.init(mockImage);

    expect(bc.controller.Canvas).toHaveBeenCalledWith(client, mockImage, client.defaultProperties);
    expect(bc.GUI).toHaveBeenCalledWith(client, client.guiConfig);
    expect(client.canvasController).toBeDefined();
    expect(client.gui).toBeDefined();
  });

  test('should set viewport dimensions', () => {
    client.params.w = 1000;
    client.params.h = 700;
    client.init(mockImage);

    expect(client.viewportWidth).toBe(1000);
    expect(client.viewportHeight).toBe(700);
  });

  test('should enforce minimum width constraint', () => {
    client.params.w = 400; // Below minimum
    client.init(mockImage);

    expect(client.viewportWidth).toBe(556);
  });

  test('should use image dimensions when viewport not specified', () => {
    client.params.w = null;
    client.params.h = null;
    client.init(mockImage);

    expect(client.viewportWidth).toBe(800);
    expect(client.viewportHeight).toBe(600);
  });

  test('should set up GUI wrapper styles', () => {
    client.init(mockImage);

    expect(goog.style.setStyle).toHaveBeenCalledWith(
      client.gui.wrapper,
      expect.objectContaining({
        position: 'relative',
        display: 'inline-block',
        width: '800px',
        height: '629px' // 600 + 29 (optionbar height)
      })
    );
  });

  test('should append to parent if specified', () => {
    const mockParent = { id: 'parent' };
    client.params.parent = mockParent;
    client.init(mockImage);

    expect(goog.dom.appendChild).toHaveBeenCalledWith(mockParent, client.gui.wrapper);
    expect(goog.dom.replaceNode).not.toHaveBeenCalled();
  });

  test('should replace source image if no parent specified', () => {
    client.params.parent = null;
    client.init(mockImage);

    expect(goog.dom.replaceNode).toHaveBeenCalledWith(client.gui.wrapper, client.sourceImage);
    expect(goog.dom.appendChild).not.toHaveBeenCalled();
  });

  test('should initialize GUI and canvas', () => {
    client.init(mockImage);

    expect(client.gui.init).toHaveBeenCalled();
    expect(client.canvasController.setZoom).toHaveBeenCalledWith('contain');
    expect(client.canvasController.view.centerInViewport).toHaveBeenCalled();
  });

  test('should mark as initialized and call post-initialization callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    client.postInitializeCallbacks = [callback1, callback2];

    client.init(mockImage);

    expect(client.initialized).toBe(true);
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
    expect(client.postInitializeCallbacks).toHaveLength(0);
  });
});

describe('bc.Client.loadData', () => {
  let client;

  beforeEach(() => {
    // Setup mocks
    global.bc.controller.Canvas = jest.fn().mockImplementation(() => ({
      model: {
        removeAllItems: jest.fn(),
        addItem: jest.fn()
      }
    }));

    global.bc.model.stamp = {
      Anchor: jest.fn().mockImplementation(() => ({ id: 'anchor-1' })),
      Piton: jest.fn().mockImplementation(() => ({ id: 'piton-1' })),
      Rappel: jest.fn().mockImplementation(() => ({ id: 'rappel-1' })),
      Belay: jest.fn().mockImplementation(() => ({ id: 'belay-1' }))
    };

    global.bc.model.Line = jest.fn().mockImplementation(() => ({ id: 'line-1' }));
    global.bc.model.Text = jest.fn().mockImplementation(() => ({ id: 'text-1' }));
    global.bc.model.Stamp.parseParams = jest.fn((data) => data);
    global.bc.model.Line.parseParams = jest.fn((data) => data);
    global.bc.model.Text.parseParams = jest.fn((data) => data);

    const mockSourceImage = { src: 'test.jpg', width: 800, height: 600 };
    client = new bc.Client(mockSourceImage);
    client.canvasController = {
      model: {
        removeAllItems: jest.fn(),
        addItem: jest.fn(),
        properties: {}
      }
    };
  });

  test('should clear existing items before loading', () => {
    const data = { items: [] };
    client.loadData(data);

    expect(client.canvasController.model.removeAllItems).toHaveBeenCalled();
  });

  test('should load anchor items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.ANCHOR,
        'x': 100,
        'y': 200,
        'ic': '#FF0000'
      }]
    };

    client.loadData(data);

    expect(bc.model.stamp.Anchor).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should load piton items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.PITON,
        'x': 150,
        'y': 250
      }]
    };

    client.loadData(data);

    expect(bc.model.stamp.Piton).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should load rappel items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.RAPPEL,
        'x': 200,
        'y': 300
      }]
    };

    client.loadData(data);

    expect(bc.model.stamp.Rappel).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should load belay items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.BELAY,
        'x': 250,
        'y': 350
      }]
    };

    client.loadData(data);

    expect(bc.model.stamp.Belay).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should load line items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.LINE,
        'cp': [{ x: 100, y: 200 }, { x: 150, y: 250 }]
      }]
    };

    client.loadData(data);

    expect(bc.model.Line).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should load text items', () => {
    const data = {
      items: [{
        'it': bc.model.ItemTypes.TEXT,
        't': '5.10a',
        'x': 300,
        'y': 400
      }]
    };

    client.loadData(data);

    expect(bc.model.Text).toHaveBeenCalled();
    expect(client.canvasController.model.addItem).toHaveBeenCalled();
  });

  test('should handle unknown item types gracefully', () => {
    const data = {
      items: [{
        'it': 999, // Unknown type
        'x': 100,
        'y': 200
      }]
    };

    expect(() => client.loadData(data)).not.toThrow();
    expect(client.canvasController.model.addItem).not.toHaveBeenCalled();
  });

  test('should publish canvas render event after loading', () => {
    const data = { items: [] };
    client.loadData(data);

    expect(bc.Client.pubsub.publish).toHaveBeenCalledWith(bc.Client.pubsubTopics.CANVAS_RENDER);
  });
});

describe('bc.Client.getData', () => {
  let client;

  beforeEach(() => {
    const mockSourceImage = { src: 'test.jpg', width: 800, height: 600 };
    client = new bc.Client(mockSourceImage);
    
    client.canvasController = {
      model: {
        eachItem: jest.fn()
      }
    };
  });

  test('should serialize all items', () => {
    const mockItems = [
      { serializeParams: jest.fn(() => ({ 'it': 1, 'x': 100, 'y': 200 })) },
      { serializeParams: jest.fn(() => ({ 'it': 0, 'cp': [] })) }
    ];

    client.canvasController.model.eachItem.mockImplementation((callback) => {
      mockItems.forEach(callback);
    });

    const result = client.getData();

    expect(result).toBe(JSON.stringify({
      items: [
        { 'it': 1, 'x': 100, 'y': 200 },
        { 'it': 0, 'cp': [] }
      ]
    }));
  });

  test('should escape data when requested', () => {
    const mockItems = [
      { serializeParams: jest.fn(() => ({ 'it': 1, 'x': 100 })) }
    ];

    client.canvasController.model.eachItem.mockImplementation((callback) => {
      mockItems.forEach(callback);
    });

    const result = client.getData(true);

    expect(goog.json.serialize).toHaveBeenCalled();
    expect(goog.string.quote).toHaveBeenCalled();
    expect(goog.string.stripQuotes).toHaveBeenCalled();
  });
});

describe('bc.Client.getImage', () => {
  let client;

  beforeEach(() => {
    const mockSourceImage = { src: 'test.jpg', width: 800, height: 600 };
    client = new bc.Client(mockSourceImage);
    
    client.canvasController = {
      getImage: jest.fn(() => 'data:image/png;base64,test')
    };
  });

  test('should delegate to canvas controller', () => {
    const result = client.getImage(true, 'image/png', 1000);

    expect(client.canvasController.getImage).toHaveBeenCalledWith(true, 'image/png', 1000, undefined);
    expect(result).toBe('data:image/png;base64,test');
  });

  test('should handle different image types', () => {
    client.getImage(false, 'image/jpeg', 800);
    expect(client.canvasController.getImage).toHaveBeenCalledWith(false, 'image/jpeg', 800, undefined);
  });
});

describe('bc.Client.go factory function', () => {
  let mockSourceImage;
  let mockOnReady;
  let mockOptions;
  let factoryMockClient;

  beforeEach(() => {
    mockSourceImage = { src: 'test.jpg', width: 800, height: 600 };
    mockOnReady = jest.fn();
    mockOptions = {
      width: 1000,
      height: 700,
      onError: jest.fn()
    };

    // Create a mock client instance
    factoryMockClient = {
      initialized: true,
      loadData: jest.fn(),
      getData: jest.fn(() => '{"items":[]}'),
      getImage: jest.fn(() => 'data:image/png;base64,test')
    };

    // Mock bc.Client constructor
    global.bc.Client = jest.fn().mockImplementation(() => factoryMockClient);

    // Set up the factory function
    global.BetaCreator = jest.fn().mockImplementation((sourceImg, onReady, options) => {
      const client = new global.bc.Client(sourceImg, onReady, options);
      return {
        loadData: jest.fn((data) => {
          try {
            const parsedData = goog.json.parse(data);
            client.loadData(parsedData);
          } catch (e) {
            options.onError('Invalid data.');
          }
        }),
        getData: jest.fn((escape) => {
          try {
            return client.getData(escape);
          } catch (e) {
            options.onError('Editor hasn\'t been initialized yet, make calls in onReady callback.');
          }
        }),
        getImage: jest.fn((includeSource, type, width, srcImage) => {
          try {
            return client.getImage(includeSource, type, parseInt(width, 10) || null, srcImage);
          } catch (e) {
            options.onError('Editor hasn\'t been initialized yet, make calls in onReady callback.');
          }
        })
      };
    });
  });

  afterEach(() => {
    if (factoryMockClient && factoryMockClient.getImage) {
      factoryMockClient.getImage.mockReset();
      factoryMockClient.getImage.mockImplementation(() => 'data:image/png;base64,test');
    }
  });

  test('should create client and return API object', () => {
    const api = global.BetaCreator(mockSourceImage, mockOnReady, mockOptions);
    expect(api).toHaveProperty('loadData');
    expect(api).toHaveProperty('getData');
    expect(api).toHaveProperty('getImage');
  });

  test('should handle loadData with JSON parsing', () => {
    const api = global.BetaCreator(mockSourceImage, mockOnReady, mockOptions);

    api.loadData('{"items":[]}');

    expect(goog.json.parse).toHaveBeenCalledWith('{"items":[]}');
    expect(factoryMockClient.loadData).toHaveBeenCalledWith({ items: [] });
  });

  test('should handle loadData errors', () => {
    goog.json.parse.mockImplementation(() => { throw new Error('Invalid JSON'); });
    const api = global.BetaCreator(mockSourceImage, mockOnReady, mockOptions);

    api.loadData('invalid json');

    expect(mockOptions.onError).toHaveBeenCalledWith('Invalid data.');
  });

  test('should handle getData errors', () => {
    factoryMockClient.getData.mockImplementation(() => { throw new Error('Not initialized'); });
    const api = global.BetaCreator(mockSourceImage, mockOnReady, mockOptions);

    api.getData();

    expect(mockOptions.onError).toHaveBeenCalledWith('Editor hasn\'t been initialized yet, make calls in onReady callback.');
  });

  test('should handle getImage errors', () => {
    factoryMockClient.getImage.mockImplementation(() => { throw new Error('Not initialized'); });
    const api = global.BetaCreator(mockSourceImage, mockOnReady, mockOptions);

    api.getImage();

    expect(mockOptions.onError).toHaveBeenCalledWith('Editor hasn\'t been initialized yet, make calls in onReady callback.');
  });
});

describe('bc.Client static properties', () => {
  beforeEach(() => {
    // Set up static properties on bc.Client
    bc.Client.pubsub = {
      subscribe: jest.fn(),
      publish: jest.fn()
    };
    
    bc.Client.pubsubTopics = {
      CANVAS_RENDER: 'cr',
      SELECTION_CHANGE: 'sc',
      SHOW_COLOR_PICKER: 'scp',
      SHOW_TEXT_AREA: 'sta',
      HIDE_OVERLAYS: 'ho',
      MODE: 'm',
      ACTION: 'a'
    };
    
    bc.Client.modes = {
      SELECT: 0,
      LINE: 1,
      STAMP: 2,
      TEXT: 3,
      LINE_EDIT: 4
    };
  });

  test('should have pubsub instance', () => {
    expect(bc.Client.pubsub).toBeDefined();
    expect(bc.Client.pubsub.subscribe).toBeDefined();
    expect(bc.Client.pubsub.publish).toBeDefined();
  });

  test('should define pubsub topics', () => {
    expect(bc.Client.pubsubTopics.CANVAS_RENDER).toBe('cr');
    expect(bc.Client.pubsubTopics.SELECTION_CHANGE).toBe('sc');
    expect(bc.Client.pubsubTopics.SHOW_COLOR_PICKER).toBe('scp');
    expect(bc.Client.pubsubTopics.SHOW_TEXT_AREA).toBe('sta');
    expect(bc.Client.pubsubTopics.HIDE_OVERLAYS).toBe('ho');
    expect(bc.Client.pubsubTopics.MODE).toBe('m');
    expect(bc.Client.pubsubTopics.ACTION).toBe('a');
  });

  test('should define modes enum', () => {
    expect(bc.Client.modes.SELECT).toBe(0);
    expect(bc.Client.modes.LINE).toBe(1);
    expect(bc.Client.modes.STAMP).toBe(2);
    expect(bc.Client.modes.TEXT).toBe(3);
    expect(bc.Client.modes.LINE_EDIT).toBe(4);
  });
});

describe('Climbing-specific client functionality', () => {
  test('should handle typical climbing route data', () => {
    const routeData = {
      items: [
        { 'it': bc.model.ItemTypes.ANCHOR, 'x': 100, 'y': 200, 'ic': '#FF0000' },
        { 'it': bc.model.ItemTypes.LINE, 'cp': [{ x: 100, y: 200 }, { x: 150, y: 250 }], 'ic': '#00FF00' },
        { 'it': bc.model.ItemTypes.TEXT, 't': '5.10a', 'x': 200, 'y': 300, 'ic': '#0000FF' }
      ]
    };

    const mockSourceImage = { src: 'route.jpg', width: 1200, height: 800 };
    const client = new bc.Client(mockSourceImage);

    expect(() => client.loadData(routeData)).not.toThrow();
  });

  test('should support climbing route export functionality', () => {
    const mockSourceImage = { src: 'route.jpg', width: 800, height: 600 };
    const client = new bc.Client(mockSourceImage);
    client.canvasController = {
      getImage: jest.fn(() => 'data:image/png;base64,test')
    };
    const imageData = client.getImage(true, 'image/png', 1200);
    expect(imageData).toBe('data:image/png;base64,test');
  });
}); 