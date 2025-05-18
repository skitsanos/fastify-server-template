/**
 * @author skitsanos
 * Logging configuration and utilities
 */

const dayjs = require('dayjs');

/**
 * Format timestamp for logging
 * @returns {string} Formatted timestamp
 */
const timestamp = () => dayjs().format('DD/MMM/YYYY:HH:mm:ss ZZ');

/**
 * Setup enhanced logging for Fastify (for non-HTTP request logs)
 * @param {Object} fastify - Fastify instance
 */
const setupLogging = (fastify) => {
    // We'll leave the default logging as is, as our HTTP logger will handle request logs
    // No need to override the log methods for now
};

module.exports = {
    timestamp,
    setupLogging
};
