/**
 * @author skitsanos
 * Error handling configuration
 */

/**
 * Setup error handlers for Fastify
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<void>}
 */
const setupErrorHandlers = async (fastify) => {
    // Handle 'not found' requests
    await fastify.register(async (instance) => {
        instance.setNotFoundHandler((req, res) => {
            res.send({
                error: {
                    message: 'Resource not found',
                    url: req.raw.url
                }
            });
        });
    });

    // Global error handler
    fastify.setErrorHandler((error, req, res) => {
        res.status(error.statusCode).send({error: {message: error.message}});
    });
};

module.exports = {
    setupErrorHandlers
};
