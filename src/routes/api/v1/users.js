/**
 * @author skitsanos
 * Example API v1 Users route
 */

const Route = require(process.cwd() + '/src/framework/fastify/route');

class UsersRoute extends Route {
    constructor(instance) {
        const config = {
            method: 'GET',
            url: '/users',
            description: 'Get a list of users',
            tags: ['users', 'api'],
            summary: 'Returns a list of system users',
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            result: {
                                type: 'object',
                                properties: {
                                    users: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer' },
                                                name: { type: 'string' },
                                                email: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        super(instance, config);
    }

    /**
     * Handle request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async handler(req, res) {
        // Sample users data
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ];

        res.send({
            result: {
                users
            }
        });
    }

    /**
     * Log before handling request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async beforeHandler(req, res) {
        this.instance.log.info(`API v1 - Processing users request from ${req.ip}`);
    }

    /**
     * Add metadata to response
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {*} payload - Response payload
     * @returns {*} Modified payload
     */
    async onSend(req, res, payload) {
        const modifiedPayload = JSON.parse(payload);
        modifiedPayload.meta = {
            timestamp: new Date().toISOString(),
            version: 'v1'
        };
        return JSON.stringify(modifiedPayload);
    }
}

module.exports = UsersRoute;