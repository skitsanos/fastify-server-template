/**
 * @author skitsanos
 * Custom HTTP logger for Fastify
 */

const fp = require('fastify-plugin');
const dayjs = require('dayjs');

/**
 * Fastify plugin for nginx-style HTTP logging
 * @param {Object} fastify - Fastify instance
 * @param {Object} options - Plugin options
 */
async function httpLogger(fastify, options = {}) {
    // Skip if request logging is disabled
    if (options.disabled) {
        return;
    }
    
    // Create a consistent timestamp format
    const getTimestamp = () => dayjs().format(options.timeFormat || 'DD/MMM/YYYY:HH:mm:ss ZZ');
    
    // Install request hook to capture start time
    fastify.addHook('onRequest', (request, reply, done) => {
        // Store the request start time
        request.startTime = process.hrtime();
        done();
    });
    
    // Install response hook to log complete request
    fastify.addHook('onResponse', (request, reply, done) => {
        // Calculate request duration
        const hrDuration = process.hrtime(request.startTime);
        const duration = Math.round(hrDuration[0] * 1000 + hrDuration[1] / 1000000);
        
        // Gather request data
        const remoteAddress = request.ip || '-';
        const method = request.method || '-';
        const url = request.url || '-';
        const status = reply.statusCode || '-';
        const userAgent = request.headers['user-agent'] || '-';
        const referrer = request.headers.referer || '-';
        
        // Format log entry in nginx-like format
        // Format: IP - - [timestamp] "METHOD URL HTTP/1.1" STATUS duration "REFERRER" "USER_AGENT"
        const logMessage = `${remoteAddress} - - [${getTimestamp()}] "${method} ${url} HTTP/1.1" ${status} ${duration}ms "${referrer}" "${userAgent}"`;
        
        // Log at the appropriate level based on status code
        if (status >= 500) {
            fastify.log.error(logMessage);
        } else if (status >= 400) {
            fastify.log.warn(logMessage);
        } else {
            fastify.log.info(logMessage);
        }
        
        done();
    });
}

// Export the plugin
module.exports = fp(httpLogger, {
    name: 'http-logger',
    fastify: '>=3.0.0'
});
