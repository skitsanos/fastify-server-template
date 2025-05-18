/**
 * @author skitsanos
 * Example API v2 Users route with enhanced capabilities
 */

const Route = require(process.cwd() + '/src/framework/fastify/route');

class UsersRoute extends Route {
    constructor(instance) {
        const config = {
            method: 'GET',
            url: '/users',
            description: 'Get a list of users with extended data',
            tags: ['users', 'api'],
            summary: 'Returns a list of system users with enhanced information',
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        limit: { type: 'integer', default: 10 },
                        offset: { type: 'integer', default: 0 },
                        sort: { type: 'string', enum: ['name', 'id', 'email'], default: 'id' }
                    }
                },
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
                                                email: { type: 'string' },
                                                role: { type: 'string' },
                                                createdAt: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    },
                                    total: { type: 'integer' },
                                    page: { type: 'object' },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            limit: { type: 'integer' },
                                            offset: { type: 'integer' },
                                            total: { type: 'integer' }
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
        // Get query parameters
        const { limit = 10, offset = 0, sort = 'id' } = req.query;
        
        // Sample enhanced users data
        const users = [
            { 
                id: 1, 
                name: 'John Doe', 
                email: 'john@example.com', 
                role: 'admin', 
                createdAt: '2023-01-15T12:00:00Z' 
            },
            { 
                id: 2, 
                name: 'Jane Smith', 
                email: 'jane@example.com', 
                role: 'user',
                createdAt: '2023-02-20T14:30:00Z'
            },
            { 
                id: 3, 
                name: 'Alice Brown', 
                email: 'alice@example.com', 
                role: 'user',
                createdAt: '2023-03-10T09:15:00Z'
            }
        ];
        
        // Apply sorting
        users.sort((a, b) => {
            if (sort === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sort === 'email') {
                return a.email.localeCompare(b.email);
            }
            return a.id - b.id; // Default sort by id
        });
        
        // Apply pagination
        const paginatedUsers = users.slice(offset, offset + limit);
        
        // Calculate pagination info
        const total = users.length;
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        // Return response with pagination
        res.send({
            result: {
                users: paginatedUsers,
                total: total,
                pagination: {
                    limit: limit,
                    offset: offset,
                    total: total,
                    totalPages: totalPages,
                    currentPage: currentPage
                }
            }
        });
    }

    /**
     * Log before handling request
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async beforeHandler(req, res) {
        this.instance.log.info(`API v2 - Processing users request from ${req.ip} with params: ${JSON.stringify(req.query)}`);
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
            version: 'v2',
            params: req.query
        };
        return JSON.stringify(modifiedPayload);
    }
}

module.exports = UsersRoute;