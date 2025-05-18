/**
 * @author skitsanos
 * Fastify server instance configuration
 */

const fastify = require('fastify');
const {setupLogging} = require('./logging');

/**
 * Create and configure a Fastify server instance
 * @param {Object} serverConfig - Server configuration object
 * @returns {Object} Configured Fastify instance
 */
const createServer = (serverConfig) => {
    // Create Fastify instance with configuration
    const server = fastify({
        logger: {
            level: serverConfig.logging?.level || 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    colorize: true,
                    singleLine: true
                }
            },
            // We'll use minimal serialization and rely on our custom logger
            serializers: {
                req(request) {
                    return {
                        method: request.method,
                        url: request.url,
                        remoteAddress: request.ip
                    };
                },
                res(response) {
                    return {
                        statusCode: response.statusCode
                    };
                }
            }
        },
        disableRequestLogging: true, // We'll use our custom logger instead
        ignoreTrailingSlash: serverConfig.strictRouting,
        maxParamLength: serverConfig.parsers.maxParamLength,
        caseSensitive: serverConfig.parsers.caseSensitive,
        bodyLimit: serverConfig.parsers.bodyLimit
    });

    // Setup enhanced logging for application logs
    setupLogging(server);

    return server;
};

module.exports = {createServer};
