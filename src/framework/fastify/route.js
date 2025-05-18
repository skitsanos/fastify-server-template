/**
 * @author skitsanos
 * Base Route class for Fastify
 */

class Route {
    /**
     * Create a new route
     * @param {Object} instance - Fastify instance
     * @param {Object} config - Route configuration
     */
    constructor(instance, config) {
        this.instance = instance;
        this.config = config || {};

        // Set default configuration values if not provided
        this.config.method = this.config.method || 'GET';
        this.config.url = this.config.url || '/';
        this.config.schema = this.config.schema || {};
    }

    /**
     * Default route handler
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async handler(req, res) {
        res.send({
            error: {
                message: 'Route handler not implemented'
            }
        });
    }

    /**
     * Middleware to execute before route handler
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async beforeHandler(req, res) {
        // Override in subclasses if needed
    }

    /**
     * Middleware to execute after route handler
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {*} payload - Response payload
     * @returns {*} Modified payload
     */
    async onSend(req, res, payload) {
        // Override in subclasses if needed
        return payload;
    }

    /**
     * Hook to execute after response is sent
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async onResponse(req, res) {
        // Override in subclasses if needed
    }

    /**
     * Get route documentation info for Swagger/OpenAPI
     * @returns {Object} Documentation object
     */
    getDocumentation() {
        return {
            method: this.config.method,
            url: this.config.url,
            description: this.config.description || '',
            tags: this.config.tags || [],
            summary: this.config.summary || '',
            schema: this.config.schema
        };
    }
}

module.exports = Route;