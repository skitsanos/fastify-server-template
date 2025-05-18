/**
 * @author skitsanos
 * Enhanced Route loader for Fastify
 */

const fs = require('fs');
const path = require('path');
const ExecutionTime = require('../utils/execTime');

class RouteLoader {
    constructor(fastify, options = {}) {
        this.fastify = fastify;
        this.options = options;
        this.log = options.log || fastify.log;
        this.routesDir = options.routesDir || path.join(process.cwd(), '/src/routes/');
        this.routes = []; // Store all registered routes
        this.versions = new Set(); // Track API versions
    }

    /**
     * Extract API version from path, if it exists
     * @param {string} routePath - Path to the route file
     * @returns {string|null} Version string or null if no version
     */
    extractVersion(routePath) {
        // Get the relative path from routes directory
        const relativePath = path.relative(this.routesDir, routePath);
        const pathParts = relativePath.split(path.sep);
        
        // Check if the first directory is 'api' and the second is a version
        if (pathParts[0] === 'api' && pathParts.length > 1) {
            const versionMatch = pathParts[1].match(/^v(\d+)$/i);
            if (versionMatch) {
                return pathParts[1].toLowerCase(); // Return normalized version (e.g., 'v1')
            }
        }
        
        return null;
    }

    /**
     * Process a single route handler file
     * @param {string} routePath - Path to the route handler file
     */
    processRouteHandler(routePath) {
        try {
            const timer = new ExecutionTime();
            this.log.debug(`Processing route: '${routePath}'`);
            
            // Validate file format (ensuring it's a JavaScript file)
            if (!routePath.endsWith('.js')) {
                this.log.warn(`Skipping non-JavaScript file: ${routePath}`);
                return;
            }
            
            // Handle file requiring
            let RouteClass;
            try {
                RouteClass = require(routePath);
            } catch (requireErr) {
                this.log.error(`Failed to require route file ${routePath}: ${requireErr.message}`);
                return;
            }
            
            // Instantiate route
            let route;
            try {
                route = new RouteClass(this.fastify);
            } catch (instantiationErr) {
                this.log.error(`Failed to instantiate route ${routePath}: ${instantiationErr.message}`);
                return;
            }
            
            // Verify that required properties exist
            if (!route.config || !route.config.url || !route.config.method) {
                this.log.error(`Invalid route configuration in ${routePath}: Missing required properties`);
                return;
            }
            
            // Extract version information if path contains it
            const version = this.extractVersion(routePath);
            if (version) {
                this.versions.add(version);
                
                // Modify URL to include version prefix if not already present
                if (!route.config.url.startsWith(`/${version}`)) {
                    // Preserve leading slash
                    route.config.url = `/${version}${route.config.url.startsWith('/') ? route.config.url : '/' + route.config.url}`;
                }
            }
            
            this.log.info(`Registering ${route.config.url} for ${Array.isArray(route.config.method) ? route.config.method.join(',') : route.config.method}`);

            // Add lifecycle hooks if defined in the route
            const options = { ...route.config };
            options.handler = route.handler.bind(route);
            
            if (typeof route.beforeHandler === 'function') {
                options.beforeHandler = route.beforeHandler.bind(route);
            }
            
            if (typeof route.onSend === 'function') {
                options.onSend = route.onSend.bind(route);
            }
            
            if (typeof route.onResponse === 'function') {
                options.onResponse = route.onResponse.bind(route);
            }
            
            // Register the main route
            this.fastify.route(options);
            
            // Track registered route for documentation
            this.routes.push({
                path: routePath,
                url: route.config.url,
                method: route.config.method,
                version: version,
                documentation: route.getDocumentation ? route.getDocumentation() : null
            });

            // Process aliases
            if (route.config.alias) {
                this.processRouteAliases(route, version);
            }
            
            const duration = timer.duration();
            this.log.debug(`Route '${routePath}' processed in ${duration}ms`);
        } catch (err) {
            this.log.error(`Error processing route ${routePath}: ${err.message}`);
        }
    }

    /**
     * Process route aliases
     * @param {Object} route - Route instance
     * @param {string|null} version - API version if present
     */
    processRouteAliases(route, version) {
        this.log.debug(`Processing aliases for ${route.config.url}...`);
        
        const alias = route.config.alias;
        const aliasedOptions = { ...route.config };
        aliasedOptions.handler = route.handler.bind(route);
        
        // Add lifecycle hooks if defined
        if (typeof route.beforeHandler === 'function') {
            aliasedOptions.beforeHandler = route.beforeHandler.bind(route);
        }
        
        if (typeof route.onSend === 'function') {
            aliasedOptions.onSend = route.onSend.bind(route);
        }
        
        if (typeof route.onResponse === 'function') {
            aliasedOptions.onResponse = route.onResponse.bind(route);
        }
        
        // Remove the alias property to avoid conflicts
        delete aliasedOptions.alias;

        if (typeof alias === 'string') {
            // Handle single string alias
            let aliasUrl = alias;
            
            // Add version prefix if needed
            if (version && !aliasUrl.startsWith(`/${version}`)) {
                aliasUrl = `/${version}${aliasUrl.startsWith('/') ? aliasUrl : '/' + aliasUrl}`;
            }
            
            aliasedOptions.url = aliasUrl;
            this.fastify.route(aliasedOptions);
            
            // Track alias for documentation
            this.routes.push({
                url: aliasUrl,
                method: aliasedOptions.method,
                version: version,
                isAlias: true,
                originalUrl: route.config.url,
                documentation: null // Aliases don't get separate documentation
            });
        } else if (Array.isArray(alias)) {
            // Handle array of aliases
            for (const aliasItem of alias) {
                let aliasUrl = aliasItem;
                
                // Add version prefix if needed
                if (version && !aliasUrl.startsWith(`/${version}`)) {
                    aliasUrl = `/${version}${aliasUrl.startsWith('/') ? aliasUrl : '/' + aliasUrl}`;
                }
                
                const eachAliasOption = { ...aliasedOptions };
                eachAliasOption.url = aliasUrl;
                this.fastify.route(eachAliasOption);
                
                // Track alias for documentation
                this.routes.push({
                    url: aliasUrl,
                    method: eachAliasOption.method,
                    version: version,
                    isAlias: true,
                    originalUrl: route.config.url,
                    documentation: null
                });
            }
        } else {
            this.log.warn(`Unknown route.config.alias type: ${typeof alias}`);
        }
    }

