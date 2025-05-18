/**
 * @author skitsanos
 * Application bootstrap
 */

const {createServer} = require('./server');
const {registerPlugins} = require('./plugins');
const {setupErrorHandlers} = require('./errorHandlers');
const {setupSecurityHooks} = require('./security');
const {loadSchemasAndRoutes} = require('./loader');

/**
 * Bootstrap the application
 * @param {Object} meta - Application metadata
 * @param {Object} config - Server configuration
 * @param {number} port - Port to listen on
 * @returns {Promise<Object>} Fastify instance
 */
const bootstrap = async (meta, config, port) => {
    // Create Fastify instance
    const fastify = createServer(config);
    
    // Register plugins
    await registerPlugins(fastify, config, meta);
    
    // Setup error handlers
    await setupErrorHandlers(fastify);
    
    // Load schemas and routes with documentation and versioning
    loadSchemasAndRoutes(fastify, {
        documentation: config.api?.documentation !== false,
        schemasDocumentationPath: config.api?.schemasDocumentationPath,
        routesDocumentationPath: config.api?.routesDocumentationPath,
        versionIndex: config.api?.versionIndex !== false
    });
    
    // Setup security hooks
    setupSecurityHooks(fastify, meta, config.upgradeInsecureRequests);
    
    return fastify;
};

module.exports = {
    bootstrap
};
