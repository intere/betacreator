# BetaCreator

A modern tool for creating rock climbing route guides and beta photos. This application allows climbers to draw routes, add holds, and create detailed beta photos for climbing routes.

## 🏔️ What is BetaCreator?

BetaCreator is a web-based drawing tool specifically designed for rock climbers. It allows you to:
- Draw routes on climbing photos
- Add holds, anchors, and other climbing-specific elements
- Create detailed beta photos for route guides
- Save and load your work
- Export images for sharing

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16.0.0 or higher)
- **Git**
- **Make** (usually pre-installed on macOS/Linux)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd betacreator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the legacy build system (required for the application to work):**
   ```bash
   # Navigate to the js directory
   cd js
   
   # Checkout Google Closure Library (requires Subversion)
   svn checkout http://closure-library.googlecode.com/svn/trunk/ closure
   
   # Return to project root
   cd ..
   ```

4. **Build the application:**
   ```bash
   # Build JavaScript and CSS
   make js
   make css
   
   # Or build both at once
   make dev
   ```

5. **Open the demo:**
   ```bash
   # Open demo.html in your browser
   open demo.html
   ```

## 🛠️ Development

### Project Structure

```
betacreator/
├── js/betacreator/          # Main application code
│   ├── Client.js            # Main entry point
│   ├── controllers/         # Application controllers
│   ├── gui/                 # User interface components
│   ├── models/              # Data models
│   ├── modes/               # Drawing modes
│   ├── render/              # Rendering utilities
│   ├── util/                # Utility functions
│   └── views/               # View components
├── css/                     # Stylesheets (LESS)
├── test/                    # Unit tests
├── tools/                   # Build tools
└── demo.html               # Demo application
```

### Available Scripts

```bash
# Testing
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Building
npm run build              # Build JavaScript (make js)
npm run build:css          # Build CSS (make css)
npm run dev                # Build both JS and CSS

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Run ESLint with auto-fix
```

### Development Workflow

1. **Start development:**
   ```bash
   # Build the application
   npm run dev
   
   # Open demo.html in your browser
   open demo.html
   ```

2. **Run tests:**
   ```bash
   # Run tests once
   npm test
   
   # Run tests in watch mode (recommended for development)
   npm run test:watch
   ```

3. **Check code quality:**
   ```bash
   npm run lint
   ```

### Making Changes

1. **Edit source files** in `js/betacreator/`
2. **Run tests** to ensure your changes work: `npm test`
3. **Build the application**: `npm run dev`
4. **Test in browser** by refreshing `demo.html`

## 🧪 Testing

The project uses Jest for unit testing. Tests are located in the `test/` directory and mirror the structure of the source code.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

- Test files should be named `*.test.js`
- Place test files in the `test/` directory, mirroring the source structure
- Use descriptive test names and group related tests with `describe()`
- Mock browser APIs and Google Closure Library functions as needed

## 🏗️ Build System

This project uses a hybrid build system:

### Modern Tools (Recommended)
- **Jest** for testing
- **ESLint** for code linting
- **Babel** for JavaScript transpilation
- **npm scripts** for task automation

### Legacy Tools (Required for Application)
- **Google Closure Library** for dependency management
- **Google Closure Compiler** for JavaScript optimization
- **LESS** for CSS preprocessing
- **Make** for build orchestration

### Build Commands

```bash
# Modern build (for development)
npm run dev

# Legacy build (for production)
make js      # Build JavaScript
make css     # Build CSS
make deps    # Generate dependencies
make clean   # Clean all build artifacts
```

## 🐛 Troubleshooting

### Common Issues

1. **"goog is not defined" error:**
   - Ensure you've checked out the Google Closure Library: `svn checkout http://closure-library.googlecode.com/svn/trunk/ closure` in the `js/` directory

2. **Build failures:**
   - Clean and rebuild: `make clean && make dev`
   - Check that all dependencies are installed: `npm install`

3. **Tests failing:**
   - Clear Jest cache: `npx jest --clearCache`
   - Check that mocks are properly set up in `test/setup.js`

4. **Demo not working:**
   - Ensure you've built the application: `npm run dev`
   - Check browser console for errors
   - Verify that `js/bin/betacreator.js` exists

### Getting Help

- Check the browser console for JavaScript errors
- Run tests to identify issues: `npm test`
- Review the build output for compilation errors
- Check that all prerequisites are installed correctly

## 📚 API Reference

### Main Application

The main application is initialized using the `BetaCreator` function:

```javascript
BetaCreator(element, callback, options)
```

- `element`: DOM element to attach the application to
- `callback`: Function called when initialization is complete
- `options`: Configuration object

### Key Methods

- `getData()`: Export current drawing data
- `loadData(data)`: Load drawing data
- `getImage(includeSource, format, size)`: Export as image

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Build the application: `npm run dev`
7. Commit your changes: `git commit -am 'Add feature'`
8. Push to the branch: `git push origin feature-name`
9. Submit a pull request

## 📄 License

Apache-2.0 License - see LICENSE file for details.

## 🙏 Acknowledgments

- Original development by Alma Madsen
- Modernized with comprehensive testing and build tools
- Built on Google Closure Library for robust JavaScript development
