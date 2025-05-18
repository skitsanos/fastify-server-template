# Fastify Server Template

![Fastify](https://img.shields.io/badge/Fastify-v5.3.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

A modern, modular, and production-ready server template built with Fastify. This template provides a solid foundation for building high-performance web applications and APIs.

## 🚀 Features

- **High Performance**: Built on Fastify, one of the fastest web frameworks for Node.js
- **Modular Architecture**: Clean separation of concerns with a well-organized codebase
- **API Versioning**: Built-in support for API versioning with automatic route prefixing
- **Schema Validation**: JSON schema validation for requests and responses
- **API Documentation**: Auto-generated API documentation endpoints
- **Custom Logging**: Nginx-style HTTP access logs for better readability
- **Static Content**: Serve static files with ease
- **View Engine**: Handlebars template engine integration
- **Security**: Built-in security headers and configurations
- **CORS Support**: Cross-Origin Resource Sharing configuration
- **Error Handling**: Consistent error handling across the application

## 📋 Requirements

- Node.js (v18.0 or newer)
- npm or yarn

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/skitsanos/fastify-server-template.git
cd fastify-server-template

# Install dependencies
npm install
# or
yarn install
```

## 🚦 Quick Start

```bash
# Start the server
npm start
# or
yarn start
```

The server will start on port 8000 by default. You can change this by:

- Setting the `PORT` environment variable
- Using the `-p` or `--port` command line argument

```bash
# Start on a different port
npm start -- -p 3000
# or
PORT=3000 npm start
```

## 📁 Project Structure

```
.
├── src                     # Source code
│   ├── config              # Configuration files
│   ├── core                # Core application modules
│   ├── framework           # Framework components
│   │   ├── fastify         # Fastify-specific utilities
│   │   ├── plugins         # Custom plugins
│   │   ├── routing         # Route and schema loading
│   │   ├── utils           # Utility functions
│   │   └── viewEngines     # View engine integrations
│   ├── routes              # API routes and endpoints
│   │   └── api             # API endpoints (versioned)
│   │       ├── v1          # API version 1
│   │       └── v2          # API version 2
│   ├── schemas             # JSON schemas (versioned)
│   └── index.js            # Application entry point
├── ui                      # Static files and templates
│   └── partials            # Handlebars partials
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## ⚙️ Configuration

The application's configuration is stored in JSON files in the `src/config` directory:

- `server.json`: Main server configuration
- `cors.json`: CORS settings

### Server Configuration

The main server configuration is in `src/config/server.json`. Here are some key settings:

```json
{
  "host": "0.0.0.0",             // Server host
  "logging": {                   
    "request": true,             // Enable HTTP request logging
    "level": "info",             // Logging level
    "timeFormat": "DD/MMM/YYYY:HH:mm:ss ZZ" // Log timestamp format
  },
  "static": {                    
    "root": "ui"                 // Static files directory
  },
  "viewEngine": {                
    "engine": "handlebars",      // View engine
    "templatesDir": "ui",        // Templates directory
    "partialsDir": "ui/partials" // Partials directory
  },
  "api": {                       
    "documentation": true,       // Enable API documentation
    "versionIndex": true         // Enable version index endpoints
  }
}
```

## 🛣️ Routes

### Creating Routes

Routes are automatically loaded from the `src/routes` directory. Here's an example route:

```javascript
const Route = require(process.cwd() + '/src/framework/fastify/route');

class ExampleRoute extends Route {
    constructor(instance) {
        const config = {
            method: 'GET',             // HTTP method
            url: '/example',           // Route URL
            description: 'Example API', // Route description for docs
            schema: {                  // JSON Schema for validation
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            result: { type: 'string' }
                        }
                    }
                }
            }
        };
        super(instance, config);
    }

    async handler(req, res) {
        res.send({ result: 'It works!' });
    }
}

module.exports = ExampleRoute;
```

### API Versioning

For versioned APIs, create routes in the appropriate version directory:

```
src/routes/api/v1/users.js    # /v1/users endpoint
src/routes/api/v2/users.js    # /v2/users endpoint
```

The server will automatically prefix these routes with the version path.

### Route Documentation

API documentation is automatically generated and available at `/api/routes`.

## 📊 Logging

The application uses a custom HTTP logger that outputs logs in nginx-style format:

```
127.0.0.1 - - [18/May/2025:13:41:06 +0000] "GET /version HTTP/1.1" 200 2ms "http://localhost:8000/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

## 📄 Schemas

JSON schemas are loaded from the `src/schemas` directory. These schemas can be referenced in route definitions for validation.

Schemas can also be versioned similarly to routes:

```
src/schemas/api/v1/user.json   # v1 user schema
src/schemas/api/v2/user.json   # v2 user schema
```

## 📚 View Engine

The template uses Handlebars as the default view engine. Templates are stored in the `ui` directory, with partials in `ui/partials`.

## 🛡️ Security

The template includes several security headers by default:

- `X-Content-Type-Options: nosniff`
- `X-DNS-Prefetch-Control: off`
- `X-Frame-Options: DENY`

## 🧩 Extending

### Adding Plugins

To add a new Fastify plugin, update the `registerPlugins` function in `src/core/plugins.js`:

```javascript
const registerPlugins = async (fastify, config, meta) => {
    // Existing plugins...
    
    // Add your custom plugin
    await fastify.register(require('your-plugin'), options);
};
```

### Custom Middleware

To add custom middleware, use Fastify's hook system in your route classes:

```javascript
async beforeHandler(req, res) {
    // Custom middleware logic
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

