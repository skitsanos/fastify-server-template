/**
 * @author skitsanos
 * Loader for schemas and routes
 */

/**
 * Load all schemas and routes
 * @param {Object} fastify - Fastify instance
 * @param {Object} options - Loader options
 */
const loadSchemasAndRoutes = (fastify, options = {}) => {
    // Load schemas
    const SchemaLoader = require('../framework/routing/schemaLoader');
    const schemaLoader = new SchemaLoader(fastify, {
        log: fastify.log,
        documentation: options.documentation !== false,
        documentationPath: options.schemasDocumentationPath
    });
    schemaLoader.loadSchemas();

    // Load routes
    const RouteLoader = require('../framework/routing/routeLoader');
    const routeLoader = new RouteLoader(fastify, {
        log: fastify.log,
        documentation: options.documentation !== false,
        documentationPath: options.routesDocumentationPath,
        versionIndex: options.versionIndex !== false
    });
    routeLoader.loadRoutes();
    
    return {
        schemaLoader,
        routeLoader
    };
};

module.exports = {
    loadSchemasAndRoutes
};
