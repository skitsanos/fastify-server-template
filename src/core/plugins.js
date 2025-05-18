/**
 * @author skitsanos
 * Fastify plugin manager
 */

const fs = require('fs');
const path = require('path');

/**
 * Setup custom HTTP logger
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Server configuration
 * @returns {Promise<void>}
 */
const setupHttpLogger = async (fastify, config) => {
    if (config.logging?.request) {
        // Register our custom HTTP logger
        await fastify.register(require('../framework/plugins/httpLogger'), {
            timeFormat: config.logging?.timeFormat || 'DD/MMM/YYYY:HH:mm:ss ZZ',
            disabled: !config.logging?.request
        });
        
        fastify.log.info('Custom HTTP logger: enabled');
    }
};

/**
 * Setup static content serving
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Static content configuration
 * @returns {Promise<void>}
 */
const setupStaticContent = async (fastify, config) => {
    if (config && config.root) {
        const staticPath = path.join(process.cwd(), config.root);
        if (fs.existsSync(staticPath)) {
            await fastify.register(require('@fastify/static'), {
                root: staticPath
            });
            fastify.log.info(`Static content enabled: ${config.root}`);
        } else {
            fastify.log.warn(`Static content path '${config.root}' not found`);
        }
    }
};

/**
 * Setup cookie support
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Cookie configuration
 * @returns {Promise<void>}
 */
const setupCookies = async (fastify, config) => {
    if (config) {
        await fastify.register(require('@fastify/cookie'), config.config || {});
        fastify.log.info('Cookies support: enabled');
    }
};

/**
 * Setup view engine
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - View engine configuration
 * @param {Object} meta - Application metadata
 * @returns {Promise<void>}
 */
const setupViewEngine = async (fastify, config, meta) => {
    if (config) {
        switch (config.engine.toLowerCase()) {
            case 'handlebars': {
                const HandlebarsViewEngine = require('../framework/viewEngines/handlebars');
                const viewEngine = new HandlebarsViewEngine(fastify, {
                    ...config,
                    meta,
                    log: fastify.log
                });
                
                // Register the render function
                fastify.render = (template, data) => viewEngine.render(template, data);
                fastify.log.info('View engine: handlebars');
                break;
            }
            default:
                fastify.log.warn(`View engine ${config.engine} is not supported`);
                break;
        }
    }
};

/**
 * Setup CORS
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<void>}
 */
const setupCors = async (fastify) => {
    const corsFile = path.join(process.cwd(), 'src/config/cors.json');
    if (fs.existsSync(corsFile)) {
        fastify.log.info('Processing CORS options');
        await fastify.register(require('@fastify/cors'), require(corsFile));
    }
};

/**
 * Setup request parsers
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Parser configuration
 * @returns {Promise<void>}
 */
const setupParsers = async (fastify, config) => {
    if (config.accepts) {
        await fastify.register(require('@fastify/accepts'));
        fastify.log.info('Accepts parser: enabled');
    }
};

/**
 * Register all plugins
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Server configuration
 * @param {Object} meta - Application metadata
 * @returns {Promise<void>}
 */
const registerPlugins = async (fastify, config, meta) => {
    // The HTTP logger should be registered first to capture all requests
    await setupHttpLogger(fastify, config);
    
    await setupStaticContent(fastify, config.static);
    await setupCookies(fastify, config.cookies);
    await setupViewEngine(fastify, config.viewEngine, meta);
    await setupCors(fastify);
    await setupParsers(fastify, config.parsers);
};

module.exports = {
    registerPlugins,
    setupHttpLogger,
    setupStaticContent,
    setupCookies,
    setupViewEngine,
    setupCors,
    setupParsers
};
