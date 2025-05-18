/**
 * @author skitsanos
 * Base class for Fastify routes
 */

class FastifyRoute {
	/**
	 * Create a new route
	 * @param {Object} instance - Fastify instance
	 * @param {Object} config - Route configuration
	 */
	constructor(instance, config) {
		// Default configuration
		this.config = {
			method: 'GET',
			url: '/',
			...config
		};

		// Ensure logLevel is set
		this.config.logLevel = this.config.logLevel || 'info';

		this.instance = instance;
	}

	/**
	 * Route handler - override in subclasses
	 * @param {Object} request - Fastify request object
	 * @param {Object} response - Fastify response object
	 * @returns {Promise<void>}
	 */
	async handler(request, response) {
		try {
			// Check for validation errors
			if (request.validationError) {
				response.status(400).send({
					error: { message: request.validationError.message },
					validation: request.validationError.validation
				});
				return;
			}
			
			// Return 501 Not Implemented if handler isn't overridden
			response.status(501).send({
				error: { message: 'Not implemented' }
			});
		} catch (err) {
			// Log the error
			this.instance.log.error(`Error in route handler: ${err.message}`);
			
			// Send appropriate error response
			response.status(500).send({
				error: { message: 'Internal server error' }
			});
		}
	}

	/**
	 * Helper method to render templates if view engine is configured
	 * @param {string|Object} template - Template string or object with file property
	 * @param {Object} data - Data to render in the template
	 * @returns {string} - Rendered HTML
	 */
	render(template, data) {
		if (!this.instance.render) {
			throw new Error('View engine not configured');
		}
		return this.instance.render(template, data);
	}
}

module.exports = FastifyRoute;