    /**
     * Recursively scan directories for route files
     * @param {string} dirPath - Directory path to scan
     */
    scanRouteDirectory(dirPath) {
        try {
            const timer = new ExecutionTime();
            this.log.debug(`Scanning directory: ${dirPath}`);
            
            // Ensure directory exists
            if (!fs.existsSync(dirPath)) {
                this.log.warn(`Directory not found: ${dirPath}`);
                return;
            }
            
            const files = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const file of files) {
                const filePath = path.join(dirPath, file.name);
                
                // Skip hidden files and directories
                if (file.name.startsWith('.')) {
                    this.log.debug(`Skipping hidden file/directory: ${file.name}`);
                    continue;
                }
                
                if (file.isDirectory()) {
                    // Recursively scan subdirectories
                    this.scanRouteDirectory(filePath);
                } else if (file.isFile() && file.name.endsWith('.js')) {
                    // Process each JavaScript route file
                    this.processRouteHandler(filePath);
                }
            }
            
            const duration = timer.duration();
            this.log.debug(`Directory scan of '${dirPath}' completed in ${duration}ms`);
        } catch (err) {
            this.log.error(`Error scanning directory ${dirPath}: ${err.message}`);
        }
    }

    /**
     * Register routes documentation endpoint if enabled
     */
    registerRoutesDocumentation() {
        // Skip if documentation is disabled
        if (this.options.documentation === false) {
            return;
        }
        
        const docPath = this.options.documentationPath || '/api/routes';
        
        this.fastify.get(docPath, (req, reply) => {
            // Format routes into a structured documentation response
            const docs = {
                total: this.routes.length,
                versions: Array.from(this.versions),
                routes: this.routes.map(route => ({
                    url: route.url,
                    method: route.method,
                    version: route.version || 'default',
                    isAlias: !!route.isAlias,
                    originalUrl: route.originalUrl,
                    documentation: route.documentation || {}
                }))
            };
            
            reply.send({ result: docs });
        });
        
        this.log.info(`Routes documentation registered at ${docPath}`);
    }

    /**
     * Register auto-generated version index routes for each API version
     */
    registerVersionIndexRoutes() {
        // Skip if version index routes are disabled
        if (this.options.versionIndex === false) {
            return;
        }
        
        for (const version of this.versions) {
            const versionPath = `/${version}`;
            
            // Register a GET handler for the version root path
            this.fastify.get(versionPath, (req, reply) => {
                // Filter routes for this version and create a list of available endpoints
                const endpointsList = this.routes
                    .filter(route => route.version === version && !route.isAlias)
                    .map(route => ({
                        url: route.url,
                        method: route.method,
                        description: route.documentation?.description || ''
                    }));
                
                reply.send({
                    result: {
                        version: version,
                        endpoints: endpointsList
                    }
                });
            });
            
            this.log.info(`Version index route registered at ${versionPath}`);
        }
    }

    /**
     * Load all route handlers from the routes directory
     */
    loadRoutes() {
        try {
            const timer = new ExecutionTime();
            this.log.info(`Loading routes from ${this.routesDir}`);
            
            // Create routes directory if it doesn't exist
            if (!fs.existsSync(this.routesDir)) {
                fs.mkdirSync(this.routesDir, { recursive: true });
                this.log.info(`Created routes directory: ${this.routesDir}`);
            }

            // Scan and load routes
            this.scanRouteDirectory(this.routesDir);
            
            // Register documentation endpoint
            this.registerRoutesDocumentation();
            
            // Register version index routes
            this.registerVersionIndexRoutes();
            
            const duration = timer.duration();
            this.log.info(`Loaded ${this.routes.length} routes in ${duration}ms`);
        } catch (err) {
            this.log.error(`Error loading routes: ${err.message}`);
        }
    }

    /**
     * Get list of registered routes
     * @returns {Array} Array of registered routes
     */
    getRoutes() {
        return this.routes;
    }
    
    /**
     * Get list of registered API versions
     * @returns {Array} Array of API versions
     */
    getVersions() {
        return Array.from(this.versions);
    }
}

module.exports = RouteLoader;